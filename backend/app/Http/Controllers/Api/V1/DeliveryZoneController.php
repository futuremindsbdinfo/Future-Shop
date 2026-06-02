<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\DeliveryZone;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DeliveryZoneController extends Controller
{
    /**
     * Public: list active delivery zones (for checkout zone selection).
     */
    public function index(): JsonResponse
    {
        $zones = DeliveryZone::where('is_active', true)
            ->orderBy('delivery_charge')
            ->get([
                'id', 'name', 'division', 'district', 'areas',
                'delivery_charge', 'free_delivery_threshold',
                'estimated_days_min', 'estimated_days_max',
            ]);

        return response()->json(['data' => $zones]);
    }

    /**
     * Admin: list ALL delivery zones.
     */
    public function adminIndex(): JsonResponse
    {
        return response()->json([
            'data' => DeliveryZone::orderByDesc('id')->get(),
        ]);
    }

    /**
     * Admin: create a delivery zone.
     */
    public function store(Request $request): JsonResponse
    {
        $zone = DeliveryZone::create($this->validatedData($request));

        return response()->json(['data' => $zone], 201);
    }

    /**
     * Admin: update a delivery zone.
     */
    public function update(Request $request, DeliveryZone $delivery_zone): JsonResponse
    {
        $delivery_zone->update($this->validatedData($request));

        return response()->json(['data' => $delivery_zone->fresh()]);
    }

    /**
     * @return array<string, mixed>
     */
    private function validatedData(Request $request): array
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'areas' => ['nullable', 'string', 'max:2000'],
            'division' => ['nullable', 'string', 'max:100'],
            'district' => ['nullable', 'string', 'max:100'],
            'delivery_charge' => ['required', 'numeric', 'min:0'],
            'free_delivery_threshold' => ['nullable', 'numeric', 'min:0'],
            'estimated_days_min' => ['sometimes', 'integer', 'min:0'],
            'estimated_days_max' => ['sometimes', 'integer', 'min:0'],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        $data['is_active'] = $request->boolean('is_active', true);

        return $data;
    }
}
