<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Pivot for the vendor <-> brand many-to-many: one vendor sells several
     * brands. Named "brand_vendor" (singular, alphabetical) so Eloquent's
     * belongsToMany resolves it without extra configuration. No timestamps —
     * a plain link row.
     */
    public function up(): void
    {
        Schema::create('brand_vendor', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vendor_id')->constrained()->cascadeOnDelete();
            $table->foreignId('brand_id')->constrained()->cascadeOnDelete();
            $table->unique(['vendor_id', 'brand_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('brand_vendor');
    }
};
