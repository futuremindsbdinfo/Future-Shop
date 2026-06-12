<?php

use App\Http\Controllers\Api\V1\AddressController;
use App\Http\Controllers\Api\V1\AdminController;
use App\Http\Controllers\Api\V1\AdminCouponController;
use App\Http\Controllers\Api\V1\AdminMappedImportController;
use App\Http\Controllers\Api\V1\AdminPaymentController;
use App\Http\Controllers\Api\V1\AdminPromotionRuleController;
use App\Http\Controllers\Api\V1\DeliveryPaymentController;
use App\Http\Controllers\Api\V1\AnalyticsController;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\BannerController;
use App\Http\Controllers\Api\V1\BrandController;
use App\Http\Controllers\Api\V1\CartController;
use App\Http\Controllers\Api\V1\CustomerDashboardController;
use App\Http\Controllers\Api\V1\WishlistController;
use App\Http\Controllers\Api\V1\DeliveryController;
use App\Http\Controllers\Api\V1\InvoiceController;
use App\Http\Controllers\Api\V1\ReportController;
use App\Http\Controllers\Api\V1\SettingController;
use App\Http\Controllers\Api\V1\UserManagementController;
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
    Route::get('brands', [BrandController::class, 'publicIndex'])->name('brands.index');
    Route::get('brands/{brand:slug}', [BrandController::class, 'publicShow'])->name('brands.show');

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
        Route::put('addresses/{address}', [AddressController::class, 'update'])->name('addresses.update');
        Route::patch('addresses/{address}/default', [AddressController::class, 'setDefault'])->name('addresses.set-default');
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

            // Users / customers management.
            Route::get('users', [UserManagementController::class, 'index'])->name('users.index');
            Route::post('users', [UserManagementController::class, 'create'])->name('users.create');
            Route::match(['put', 'patch'], 'users/{user}', [UserManagementController::class, 'update'])->name('users.update');
            Route::patch('users/{user}/toggle-status', [UserManagementController::class, 'toggleStatus'])->name('users.toggle-status');
            Route::patch('users/{user}/role', [UserManagementController::class, 'changeRole'])->name('users.change-role');
            // (Customer browse routes moved to admin,staff group below.)

            // Analytics.
            Route::get('analytics', [AnalyticsController::class, 'index'])->name('analytics.index');

            // Reports.
            Route::get('reports/sales', [ReportController::class, 'sales'])->name('reports.sales');
            Route::get('reports/products', [ReportController::class, 'products'])->name('reports.products');
            Route::get('reports/vendors', [ReportController::class, 'vendors'])->name('reports.vendors');
            Route::get('reports/export', [ReportController::class, 'export'])->name('reports.export');

            // Invoices.
            Route::get('invoices', [InvoiceController::class, 'index'])->name('invoices.index');
            Route::get('invoices/{order}', [InvoiceController::class, 'show'])->name('invoices.show');

            // All categories (incl. inactive) for admin forms.
            Route::get('categories', [CategoryController::class, 'adminIndex'])->name('categories.index');

            // Product mutations — admin only. (Read access moved to admin,staff group below.)
            // IMPORTANT: literal-path routes must come BEFORE any {product} wildcard.
            Route::get('products/import-template', [ProductController::class, 'importTemplate'])->name('products.import-template');
            Route::post('products/import', [ProductController::class, 'import'])->name('products.import');
            Route::post('products/import-mapped', [AdminMappedImportController::class, 'import'])->name('products.import-mapped');
            Route::post('products', [ProductController::class, 'store'])->name('products.store');
            Route::match(['put', 'patch'], 'products/{product}', [ProductController::class, 'update'])->name('products.update');
            Route::delete('products/{product}', [ProductController::class, 'destroy'])->name('products.destroy');

            // Manual verification of an online payment (admin only).
            Route::patch('orders/{order}/verify-payment', [AdminPaymentController::class, 'verify'])->name('orders.verify-payment');

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

            // (Brands, coupons, promotions moved to admin,staff group below.)
        });

        /*
        | Admin + Staff group (Batch E-1). Routes accessible to both roles —
        | day-to-day fulfillment: read products, manage orders, manage vendors.
        | Sibling of the admin-only group above (same /admin prefix). No
        | name('admin.') prefix here to avoid duplicate route-name registration.
        */
        Route::middleware('role:admin,staff')->prefix('admin')->group(function () {
            // Product catalog (read-only).
            Route::get('products', [ProductController::class, 'adminIndex']);
            Route::get('products/{product}', [ProductController::class, 'adminShow']);

            // Orders: list + status update (status update fires OrderObserver).
            Route::get('orders', [OrderController::class, 'adminIndex']);
            Route::match(['put', 'patch'], 'orders/{order}', [OrderController::class, 'updateStatus']);

            // Vendor management. Note: VendorController has no destroy() method,
            // so DELETE is intentionally not registered here.
            Route::get('vendors', [VendorController::class, 'index']);
            Route::post('vendors', [VendorController::class, 'store']);
            Route::get('vendors/{vendor}', [VendorController::class, 'show']);
            Route::match(['put', 'patch'], 'vendors/{vendor}', [VendorController::class, 'update']);

            // Brands.
            Route::get('brands', [BrandController::class, 'index']);
            Route::post('brands', [BrandController::class, 'store']);
            Route::match(['put', 'patch'], 'brands/{brand}', [BrandController::class, 'update']);
            Route::delete('brands/{brand}', [BrandController::class, 'destroy']);

            // Coupons.
            Route::get('coupons', [AdminCouponController::class, 'index']);
            Route::post('coupons', [AdminCouponController::class, 'store']);
            Route::get('coupons/{coupon}', [AdminCouponController::class, 'show']);
            Route::match(['put', 'patch'], 'coupons/{coupon}', [AdminCouponController::class, 'update']);
            Route::delete('coupons/{coupon}', [AdminCouponController::class, 'destroy']);

            // Promotion rules (Buy X Get Y).
            Route::get('promotions', [AdminPromotionRuleController::class, 'index']);
            Route::post('promotions', [AdminPromotionRuleController::class, 'store']);
            Route::match(['put', 'patch'], 'promotions/{promotionRule}', [AdminPromotionRuleController::class, 'update']);
            Route::delete('promotions/{promotionRule}', [AdminPromotionRuleController::class, 'destroy']);

            // Customers (read-only).
            Route::get('customers', [UserManagementController::class, 'customers']);
            Route::get('customers/{user}', [UserManagementController::class, 'customerShow']);
        });

        Route::middleware('role:vendor')->prefix('vendor')->name('vendor.')->group(function () {
            // e.g. Route::apiResource('products', VendorProductController::class);
        });

        Route::middleware('role:delivery')->prefix('delivery')->name('delivery.')->group(function () {
            Route::get('orders', [DeliveryController::class, 'myOrders'])->name('orders.index');
            Route::get('orders/{order}', [DeliveryController::class, 'show'])->name('orders.show');
            Route::match(['put', 'patch'], 'orders/{order}', [DeliveryController::class, 'updateStatus'])->name('orders.update');

            // Cash collection with 6-digit verification code (Batch E-1).
            Route::get('payment-confirm', [DeliveryPaymentController::class, 'preview'])->name('payment-confirm.preview');
            Route::post('payment-confirm', [DeliveryPaymentController::class, 'confirm'])->name('payment-confirm.confirm');
        });

        Route::middleware('role:customer')->prefix('account')->name('account.')->group(function () {
            Route::get('dashboard', [CustomerDashboardController::class, 'summary'])->name('dashboard');
            Route::get('wishlists', [WishlistController::class, 'index'])->name('wishlists.index');
            Route::post('wishlists', [WishlistController::class, 'store'])->name('wishlists.store');
            Route::delete('wishlists/{wishlist}', [WishlistController::class, 'destroy'])->name('wishlists.destroy');

            // Wallet (Batch D) — balance + paginated immutable ledger.
            Route::get('wallet', function (\Illuminate\Http\Request $r) {
                $wallet = \App\Models\Wallet::where('user_id', $r->user()->id)->first();
                $transactions = \App\Models\WalletTransaction::where('user_id', $r->user()->id)
                    ->latest('created_at')
                    ->paginate(20);

                return response()->json([
                    'balance'      => $wallet ? number_format((float) $wallet->balance, 2, '.', '') : '0.00',
                    'transactions' => $transactions,
                ]);
            })->name('wallet');

            // Coupon preview — validate without consuming (Batch D-2b).
            Route::get('coupons/check', function (\Illuminate\Http\Request $r) {
                $code = strtoupper(trim((string) $r->input('code', '')));
                if ($code === '') {
                    return response()->json(['valid' => false, 'message' => 'No code provided.']);
                }

                $coupon = \App\Models\Coupon::where('code', $code)->where('is_active', true)->first();
                if (! $coupon || ! $coupon->isValid()) {
                    return response()->json(['valid' => false, 'message' => 'Invalid or expired coupon.']);
                }

                $alreadyUsed = \App\Models\CouponUsage::where('coupon_id', $coupon->id)
                    ->where('user_id', $r->user()->id)
                    ->exists();
                if ($alreadyUsed) {
                    return response()->json(['valid' => false, 'message' => 'You have already used this coupon.']);
                }

                if ($coupon->is_first_purchase_only) {
                    $hasPrior = \App\Models\Order::where('user_id', $r->user()->id)
                        ->whereNotIn('order_status', ['cancelled'])
                        ->exists();
                    if ($hasPrior) {
                        return response()->json(['valid' => false, 'message' => 'This coupon is for first-time buyers only.']);
                    }
                }

                return response()->json([
                    'valid'               => true,
                    'discount_percentage' => $coupon->discount_percentage,
                    'description'         => $coupon->description,
                    'message'             => $coupon->discount_percentage.'% off your order!',
                ]);
            })->name('coupons.check');

            // Customer coupon history + available coupons (Batch D-2b).
            Route::get('coupons', function (\Illuminate\Http\Request $r) {
                $usages = \App\Models\CouponUsage::where('user_id', $r->user()->id)
                    ->with('coupon:id,code,discount_percentage,description')
                    ->latest()
                    ->get();

                $isFirstTimeBuyer = ! \App\Models\Order::where('user_id', $r->user()->id)
                    ->whereNotIn('order_status', ['cancelled'])
                    ->exists();

                $available = $isFirstTimeBuyer
                    ? \App\Models\Coupon::where('is_active', true)
                        ->where('is_first_purchase_only', true)
                        ->where(fn ($q) => $q->whereNull('expires_at')->orWhere('expires_at', '>', now()))
                        ->where(fn ($q) => $q->whereNull('usage_limit')->orWhereColumn('used_count', '<', 'usage_limit'))
                        ->whereNotIn('id', $usages->pluck('coupon_id'))
                        ->select('id', 'code', 'discount_percentage', 'description', 'expires_at')
                        ->get()
                    : collect();

                return response()->json(['available' => $available, 'used' => $usages]);
            })->name('coupons.list');

            // Referral (Batch D) — user's own code + stats.
            Route::get('referral', function (\Illuminate\Http\Request $r) {
                $user = $r->user();

                return response()->json([
                    'referral_code'   => $user->referral_code,
                    'referral_count'  => $user->referrals()->count(),
                    'referral_earned' => \App\Models\WalletTransaction::where('user_id', $user->id)
                        ->where('reference', 'like', 'REFERRAL-%')
                        ->sum('amount'),
                ]);
            })->name('referral');
            // e.g. Route::apiResource('orders', CustomerOrderController::class);
        });
    });
});
