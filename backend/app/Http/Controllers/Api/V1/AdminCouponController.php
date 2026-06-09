<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Coupon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class AdminCouponController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $coupons = Coupon::withCount('usages')
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json($coupons);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'code'                   => ['required', 'string', 'max:50', 'unique:coupons,code', 'regex:/^[A-Z0-9_-]+$/'],
            'description'            => ['nullable', 'string', 'max:255'],
            'discount_percentage'    => ['required', 'integer', 'min:1', 'max:100'],
            'usage_limit'            => ['nullable', 'integer', 'min:1'],
            'is_first_purchase_only' => ['boolean'],
            'is_active'              => ['boolean'],
            'wallet_credit_enabled'  => ['boolean'],
            'expires_at'             => ['nullable', 'date', 'after:now'],
        ]);

        $coupon = Coupon::create($validated);

        return response()->json($coupon, 201);
    }

    public function show(Coupon $coupon): JsonResponse
    {
        return response()->json($coupon->load('usages.user:id,name,email'));
    }

    public function update(Request $request, Coupon $coupon): JsonResponse
    {
        $validated = $request->validate([
            'code'                   => ['sometimes', 'string', 'max:50', Rule::unique('coupons', 'code')->ignore($coupon->id), 'regex:/^[A-Z0-9_-]+$/'],
            'description'            => ['nullable', 'string', 'max:255'],
            'discount_percentage'    => ['sometimes', 'integer', 'min:1', 'max:100'],
            'usage_limit'            => ['nullable', 'integer', 'min:1'],
            'is_first_purchase_only' => ['boolean'],
            'is_active'              => ['boolean'],
            'wallet_credit_enabled'  => ['boolean'],
            'expires_at'             => ['nullable', 'date'],
        ]);

        $coupon->update($validated);

        return response()->json($coupon->fresh());
    }

    public function destroy(Coupon $coupon): JsonResponse
    {
        if ($coupon->used_count > 0) {
            return response()->json([
                'message' => 'Cannot delete a coupon that has been used. Deactivate it instead.',
            ], 422);
        }

        $coupon->delete();

        return response()->json(['message' => 'Coupon deleted.']);
    }
}
