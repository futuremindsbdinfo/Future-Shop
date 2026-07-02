<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

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
            'password' => ['required', 'string', 'min:6'],
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
            'identifier' => ['required', 'string'],
            'password' => ['required', 'string'],
        ]);

        $identifier = $data['identifier'];
        $field = filter_var($identifier, FILTER_VALIDATE_EMAIL) ? 'email' : 'phone';

        $user = User::where($field, $identifier)->first();

        // Generic error message to prevent user enumeration
        if (! $user || empty($user->password) || ! Hash::check($data['password'], $user->password)) {
            throw ValidationException::withMessages([
                'identifier' => ['ভুল তথ্য প্রদান করা হয়েছে।'],
            ]);
        }

        if (! $user->is_active) {
            throw ValidationException::withMessages([
                'identifier' => ['This account is inactive.'],
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

        $updateData = ['name' => $data['name']];

        if (array_key_exists('email', $data) && $user->email !== $data['email']) {
            $updateData['email'] = $data['email'];
            $updateData['email_verified_at'] = null;
        }

        $user->update($updateData);

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
            'password' => ['required', 'confirmed', 'string', 'min:6'],
        ]);

        // Users created via OTP may have no password yet — allow setting one then.
        if ($user->password && ! Hash::check($data['current_password'], $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['বর্তমান পাসওয়ার্ড সঠিক নয়।'],
            ]);
        }

        $user->update(['password' => $data['password']]);

        // Security: Revoke all OTHER tokens so compromised sessions are terminated.
        $user->tokens()->where('id', '!=', $user->currentAccessToken()->id)->delete();

        return response()->json(['message' => 'পাসওয়ার্ড পরিবর্তন হয়েছে।']);
    }
}
