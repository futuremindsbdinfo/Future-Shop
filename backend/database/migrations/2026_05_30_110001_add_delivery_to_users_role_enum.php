<?php

use App\Models\User;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Allow the "delivery" role.
     *
     * Postgres stores Laravel enums as varchar + a CHECK constraint, which the
     * schema builder cannot alter in place. Instead of raw SQL (DROP CONSTRAINT),
     * we rebuild the column as a plain string and rely on application-level
     * validation (User::ROLES) to restrict allowed values. Data is preserved
     * via Eloquent.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('role_tmp', 20)->default('customer');
        });

        // Copy existing role values across (Eloquent, no raw SQL).
        User::query()->get(['id', 'role'])->each(function (User $user) {
            User::whereKey($user->getKey())->update(['role_tmp' => $user->role]);
        });

        // Dropping the old enum column also drops its CHECK constraint.
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('role');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->renameColumn('role_tmp', 'role');
        });
    }

    /**
     * Reverse the migrations: restore the 3-value enum (drops 'delivery' users' role to default).
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('role');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->enum('role', ['customer', 'vendor', 'admin'])->default('customer');
        });
    }
};
