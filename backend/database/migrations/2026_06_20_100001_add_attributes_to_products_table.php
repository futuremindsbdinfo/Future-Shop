<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Flexible display-only key/value details (e.g. Flavour: Lemon, Size: 1kg).
     * These are NOT variants — they have no effect on price/stock. Stored as
     * JSON; capped at 20 pairs at the application layer.
     */
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->json('attributes')->nullable()->after('images');
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn('attributes');
        });
    }
};
