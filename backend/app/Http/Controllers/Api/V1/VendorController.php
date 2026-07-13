<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Vendor\StoreVendorRequest;
use App\Http\Requests\Vendor\UpdateVendorRequest;
use App\Models\User;
use App\Models\Vendor;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class VendorController extends Controller
{
    /**
     * Admin: list all vendors with an earnings summary.
     *
     * gross_sales  = Σ order_items.subtotal
     * total_commission = Σ order_items.commission (platform's cut)
     * net_earnings = gross_sales − total_commission (vendor payout)
     */
    public function index(\Illuminate\Http\Request $request): JsonResponse
    {
        $vendors = Vendor::query()
            ->when($request->user()->role === 'vendor', function ($q) use ($request) {
                $q->where('user_id', $request->user()->id);
            })
            ->with(['user:id,name,email,phone,role', 'deliveryZone:id,name', 'brands:id,name'])
            ->withCount('products')
            ->withSum('orderItems as gross_sales', 'subtotal')
            ->withSum('orderItems as total_commission', 'commission')
            ->orderByDesc('id')
            ->paginate(15);

        $vendors->getCollection()->transform(function (Vendor $vendor) {
            $gross = (float) ($vendor->gross_sales ?? 0);
            $commission = (float) ($vendor->total_commission ?? 0);
            $vendor->setAttribute('gross_sales', round($gross, 2));
            $vendor->setAttribute('total_commission', round($commission, 2));
            $vendor->setAttribute('net_earnings', round($gross - $commission, 2));

            return $vendor;
        });

        return response()->json($vendors);
    }

    /**
     * Admin: create a vendor. A new user account (role "vendor") is auto-created
     * from the dealer details and linked to the vendor — no existing user id is
     * supplied. No password is set: there is no vendor portal yet, and access
     * (OTP / reset) can be granted later via the phone. User + vendor are created
     * in one transaction so a failure leaves no orphan user.
     */
    public function store(StoreVendorRequest $request): JsonResponse
    {
        $data = $request->validated();

        $vendor = DB::transaction(function () use ($data) {
            $user = User::create([
                'name' => $data['proprietor_name'] ?? $data['shop_name'],
                'phone' => $data['phone'],
                'email' => $data['email'] ?? null,
                'role' => 'vendor',
                'is_active' => true,
            ]);

            $vendor = Vendor::create([
                'user_id' => $user->id,
                'shop_name' => $data['shop_name'],
                'proprietor_name' => $data['proprietor_name'] ?? null,
                'slug' => $this->uniqueSlug($data['shop_name']),
                'description' => $data['description'] ?? null,
                'phone' => $data['phone'],
                'address' => $data['address'] ?? null,
                'division' => $data['division'] ?? null,
                'district' => $data['district'] ?? null,
                'sr_name' => $data['sr_name'] ?? null,
                'sr_mobile' => $data['sr_mobile'] ?? null,
                'delivery_zone_id' => $data['delivery_zone_id'] ?? null,
                'commission_rate' => $data['commission_rate'],
                'status' => $data['status'],
                'is_active' => $data['is_active'] ?? true,
            ]);

            $vendor->brands()->sync($data['brand_ids'] ?? []);

            return $vendor;
        });

        return response()->json([
            'data' => $vendor->load(['user:id,name,email,phone,role', 'deliveryZone:id,name', 'brands:id,name']),
        ], 201);
    }

    /**
     * Admin: get a single vendor with their products.
     */
    public function show(Vendor $vendor): JsonResponse
    {
        $vendor->load([
            'user:id,name,email,phone,role',
            'deliveryZone:id,name,delivery_charge',
            'brands:id,name',
            'products' => fn ($q) => $q->select('id', 'vendor_id', 'category_id', 'name', 'slug', 'price', 'sale_price', 'stock_quantity', 'status')->latest(),
        ]);

        return response()->json(['data' => $vendor]);
    }

    /**
     * Admin: update a vendor (commission rate, zone, active status, etc.).
     */
    public function update(UpdateVendorRequest $request, Vendor $vendor): JsonResponse
    {
        DB::transaction(function () use ($request, $vendor) {
            $vendor->update($request->validated());

            // Only touch brands when the field is present, so a partial update
            // does not detach the vendor's existing brands.
            if ($request->has('brand_ids')) {
                $vendor->brands()->sync($request->validated('brand_ids') ?? []);
            }
        });

        return response()->json([
            'data' => $vendor->fresh(['user:id,name,email,phone,role', 'deliveryZone:id,name', 'brands:id,name']),
        ]);
    }

    /**
     * Admin: permanently delete a vendor.
     *
     * Guarded against orphaning catalog/order data:
     *  - blocked if the vendor still has products
     *  - blocked if the vendor is referenced by any order_items (historical orders stay intact)
     * The linked user account is intentionally NOT touched.
     */
    public function destroy(Vendor $vendor): JsonResponse
    {
        $productCount = $vendor->products()->count();
        if ($productCount > 0) {
            return response()->json([
                'message' => "Cannot delete vendor: {$productCount} product(s) still assigned. Deactivate the vendor instead.",
            ], 409);
        }

        $orderItemCount = $vendor->orderItems()->count();
        if ($orderItemCount > 0) {
            return response()->json([
                'message' => "Cannot delete vendor: referenced by {$orderItemCount} order item(s). Deactivate the vendor instead.",
            ], 409);
        }

        try {
            DB::transaction(function () use ($vendor) {
                $vendor->delete();
            });
        } catch (\Throwable $e) {
            return response()->json([
                'message' => 'Failed to delete vendor. Please try again.',
            ], 500);
        }

        return response()->json([
            'message' => 'Vendor deleted.',
        ], 200);
    }

    private function uniqueSlug(string $name, ?int $ignoreId = null): string
    {
        $base = Str::slug($name);
        $slug = $base;
        $suffix = 1;

        while (Vendor::where('slug', $slug)
            ->when($ignoreId, fn ($q) => $q->where('id', '!=', $ignoreId))
            ->exists()
        ) {
            $slug = $base.'-'.(++$suffix);
        }

        return $slug;
    }
}
