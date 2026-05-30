<?php

use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\CartController;
use App\Http\Controllers\Api\V1\CategoryController;
use App\Http\Controllers\Api\V1\OrderController;
use App\Http\Controllers\Api\V1\PaymentController;
use App\Http\Controllers\Api\V1\ProductController;
use App\Http\Controllers\Api\V1\VendorController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API v1 routes
|--------------------------------------------------------------------------
| All routes are stateless and token-authenticated via Sanctum
| (Authorization: Bearer <token>). Grouped under the /api/v1 prefix.
*/

Route::prefix('v1')->name('api.v1.')->group(function () {

    /*
    | Public auth endpoints — rate limited to blunt brute-force / abuse.
    | throttle:6,1 = max 6 requests per minute per client.
    */
    Route::middleware('throttle:6,1')->group(function () {
        Route::post('auth/register', [AuthController::class, 'register'])->name('auth.register');
        Route::post('auth/login', [AuthController::class, 'login'])->name('auth.login');
    });

    /*
    | Public catalog (read-only).
    */
    Route::get('categories', [CategoryController::class, 'index'])->name('categories.index');
    Route::get('categories/{slug}', [CategoryController::class, 'show'])->name('categories.show');
    Route::get('products', [ProductController::class, 'index'])->name('products.index');
    Route::get('products/{slug}', [ProductController::class, 'show'])->name('products.show');

    /*
    | Cart — works for guests (X-Cart-Token header) and authenticated users
    | (Bearer token). Owner is resolved inside the controller.
    */
    Route::prefix('cart')->name('cart.')->group(function () {
        Route::get('/', [CartController::class, 'index'])->name('index');
        Route::post('items', [CartController::class, 'add'])->name('add');
        Route::match(['put', 'patch'], 'items/{product}', [CartController::class, 'update'])->name('update');
        Route::delete('items/{product}', [CartController::class, 'remove'])->name('remove');
        Route::delete('/', [CartController::class, 'clear'])->name('clear');
    });

    /*
    | SSLCommerz IPN webhooks — called server-to-server by the gateway, so no
    | Sanctum auth. Security is enforced by HMAC signature verification.
    */
    Route::post('payments/sslcommerz/success', [PaymentController::class, 'webhookSuccess'])->name('payments.success');
    Route::post('payments/sslcommerz/fail', [PaymentController::class, 'webhookFail'])->name('payments.fail');

    /*
    | Authenticated endpoints (any logged-in user).
    */
    Route::middleware('auth:sanctum')->group(function () {
        Route::get('auth/me', [AuthController::class, 'me'])->name('auth.me');
        Route::post('auth/logout', [AuthController::class, 'logout'])->name('auth.logout');

        // Merge a guest cart into the user's cart after login.
        Route::post('cart/merge', [CartController::class, 'merge'])->name('cart.merge');

        // Customer orders (a user only ever sees their own).
        Route::get('orders', [OrderController::class, 'index'])->name('orders.index');
        Route::post('orders', [OrderController::class, 'store'])->name('orders.store');
        Route::get('orders/{order}', [OrderController::class, 'show'])->name('orders.show');

        // Payments (authenticated customer actions).
        Route::post('payments/initiate', [PaymentController::class, 'initiate'])->name('payments.initiate');
        Route::post('payments/cod/{order}', [PaymentController::class, 'cod'])->name('payments.cod');

        /*
        | Role-gated areas. RoleMiddleware ('role') checks the authenticated
        | user's role and active status. Add controllers as features are built.
        */
        Route::middleware('role:admin')->prefix('admin')->name('admin.')->group(function () {
            // Product management (create / update / soft delete).
            Route::post('products', [ProductController::class, 'store'])->name('products.store');
            Route::match(['put', 'patch'], 'products/{product}', [ProductController::class, 'update'])->name('products.update');
            Route::delete('products/{product}', [ProductController::class, 'destroy'])->name('products.destroy');

            // Orders (all orders, with filters).
            Route::get('orders', [OrderController::class, 'adminIndex'])->name('orders.index');

            // Vendor management.
            Route::get('vendors', [VendorController::class, 'index'])->name('vendors.index');
            Route::post('vendors', [VendorController::class, 'store'])->name('vendors.store');
            Route::get('vendors/{vendor}', [VendorController::class, 'show'])->name('vendors.show');
            Route::match(['put', 'patch'], 'vendors/{vendor}', [VendorController::class, 'update'])->name('vendors.update');
        });

        Route::middleware('role:vendor')->prefix('vendor')->name('vendor.')->group(function () {
            // e.g. Route::apiResource('products', VendorProductController::class);
        });

        Route::middleware('role:delivery')->prefix('delivery')->name('delivery.')->group(function () {
            // e.g. delivery agent order endpoints
        });

        Route::middleware('role:customer')->prefix('account')->name('account.')->group(function () {
            // e.g. Route::apiResource('orders', CustomerOrderController::class);
        });
    });
});
