<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Rollout phase a category belongs to (mvp, phase2..phase5).
     */
    public function up(): void
    {
        Schema::table('categories', function (Blueprint $table) {
            $table->string('phase', 20)->default('mvp')->after('slug');
        });
    }

    public function down(): void
    {
        Schema::table('categories', function (Blueprint $table) {
            $table->dropColumn('phase');
        });
    }
};
