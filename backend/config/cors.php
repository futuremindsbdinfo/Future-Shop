<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Here you may configure your settings for cross-origin resource sharing
    | or "CORS". This determines what cross-origin operations may execute
    | in web browsers. You are free to adjust these settings as needed.
    |
    | To learn more: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
    |
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    // Restrict to the Next.js frontend dev origin for now. Add production
    // origins here (or drive from env) before going live.
    'allowed_origins' => [
        env('FRONTEND_URL', 'http://localhost:3000'),
    ],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    // Expose WWW-Authenticate so the frontend can distinguish true Sanctum
    // auth failures (logout) from application-level 401s (just show error).
    'exposed_headers' => ['WWW-Authenticate'],

    'max_age' => 0,

    // Token-based (Bearer) auth does not need cookies; keep false unless you
    // switch to Sanctum SPA cookie mode.
    'supports_credentials' => false,

];
