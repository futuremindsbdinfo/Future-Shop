<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('referral_code', 12)->nullable()->unique()->after('avatar');
            $table->foreignId('referred_by_id')
                ->nullable()
                ->after('referral_code')
                ->constrained('users')
                ->nullOnDelete();
            $table->index('referred_by_id');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['referred_by_id']);
            $table->dropIndex(['referred_by_id']);
            $table->dropColumn(['referral_code', 'referred_by_id']);
        });
    }
};
