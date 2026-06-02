<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('delivery_zones', function (Blueprint $table) {
            $table->text('areas')->nullable()->after('district'); // comma-separated upazila names
            $table->decimal('free_delivery_threshold', 12, 2)->nullable()->after('delivery_charge');
        });
    }

    public function down(): void
    {
        Schema::table('delivery_zones', function (Blueprint $table) {
            $table->dropColumn(['areas', 'free_delivery_threshold']);
        });
    }
};
