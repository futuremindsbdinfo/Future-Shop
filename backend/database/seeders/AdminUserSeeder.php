<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class AdminUserSeeder extends Seeder
{
    /**
     * Seed the platform admin account.
     *
     * The plain password is hashed automatically by the User model's
     * 'password' => 'hashed' cast, which uses BCRYPT_ROUNDS=12 from .env.
     */
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'admin@localbazaar.com'],
            [
                'name' => 'LocalBazaar Admin',
                'phone' => '01700000000',
                'role' => 'admin',
                'password' => 'Admin@123456',
                'is_active' => true,
                'email_verified_at' => now(),
            ]
        );
    }
}
