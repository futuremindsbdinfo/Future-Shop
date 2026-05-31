<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\DeliveryZone;
use Illuminate\Http\JsonResponse;

class DeliveryZoneController extends Controller
{
    /**
     * Public: list active delivery zones (for checkout zone selection).
     */
    public function index(): JsonResponse
    {
        $zones = DeliveryZone::where('is_active', true)
            ->orderBy('delivery_charge')
            ->get(['id', 'name', 'division', 'district', 'delivery_charge', 'estimated_days_min', 'estimated_days_max']);

        return response()->json(['data' => $zones]);
    }
}
