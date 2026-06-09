<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\PromotionRule;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class AdminPromotionRuleController extends Controller
{
    public function index(): JsonResponse
    {
        $rules = PromotionRule::with([
            'triggerProduct:id,name,slug,images',
            'freeProduct:id,name,slug,images,stock_quantity',
        ])
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json($rules);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name'               => ['required', 'string', 'max:255'],
            'trigger_product_id' => ['required', 'integer', Rule::exists('products', 'id')],
            'trigger_quantity'   => ['required', 'integer', 'min:1', 'max:999'],
            'free_product_id'    => ['required', 'integer', Rule::exists('products', 'id'), 'different:trigger_product_id'],
            'free_quantity'      => ['required', 'integer', 'min:1', 'max:999'],
            'is_active'          => ['boolean'],
        ]);

        $rule = PromotionRule::create($validated);

        return response()->json(
            $rule->load(['triggerProduct:id,name', 'freeProduct:id,name']),
            201
        );
    }

    public function update(Request $request, PromotionRule $promotionRule): JsonResponse
    {
        $validated = $request->validate([
            'name'               => ['sometimes', 'string', 'max:255'],
            'trigger_product_id' => ['sometimes', 'integer', Rule::exists('products', 'id')],
            'trigger_quantity'   => ['sometimes', 'integer', 'min:1', 'max:999'],
            'free_product_id'    => ['sometimes', 'integer', Rule::exists('products', 'id')],
            'free_quantity'      => ['sometimes', 'integer', 'min:1', 'max:999'],
            'is_active'          => ['boolean'],
        ]);

        $promotionRule->update($validated);

        return response()->json(
            $promotionRule->fresh()->load(['triggerProduct:id,name', 'freeProduct:id,name'])
        );
    }

    public function destroy(PromotionRule $promotionRule): JsonResponse
    {
        $promotionRule->delete();

        return response()->json(['message' => 'Promotion rule deleted.']);
    }
}
