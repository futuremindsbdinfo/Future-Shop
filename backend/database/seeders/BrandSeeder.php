<?php

namespace Database\Seeders;

use App\Models\Brand;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class BrandSeeder extends Seeder
{
    public function run(): void
    {
        $brands = [
            ['name' => 'Unilever Bangladesh',  'description' => 'Personal care and food products'],
            ['name' => 'ACI Limited',           'description' => 'Consumer goods and pharmaceuticals'],
            ['name' => 'PRAN',                  'description' => 'Food and beverage'],
            ['name' => 'Reckitt Bangladesh',    'description' => 'Hygiene and health products (Harpic, Dettol)'],
            ['name' => 'Bashundhara Group',     'description' => 'Household and stationery products'],
        ];

        foreach ($brands as $b) {
            Brand::firstOrCreate(
                ['slug' => Str::slug($b['name'])],
                array_merge($b, ['slug' => Str::slug($b['name']), 'is_active' => true])
            );
        }
    }
}
