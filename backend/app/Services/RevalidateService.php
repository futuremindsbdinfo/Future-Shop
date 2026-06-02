<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class RevalidateService
{
    /**
     * Ask the Next.js frontend to revalidate the given cache tags.
     * Fire-and-forget: failures are logged, never thrown (so admin saves
     * never fail just because the frontend is down).
     *
     * @param  array<int, string>  $tags
     */
    public function tags(array $tags): void
    {
        $url = rtrim((string) config('services.frontend.url'), '/');
        $secret = config('services.frontend.revalidate_secret');

        if ($url === '' || empty($secret) || $tags === []) {
            return;
        }

        try {
            Http::timeout(5)->post($url.'/api/revalidate', [
                'secret' => $secret,
                'tags' => $tags,
            ]);
        } catch (\Throwable $e) {
            Log::warning('Frontend revalidation failed', ['tags' => $tags, 'error' => $e->getMessage()]);
        }
    }
}
