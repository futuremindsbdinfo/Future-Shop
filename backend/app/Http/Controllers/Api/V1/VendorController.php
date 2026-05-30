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
    public function index(): JsonResponse
    {
        $vendors = Vendor::query()
            ->with(['user:id,name,email,phone,role', 'deliveryZone:id,name'])
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
     * Admin: create a vendor profile linked to an existing user.
     * Also promotes that user's role to "vendor".
     */
    public function store(StoreVendorRequest $request): JsonResponse
    {
        $data = $request->validated();

        $vendor = DB::transaction(function () use ($data) {
            $data['slug'] = $this->uniqueSlug($data['shop_name']);
            $data['is_active'] = $data['is_active'] ?? true;

            $vendor = Vendor::create($data);

            // Promote the linked user to the vendor role.
            User::whereKey($data['user_id'])->update(['role' => 'vendor']);

            return $vendor;
        });

        return response()->json([
            'data' => $vendor->load(['user:id,name,email,phone,role', 'deliveryZone:id,name']),
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
            'products' => fn ($q) => $q->select('id', 'vendor_id', 'category_id', 'name', 'slug', 'price', 'sale_price', 'stock_quantity', 'status')->latest(),
        ]);

        return response()->json(['data' => $vendor]);
    }

    /**
     * Admin: update a vendor (commission rate, zone, active status, etc.).
     */
    public function update(UpdateVendorRequest $request, Vendor $vendor): JsonResponse
    {
        $vendor->update($request->validated());

        return response()->json([
            'data' => $vendor->fresh(['user:id,name,email,phone,role', 'deliveryZone:id,name']),
        ]);
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
