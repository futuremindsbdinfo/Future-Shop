<?php

use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

/*
|--------------------------------------------------------------------------
| One-time storage:link helper
| Hit: https://api.fuminds.com/setup-storage-link
| Delete this route after running once.
|--------------------------------------------------------------------------
*/
Route::get('/setup-storage-link', function () {
    try {
        $target = storage_path('app/public');
        $link   = public_path('storage');

        if (is_link($link)) {
            return response()->json([
                'status'  => 'already_linked',
                'message' => 'Storage symlink already exists.',
                'link'    => $link,
                'target'  => $target,
            ]);
        }

        Artisan::call('storage:link');
        $output = Artisan::output();

        return response()->json([
            'status'  => 'success',
            'message' => 'Storage link created successfully!',
            'output'  => $output,
            'link'    => $link,
            'target'  => $target,
            'exists'  => is_link($link),
        ]);
    } catch (\Throwable $e) {
        return response()->json([
            'status'  => 'error',
            'message' => $e->getMessage(),
        ], 500);
    }
});
