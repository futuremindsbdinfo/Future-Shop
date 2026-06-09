<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Illuminate\Validation\Rules\Password;

class AuthController extends Controller
{
    /**
     * Register a new customer account.
     *
     * Role is forced to "customer" — privileged roles are never self-assignable
     * through the public API.
     */
    public function register(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'max:255', 'unique:users,email'],
            'phone' => ['required', 'string', 'max:20', 'unique:users,phone'],
            'password' => ['required', Password::min(8)->mixedCase()->numbers()],
            'referral_code' => ['nullable', 'string', 'max:12'],
        ]);

        $referrerId = $this->resolveReferrer($data['referral_code'] ?? null, $data['phone']);

        // The User model's 'password' => 'hashed' cast bcrypts using BCRYPT_ROUNDS=12.
        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'] ?? null,
            'phone' => $data['phone'],
            'password' => $data['password'],
            'role' => 'customer',
            'is_active' => true,
            'referred_by_id' => $referrerId,
            // referral_code is auto-assigned via the User::boot() creating hook.
        ]);

        $token = $user->createToken('api')->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token,
            'token_type' => 'Bearer',
        ], 201);
    }

    /**
     * Authenticate and issue a personal access token.
     */
    public function login(Request $request): JsonResponse
    {
        $data = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $user = User::where('email', $data['email'])->first();

        if (! $user || ! Hash::check($data['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        if (! $user->is_active) {
            throw ValidationException::withMessages([
                'email' => ['This account is inactive.'],
            ]);
        }

        $token = $user->createToken('api')->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token,
            'token_type' => 'Bearer',
        ]);
    }

    /**
     * Send a 6-digit OTP for phone login.
     *
     * Scaffold only: the code is cached for 5 minutes. SMS delivery is a later
     * integration. In debug mode the code is echoed back to ease local testing.
     */
    public function sendOtp(Request $request): JsonResponse
    {
        $data = $request->validate([
            'phone' => ['required', 'string', 'max:20'],
        ]);

        $otp = str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        Cache::put($this->otpKey($data['phone']), $otp, now()->addMinutes(5));

        // TODO: dispatch SMS via provider here.

        $response = ['message' => 'OTP পাঠানো হয়েছে।'];
        if (config('app.debug')) {
            $response['otp'] = $otp; // dev-only convenience
        }

        return response()->json($response);
    }

    /**
     * Verify the OTP and log the user in (find-or-create by phone).
     */
    public function verifyOtp(Request $request): JsonResponse
    {
        $data = $request->validate([
            'phone' => ['required', 'string', 'max:20'],
            'otp' => ['required', 'string'],
            'referral_code' => ['nullable', 'string', 'max:12'],
        ]);

        $cached = Cache::get($this->otpKey($data['phone']));

        if ($cached === null || ! hash_equals($cached, $data['otp'])) {
            throw ValidationException::withMessages([
                'otp' => ['OTP সঠিক নয় বা মেয়াদ শেষ হয়ে গেছে।'],
            ]);
        }

        Cache::forget($this->otpKey($data['phone']));

        // Referral applies to the FIRST signup only; ignored if the phone already exists.
        $referrerId = $this->resolveReferrer($data['referral_code'] ?? null, $data['phone']);

        $user = User::firstOrCreate(
            ['phone' => $data['phone']],
            [
                'name' => 'Future Shop User',
                'role' => 'customer',
                'is_active' => true,
                'referred_by_id' => $referrerId,
                // referral_code auto-assigned via User::boot() creating hook.
            ],
        );

        // Ensure all columns (e.g. null email/password) are hydrated for the response.
        $user->refresh();

        if (! $user->is_active) {
            throw ValidationException::withMessages([
                'phone' => ['এই অ্যাকাউন্টটি নিষ্ক্রিয়।'],
            ]);
        }

        $token = $user->createToken('api')->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token,
            'token_type' => 'Bearer',
        ]);
    }

    private function otpKey(string $phone): string
    {
        return 'otp_'.$phone;
    }

    /**
     * Resolve a referral_code to a referrer user id.
     *
     * Returns null when the code is missing, invalid, points to an inactive user,
     * or matches the phone of the user being registered (self-referral guard).
     * Invalid/unknown codes are silently ignored — never surfaced as a 422 — to
     * avoid leaking which referral codes exist (enumeration prevention).
     */
    private function resolveReferrer(?string $code, string $registeringPhone): ?int
    {
        if ($code === null || $code === '') {
            return null;
        }

        $referrer = User::where('referral_code', $code)
            ->where('is_active', true)
            ->first();

        if (! $referrer) {
            return null;
        }

        // Self-referral prevention: registering user has no id yet, so compare phones.
        if ($referrer->phone === $registeringPhone) {
            return null;
        }

        return $referrer->id;
    }

    /**
     * Return the authenticated user.
     */
    public function me(Request $request): JsonResponse
    {
        return response()->json(['user' => $request->user()]);
    }

    /**
     * Revoke the token used for the current request.
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out.']);
    }

    /**
     * Update the authenticated user's profile (name, email). Phone is read-only.
     */
    public function updateProfile(Request $request): JsonResponse
    {
        $user = $request->user();

        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'max:255', 'unique:users,email,'.$user->id],
        ]);

        $user->update([
            'name' => $data['name'],
            'email' => $data['email'] ?? null,
        ]);

        return response()->json(['user' => $user->fresh()]);
    }

    /**
     * Change the authenticated user's password (verify current first).
     */
    public function changePassword(Request $request): JsonResponse
    {
        $user = $request->user();

        $data = $request->validate([
            'current_password' => ['required', 'string'],
            'password' => ['required', 'confirmed', Password::min(8)->mixedCase()->numbers()],
        ]);

        // Users created via OTP may have no password yet — allow setting one then.
        if ($user->password && ! Hash::check($data['current_password'], $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['বর্তমান পাসওয়ার্ড সঠিক নয়।'],
            ]);
        }

        $user->update(['password' => $data['password']]);

        return response()->json(['message' => 'পাসওয়ার্ড পরিবর্তন হয়েছে।']);
    }
}
