<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use App\Models\User;
use App\Models\Vendor;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    /**
     * Seed 6 sample products (2 per MVP category) under a sample vendor,
     * so the homepage has Featured Products to show.
     */
    public function run(): void
    {
        // Sample vendor (linked to a sample vendor user).
        $vendorUser = User::firstOrCreate(
            ['phone' => '01710000001'],
            [
                'name' => 'Sherpur Bazaar Store',
                'email' => 'vendor@localbazaar.com',
                'password' => 'Vendor@12345',
                'role' => 'vendor',
                'is_active' => true,
            ],
        );

        $vendor = Vendor::firstOrCreate(
            ['user_id' => $vendorUser->id],
            [
                'shop_name' => 'Sherpur Bazaar Store',
                'slug' => 'sherpur-bazaar-store',
                'commission_rate' => 10,
                'status' => 'approved',
                'is_active' => true,
            ],
        );

        // Bengali product names with explicit ASCII slugs (Bengali does not slugify).
        $byCategory = [
            'grocery-drinks' => [
                ['name' => 'প্রিমিয়াম সুগন্ধি চাল (৫ কেজি)', 'slug' => 'premium-aromatic-rice', 'price' => 650, 'sale_price' => 599, 'stock' => 100],
                ['name' => 'খাঁটি সরিষার তেল (১ লিটার)', 'slug' => 'pure-mustard-oil', 'price' => 280, 'sale_price' => null, 'stock' => 80],
            ],
            'livestock-agriculture' => [
                ['name' => 'গরুর জৈব খাদ্য (২৫ কেজি)', 'slug' => 'organic-cattle-feed', 'price' => 1200, 'sale_price' => null, 'stock' => 40],
                ['name' => 'হাইব্রিড সবজির বীজ প্যাক', 'slug' => 'hybrid-vegetable-seeds', 'price' => 150, 'sale_price' => 120, 'stock' => 200],
            ],
            'medicine-health' => [
                ['name' => 'ডিজিটাল থার্মোমিটার', 'slug' => 'digital-thermometer', 'price' => 350, 'sale_price' => null, 'stock' => 60],
                ['name' => 'পারিবারিক ফার্স্ট এইড কিট', 'slug' => 'family-first-aid-kit', 'price' => 800, 'sale_price' => 720, 'stock' => 30],
            ],
        ];

        // Clear this sample vendor's existing products so re-running stays clean
        // (removes any earlier sample products with different slugs).
        Product::where('vendor_id', $vendor->id)->forceDelete();

        foreach ($byCategory as $slug => $products) {
            $category = Category::where('slug', $slug)->first();
            if (! $category) {
                continue; // category not seeded yet
            }

            foreach ($products as $item) {
                Product::updateOrCreate(
                    ['slug' => $item['slug']],
                    [
                        'vendor_id' => $vendor->id,
                        'category_id' => $category->id,
                        'name' => $item['name'],
                        'description' => 'নমুনা পণ্য — Future Shop স্টোরফ্রন্ট পরীক্ষার জন্য।',
                        'price' => $item['price'],
                        'sale_price' => $item['sale_price'],
                        'stock_quantity' => $item['stock'],
                        'is_featured' => true,
                        'status' => 'published',
                    ],
                );
            }
        }
    }
}
