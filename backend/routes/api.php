<?php

use App\Http\Controllers\Api\V1\AddressController;
use App\Http\Controllers\Api\V1\AdminController;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\BannerController;
use App\Http\Controllers\Api\V1\CartController;
use App\Http\Controllers\Api\V1\DeliveryController;
use App\Http\Controllers\Api\V1\SettingController;
use App\Http\Controllers\Api\V1\CategoryController;
use App\Http\Controllers\Api\V1\DeliveryZoneController;
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
        Route::post('auth/send-otp', [AuthController::class, 'sendOtp'])->name('auth.send-otp');
        Route::post('auth/verify-otp', [AuthController::class, 'verifyOtp'])->name('auth.verify-otp');
    });

    /*
    | Public catalog (read-only).
    */
    Route::get('categories', [CategoryController::class, 'index'])->name('categories.index');
    Route::get('categories/{slug}', [CategoryController::class, 'show'])->name('categories.show');
    Route::get('products', [ProductController::class, 'index'])->name('products.index');
    Route::get('products/{slug}', [ProductController::class, 'show'])->name('products.show');
    Route::get('delivery-zones', [DeliveryZoneController::class, 'index'])->name('delivery-zones.index');
    Route::get('settings', [SettingController::class, 'index'])->name('settings.index');
    Route::get('banners', [BannerController::class, 'publicIndex'])->name('banners.index');

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
        Route::put('auth/profile', [AuthController::class, 'updateProfile'])->name('auth.profile');
        Route::put('auth/password', [AuthController::class, 'changePassword'])->name('auth.password');

        // Saved addresses.
        Route::get('addresses', [AddressController::class, 'index'])->name('addresses.index');
        Route::post('addresses', [AddressController::class, 'store'])->name('addresses.store');
        Route::delete('addresses/{address}', [AddressController::class, 'destroy'])->name('addresses.destroy');

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
            // Dashboard summary.
            Route::get('dashboard', [AdminController::class, 'dashboard'])->name('dashboard');

            // Delivery agents (for order assignment).
            Route::get('delivery-users', [AdminController::class, 'deliveryUsers'])->name('delivery-users.index');

            // All categories (incl. inactive) for admin forms.
            Route::get('categories', [CategoryController::class, 'adminIndex'])->name('categories.index');

            // Product management (list / create / update / soft delete).
            Route::get('products', [ProductController::class, 'adminIndex'])->name('products.index');
            Route::get('products/{product}', [ProductController::class, 'adminShow'])->name('products.show');
            Route::post('products', [ProductController::class, 'store'])->name('products.store');
            Route::match(['put', 'patch'], 'products/{product}', [ProductController::class, 'update'])->name('products.update');
            Route::delete('products/{product}', [ProductController::class, 'destroy'])->name('products.destroy');

            // Orders (list with filters + status update).
            Route::get('orders', [OrderController::class, 'adminIndex'])->name('orders.index');
            Route::match(['put', 'patch'], 'orders/{order}', [OrderController::class, 'updateStatus'])->name('orders.update');

            // Vendor management.
            Route::get('vendors', [VendorController::class, 'index'])->name('vendors.index');
            Route::post('vendors', [VendorController::class, 'store'])->name('vendors.store');
            Route::get('vendors/{vendor}', [VendorController::class, 'show'])->name('vendors.show');
            Route::match(['put', 'patch'], 'vendors/{vendor}', [VendorController::class, 'update'])->name('vendors.update');

            // Delivery zones.
            Route::get('delivery-zones', [DeliveryZoneController::class, 'adminIndex'])->name('delivery-zones.index');
            Route::post('delivery-zones', [DeliveryZoneController::class, 'store'])->name('delivery-zones.store');
            Route::match(['put', 'patch'], 'delivery-zones/{delivery_zone}', [DeliveryZoneController::class, 'update'])->name('delivery-zones.update');

            // Banners.
            Route::get('banners', [BannerController::class, 'index'])->name('banners.index');
            Route::post('banners', [BannerController::class, 'store'])->name('banners.store');
            Route::delete('banners/{banner}', [BannerController::class, 'destroy'])->name('banners.destroy');

            // Site settings.
            Route::get('settings', [SettingController::class, 'index'])->name('settings.index');
            Route::put('settings', [SettingController::class, 'update'])->name('settings.update');
        });

        Route::middleware('role:vendor')->prefix('vendor')->name('vendor.')->group(function () {
            // e.g. Route::apiResource('products', VendorProductController::class);
        });

        Route::middleware('role:delivery')->prefix('delivery')->name('delivery.')->group(function () {
            Route::get('orders', [DeliveryController::class, 'myOrders'])->name('orders.index');
            Route::get('orders/{order}', [DeliveryController::class, 'show'])->name('orders.show');
            Route::match(['put', 'patch'], 'orders/{order}', [DeliveryController::class, 'updateStatus'])->name('orders.update');
        });

        Route::middleware('role:customer')->prefix('account')->name('account.')->group(function () {
            // e.g. Route::apiResource('orders', CustomerOrderController::class);
        });
    });
});
