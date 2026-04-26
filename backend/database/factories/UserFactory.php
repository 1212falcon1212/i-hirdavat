<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\User>
 */
class UserFactory extends Factory
{
    protected $model = User::class;

    protected static ?string $password;

    /**
     * Generate a valid 10-digit Turkish VKN (tax_number) — no check digit enforced;
     * seed data only.
     */
    protected function generateTaxNumber(): string
    {
        return (string) fake()->numerify('##########');
    }

    /**
     * Generate a 16-digit MERSİS number — seed data only.
     */
    protected function generateMersisNo(): string
    {
        return (string) fake()->numerify('################');
    }

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'email' => fake()->unique()->safeEmail(),
            'password' => static::$password ??= Hash::make('Password123!'),
            'seller_name' => fake()->company().' Hırdavat',
            'nickname' => fake()->unique()->userName(),
            'tax_number' => $this->generateTaxNumber(),
            'mersis_no' => $this->generateMersisNo(),
            'phone' => '5'.fake()->numerify('##').fake()->numerify('#######'),
            'address' => fake()->streetAddress(),
            'city' => fake()->randomElement(['Istanbul', 'Ankara', 'Izmir', 'Bursa', 'Antalya', 'Adana', 'Konya', 'Kocaeli']),
            'role' => User::ROLE_SELLER,
            'sector_type' => fake()->randomElement(['wholesaler', 'retailer', 'importer', 'manufacturer']),
            'is_verified' => true,
            'verification_status' => 'approved',
            'email_verified_at' => now(),
            'remember_token' => Str::random(10),
        ];
    }

    public function unverified(): static
    {
        return $this->state(fn (array $attributes) => [
            'email_verified_at' => null,
            'is_verified' => false,
            'verification_status' => 'pending',
        ]);
    }

    public function superAdmin(): static
    {
        return $this->state(fn (array $attributes) => [
            'role' => User::ROLE_SUPER_ADMIN,
            'is_verified' => true,
            'verification_status' => 'approved',
        ]);
    }

    /**
     * Seller (bayi) — can sell and buy.
     */
    public function seller(): static
    {
        return $this->state(fn (array $attributes) => [
            'role' => User::ROLE_SELLER,
            'is_verified' => true,
            'verification_status' => 'approved',
        ]);
    }

    /**
     * Company (corporate buyer — can only buy from linked sellers).
     */
    public function company(): static
    {
        return $this->state(fn (array $attributes) => [
            'role' => User::ROLE_COMPANY,
            'is_verified' => true,
            'verification_status' => 'approved',
            'sector_type' => 'retailer',
        ]);
    }

    public function pending(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_verified' => false,
            'verification_status' => 'pending',
        ]);
    }

    public function rejected(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_verified' => false,
            'verification_status' => 'rejected',
            'rejection_reason' => 'Belgeler eksik veya geçersiz.',
        ]);
    }

    public function inCity(string $city): static
    {
        return $this->state(fn (array $attributes) => [
            'city' => $city,
        ]);
    }

    public function withTaxNumber(string $taxNumber): static
    {
        return $this->state(fn (array $attributes) => [
            'tax_number' => $taxNumber,
        ]);
    }
}
