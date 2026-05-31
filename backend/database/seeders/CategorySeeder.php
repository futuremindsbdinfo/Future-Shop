<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    /**
     * Seed the 20 top-level categories (English names) with rollout phases
     * and emoji icons. Deletes all existing categories first. is_active is
     * true only for the "mvp" phase; all later phases are seeded inactive.
     */
    public function run(): void
    {
        $categories = [
            ['name' => 'Grocery & Drinks', 'slug' => 'grocery-drinks', 'phase' => 'mvp', 'icon' => 'fa-cart-shopping'],
            ['name' => 'Livestock & Agriculture', 'slug' => 'livestock-agriculture', 'phase' => 'mvp', 'icon' => 'fa-cow'],
            ['name' => 'Medicine & Health', 'slug' => 'medicine-health', 'phase' => 'mvp', 'icon' => 'fa-pills'],
            ['name' => 'Health & Personal Care', 'slug' => 'health-personal-care', 'phase' => 'phase2', 'icon' => 'fa-heart-pulse'],
            ['name' => 'Fashion & Beauty', 'slug' => 'fashion-beauty', 'phase' => 'phase2', 'icon' => 'fa-shirt'],
            ['name' => 'Devices & Electronics', 'slug' => 'devices-electronics', 'phase' => 'phase2', 'icon' => 'fa-laptop'],
            ['name' => 'Mobile Accessories', 'slug' => 'mobile-accessories', 'phase' => 'phase2', 'icon' => 'fa-mobile-screen'],
            ['name' => 'Home & DIY', 'slug' => 'home-diy', 'phase' => 'phase3', 'icon' => 'fa-house'],
            ['name' => 'Toys, Children & Baby', 'slug' => 'toys-children-baby', 'phase' => 'phase3', 'icon' => 'fa-baby'],
            ['name' => 'Books & Reading', 'slug' => 'books-reading', 'phase' => 'phase3', 'icon' => 'fa-book-open'],
            ['name' => 'Gifting', 'slug' => 'gifting', 'phase' => 'phase3', 'icon' => 'fa-gift'],
            ['name' => 'Deals & Savings', 'slug' => 'deals-savings', 'phase' => 'phase2', 'icon' => 'fa-tag'],
            ['name' => 'Spotlight Stories', 'slug' => 'spotlight-stories', 'phase' => 'phase3', 'icon' => 'fa-star'],
            ['name' => 'Automotive', 'slug' => 'automotive', 'phase' => 'phase4', 'icon' => 'fa-car'],
            ['name' => 'Office & Personal', 'slug' => 'office-personal', 'phase' => 'phase3', 'icon' => 'fa-briefcase'],
            ['name' => 'Luggage & Travel Gear', 'slug' => 'luggage-travel-gear', 'phase' => 'phase4', 'icon' => 'fa-suitcase'],
            ['name' => 'Sustainability', 'slug' => 'sustainability', 'phase' => 'phase4', 'icon' => 'fa-leaf'],
            ['name' => 'Food & Restaurant', 'slug' => 'food-restaurant', 'phase' => 'phase4', 'icon' => 'fa-utensils'],
            ['name' => 'Sports & Fitness', 'slug' => 'sports-fitness', 'phase' => 'phase4', 'icon' => 'fa-dumbbell'],
            ['name' => 'Services', 'slug' => 'services', 'phase' => 'phase5', 'icon' => 'fa-wrench'],
        ];

        // Idempotent upsert keyed by slug. (We cannot mass-delete categories
        // because products reference them via a RESTRICT foreign key.)
        foreach ($categories as $index => $category) {
            Category::updateOrCreate(
                ['slug' => $category['slug']],
                [
                    'parent_id' => null,
                    'name' => $category['name'],
                    'phase' => $category['phase'],
                    'icon' => $category['icon'],
                    'is_active' => $category['phase'] === 'mvp',
                    'sort_order' => $index + 1,
                ],
            );
        }
    }
}
