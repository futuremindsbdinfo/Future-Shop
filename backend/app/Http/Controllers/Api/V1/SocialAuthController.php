<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\SocialAccount;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Cookie;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;

class SocialAuthController extends Controller
{
    private array $allowedProviders = ['google'];

    public function redirect(string $provider)
    {
        if (!in_array($provider, $this->allowedProviders)) {
            return response()->json(['message' => 'Invalid provider'], 400);
        }

        $state = Str::random(40);
        Cache::put('oauth_state_'.$state, true, now()->addMinutes(5));

        $cookie = cookie('oauth_state', $state, 5, '/', null, app()->environment('production'), true, false, 'lax');

        return Socialite::driver($provider)
            ->stateless()
            ->with(['state' => $state])
            ->redirect()
            ->withCookie($cookie);
    }

    public function callback(Request $request, string $provider)
    {
        if (!in_array($provider, $this->allowedProviders)) {
            return response()->json(['message' => 'Invalid provider'], 400);
        }

        // Fix #3a & #6: Verify state parameter and cookie to prevent CSRF
        $requestState = $request->input('state');
        $cookieState = $request->cookie('oauth_state');

        if (!$requestState || !$cookieState || $requestState !== $cookieState || !Cache::has('oauth_state_'.$requestState)) {
            return response()->json(['message' => 'Invalid or expired state'], 403);
        }
        
        Cache::forget('oauth_state_'.$requestState);

        try {
            $socialUser = Socialite::driver($provider)->stateless()->user();
        } catch (\Exception $e) {
            return response()->json(['message' => 'Authentication failed'], 401);
        }

        $frontendUrl = rtrim(config('services.frontend.url'), '/');

        // STRICT verified-email gate — runs BEFORE any account lookup, create,
        // link, or login. The provider must positively assert email_verified
        // === true; absent/false/anything-else is rejected. This is what makes
        // email-based account matching below takeover-proof: an attacker cannot
        // present someone else's address without the provider having verified it.
        $emailVerified = ($socialUser->user['email_verified'] ?? null) === true;
        if (! $emailVerified) {
            return redirect($frontendUrl.'/auth/callback?error=email_unverified')
                ->withCookie(Cookie::forget('oauth_state'));
        }

        // Fix #2: Reject if email is null/empty
        $email = $socialUser->getEmail();
        if (empty($email)) {
            return response()->json(['message' => 'ইমেইল ছাড়া login সম্ভব নয়'], 400);
        }

        // Check if the social account is already linked
        $socialAccount = SocialAccount::where('provider', $provider)
            ->where('provider_id', $socialUser->getId())
            ->first();

        if ($socialAccount) {
            $user = $socialAccount->user;
        } else {
            // Match an existing account by email. Linking on email alone is safe
            // ONLY because the strict verified-email gate above already ran —
            // the provider has confirmed the caller owns this address.
            $user = User::where('email', $email)->first();

            if (! $user) {
                // Create a new user
                $user = User::create([
                    'name' => $socialUser->getName() ?? 'User',
                    'email' => $email,
                    'phone' => null, // Allowed since phone is nullable in migration
                    'password' => Hash::make(Str::random(24)), // Random password since social users don't have one
                    'role' => 'customer',
                    'is_active' => true,
                ]);

                // The provider verified this email (gate above), so record it.
                // forceFill on purpose: email_verified_at is deliberately NOT in
                // $fillable, so the public register endpoint can never self-verify.
                $user->forceFill(['email_verified_at' => now()])->save();
            }

            // Link the social account to the user
            $user->socialAccounts()->create([
                'provider' => $provider,
                'provider_id' => $socialUser->getId(),
            ]);
        }

        // Inactive accounts get no token. Browser flow, so redirect with an
        // error flag (a JSON exception would strand the user on the API origin).
        if (! $user->is_active) {
            return redirect($frontendUrl.'/auth/callback?error=account_inactive')
                ->withCookie(Cookie::forget('oauth_state'));
        }

        // Issue token
        $token = $user->createToken('api')->plainTextToken;

        // Never put the token itself in the URL — query strings persist in
        // browser history, Referer headers and access logs. Hand the frontend a
        // one-time 60-second exchange code instead; it swaps the code for the
        // token via POST /auth/social/exchange.
        $exchangeCode = Str::random(64);
        Cache::put('oauth_exchange_'.$exchangeCode, $token, now()->addSeconds(60));

        return redirect($frontendUrl.'/auth/callback?code='.$exchangeCode)
            ->withCookie(Cookie::forget('oauth_state'));
    }

    /**
     * POST /auth/social/exchange — swap a one-time OAuth exchange code for the
     * Sanctum token. Cache::pull reads and deletes atomically, so a code can
     * only ever be redeemed once; the 60s TTL bounds the window. The code is
     * never logged.
     */
    public function exchange(Request $request): JsonResponse
    {
        $data = $request->validate([
            'code' => ['required', 'string', 'size:64'],
        ]);

        $token = Cache::pull('oauth_exchange_'.$data['code']);

        if (! $token) {
            return response()->json(['message' => 'Invalid or expired code'], 401);
        }

        return response()->json(['token' => $token]);
    }
}
