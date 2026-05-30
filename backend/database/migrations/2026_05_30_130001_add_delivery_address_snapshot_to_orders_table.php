<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Immutable JSON snapshot of the delivery address at order time.
     * (Structured shipping_* columns remain for querying/reporting.)
     */
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->json('delivery_address')->nullable()->after('shipping_district');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn('delivery_address');
        });
    }
};
