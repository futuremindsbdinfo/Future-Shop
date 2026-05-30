<?php

namespace Database\Seeders;

use App\Models\DeliveryZone;
use Illuminate\Database\Seeder;

class DeliveryZoneSeeder extends Seeder
{
    /**
     * Seed delivery zones for the Sherpur & Bogura launch area.
     *
     * Spec used "base_charge"; the table column is "delivery_charge" (same meaning).
     * Each tier spans both districts, so division/district are left null and the
     * coverage is described in the name.
     */
    public function run(): void
    {
        $zones = [
            [
                'name' => 'Zone A — Sherpur Sadar & Bogura Sadar',
                'delivery_charge' => 50,
                'estimated_days_min' => 1,
                'estimated_days_max' => 2,
            ],
            [
                'name' => 'Zone B — Nearby upazilas (within 15km)',
                'delivery_charge' => 80,
                'estimated_days_min' => 2,
                'estimated_days_max' => 3,
            ],
            [
                'name' => 'Zone C — Outer areas (15–30km)',
                'delivery_charge' => 120,
                'estimated_days_min' => 3,
                'estimated_days_max' => 5,
            ],
        ];

        foreach ($zones as $zone) {
            DeliveryZone::updateOrCreate(
                ['name' => $zone['name']],
                array_merge($zone, ['is_active' => true])
            );
        }
    }
}
