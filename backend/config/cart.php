<?php

return [

    /*
    | Cache store backing the cart. Uses the abstract cache repository so it can
    | run on any store locally and switch to Redis in production by setting
    | CART_STORE=redis (with a running Redis server). Defaults to the app's
    | configured cache store.
    */
    'store' => env('CART_STORE', env('CACHE_STORE', 'database')),

    /*
    | How long a cart persists with no activity (seconds). Default 7 days.
    */
    'ttl' => (int) env('CART_TTL', 60 * 60 * 24 * 7),

];
