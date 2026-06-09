<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('promotion_rules', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->foreignId('trigger_product_id')->constrained('products')->cascadeOnDelete();
            $table->unsignedSmallInteger('trigger_quantity')->default(1);
            $table->foreignId('free_product_id')->constrained('products')->cascadeOnDelete();
            $table->unsignedSmallInteger('free_quantity')->default(1);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('promotion_rules');
    }
};
