<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Deviation from spec: instead of repurposing orders.promo_code_id
 * (which has a hard FK to the existing promo_codes table), we add a
 * separate orders.coupon_id column with FK to the new coupons table.
 * promo_code_id is left untouched as legacy/future-use.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->decimal('wallet_used', 12, 2)->default(0.00)->after('discount');
            $table->foreignId('coupon_id')
                ->nullable()
                ->after('promo_code_id')
                ->constrained('coupons')
                ->nullOnDelete();
            $table->index('coupon_id');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropForeign(['coupon_id']);
            $table->dropIndex(['coupon_id']);
            $table->dropColumn(['wallet_used', 'coupon_id']);
        });
    }
};
