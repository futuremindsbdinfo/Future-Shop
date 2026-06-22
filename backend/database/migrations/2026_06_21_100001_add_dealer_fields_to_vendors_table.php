<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Dealer-sheet fields kept on the vendor: the proprietor (contact person)
     * and the sales rep (SR) name/mobile. Dealer/shop name, phone, address and
     * division/district reuse the existing vendor columns.
     */
    public function up(): void
    {
        Schema::table('vendors', function (Blueprint $table) {
            $table->string('proprietor_name')->nullable()->after('shop_name');
            $table->string('sr_name')->nullable()->after('district');
            $table->string('sr_mobile', 20)->nullable()->after('sr_name');
        });
    }

    public function down(): void
    {
        Schema::table('vendors', function (Blueprint $table) {
            $table->dropColumn(['proprietor_name', 'sr_name', 'sr_mobile']);
        });
    }
};
