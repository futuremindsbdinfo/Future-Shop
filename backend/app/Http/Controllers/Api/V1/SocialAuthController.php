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
            // Check if a user with this email already exists
            $user = User::where('email', $email)->first();

            if ($user) {
                // Fix #1: Check email verified status before linking to existing account
                $isVerified = $socialUser->user['email_verified'] ?? false;
                
                // Only enforce verified check for Google (Facebook handles it differently, skipping for now)
                if ($provider === 'google' && !$isVerified) {
                    return response()->json(['message' => 'Unverified Google accounts cannot be linked.'], 403);
                }
            } else {
                // Create a new user
                $user = User::create([
                    'name' => $socialUser->getName() ?? 'User',
                    'email' => $email,
                    'phone' => null, // Allowed since phone is nullable in migration
                    'password' => Hash::make(Str::random(24)), // Random password since social users don't have one
                    'role' => 'customer',
                    'email_verified_at' => now(), // Assume verified if coming from Google/Facebook
                    'is_active' => true,
                ]);
            }

            // Link the social account to the user
            $user->socialAccounts()->create([
                'provider' => $provider,
                'provider_id' => $socialUser->getId(),
            ]);
        }

        // Fix #4: Check if user is active before issuing token
        if (! $user->is_active) {
            throw \Illuminate\Validation\ValidationException::withMessages([
                'identifier' => ['This account is inactive.'],
            ]);
        }

        // Issue token
        $token = $user->createToken('api')->plainTextToken;

        // Fix #3b: Redirect to frontend instead of returning JSON
        $frontendUrl = rtrim(config('services.frontend.url'), '/');
        
        return redirect($frontendUrl . '/auth/callback?token=' . $token)
            ->withCookie(Cookie::forget('oauth_state'));
    }
}
