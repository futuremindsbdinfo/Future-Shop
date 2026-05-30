<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('delivery_zones', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // e.g. "Inside Dhaka", "Outside Dhaka"
            $table->string('division')->nullable();
            $table->string('district')->nullable();
            $table->decimal('delivery_charge', 8, 2)->default(0); // BDT
            $table->unsignedTinyInteger('estimated_days_min')->default(1);
            $table->unsignedTinyInteger('estimated_days_max')->default(3);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('delivery_zones');
    }
};
