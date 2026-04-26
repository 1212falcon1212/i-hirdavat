<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

/**
 * Preserved users from before database reset.
 * Run this seeder after migrate:fresh to restore important accounts.
 */
class PreservedUsersSeeder extends Seeder
{
    public function run(): void
    {
        // Admin user
        User::updateOrCreate(
            ['email' => 'admin@i-hirdavat.com'],
            [
                'password' => '$2y$12$aKNyJHmg.tKiKk2QFa6IO.WI5OyDUdcFv76aisCLkonhSEWec7lly',
                'seller_name' => 'i-hırdavat Admin',
                'nickname' => 'i-hirdavat-admin',
                'tax_number' => '9999999999',
                'city' => 'İstanbul',
                'role' => User::ROLE_SUPER_ADMIN,
                'is_verified' => true,
                'verification_status' => 'approved',
                'email_verified_at' => now(),
            ]
        );

        // Project owner account (Falcon)
        User::updateOrCreate(
            ['email' => 'o10sahin@gmail.com'],
            [
                'password' => '$2y$12$Se8Rf4SCTlyt77fJjlV6AOPDVXdB9z5x1AyMbC.RvSue4nrSipJPi',
                'seller_name' => 'Falcon',
                'nickname' => 'Falcon34',
                'tax_number' => '1111111111',
                'role' => User::ROLE_COMPANY,
                'is_verified' => true,
                'verification_status' => 'approved',
                'email_verified_at' => now(),
            ]
        );

        $this->command->info('Preserved users restored.');
    }
}
