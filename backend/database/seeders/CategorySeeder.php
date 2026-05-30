<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    /**
     * Seed the 20 top-level categories (English names) with rollout phases.
     * Deletes all existing categories first. is_active is true only for the
     * "mvp" phase; all later phases are seeded inactive.
     */
    public function run(): void
    {
        $categories = [
            ['name' => 'Grocery & Drinks', 'slug' => 'grocery-drinks', 'phase' => 'mvp'],
            ['name' => 'Livestock & Agriculture', 'slug' => 'livestock-agriculture', 'phase' => 'mvp'],
            ['name' => 'Medicine & Health', 'slug' => 'medicine-health', 'phase' => 'mvp'],
            ['name' => 'Health & Personal Care', 'slug' => 'health-personal-care', 'phase' => 'phase2'],
            ['name' => 'Fashion & Beauty', 'slug' => 'fashion-beauty', 'phase' => 'phase2'],
            ['name' => 'Devices & Electronics', 'slug' => 'devices-electronics', 'phase' => 'phase2'],
            ['name' => 'Mobile Accessories', 'slug' => 'mobile-accessories', 'phase' => 'phase2'],
            ['name' => 'Home & DIY', 'slug' => 'home-diy', 'phase' => 'phase3'],
            ['name' => 'Toys, Children & Baby', 'slug' => 'toys-children-baby', 'phase' => 'phase3'],
            ['name' => 'Books & Reading', 'slug' => 'books-reading', 'phase' => 'phase3'],
            ['name' => 'Gifting', 'slug' => 'gifting', 'phase' => 'phase3'],
            ['name' => 'Deals & Savings', 'slug' => 'deals-savings', 'phase' => 'phase2'],
            ['name' => 'Spotlight Stories', 'slug' => 'spotlight-stories', 'phase' => 'phase3'],
            ['name' => 'Automotive', 'slug' => 'automotive', 'phase' => 'phase4'],
            ['name' => 'Office & Personal', 'slug' => 'office-personal', 'phase' => 'phase3'],
            ['name' => 'Luggage & Travel Gear', 'slug' => 'luggage-travel-gear', 'phase' => 'phase4'],
            ['name' => 'Sustainability', 'slug' => 'sustainability', 'phase' => 'phase4'],
            ['name' => 'Food & Restaurant', 'slug' => 'food-restaurant', 'phase' => 'phase4'],
            ['name' => 'Sports & Fitness', 'slug' => 'sports-fitness', 'phase' => 'phase4'],
            ['name' => 'Services', 'slug' => 'services', 'phase' => 'phase5'],
        ];

        // Remove all existing categories first.
        Category::query()->delete();

        foreach ($categories as $index => $category) {
            Category::create([
                'parent_id' => null,
                'name' => $category['name'],
                'slug' => $category['slug'],
                'phase' => $category['phase'],
                'is_active' => $category['phase'] === 'mvp',
                'sort_order' => $index + 1,
            ]);
        }
    }
}
