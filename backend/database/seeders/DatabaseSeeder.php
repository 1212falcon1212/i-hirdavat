<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->command->info('🚀 Veritabanı seed işlemi başlıyor...');
        $this->command->newLine();

        $this->call([
                // 1. Kategoriler (önce oluşturulmalı)
            CategorySeeder::class,

                // 2. Ürünler
            ProductSeeder::class,

                // 3. Demo Hesaplar (Users)
            DemoAccountSeeder::class,

                // 4. Teklifler (ürünler ve satıcılar gerekli)
            OfferSeeder::class,

                // 5. Siparişler (teklifler ve alıcılar gerekli)
            OrderSeeder::class,

                // 6. CMS İçerikleri
            CmsSeeder::class,
        ]);

        $this->command->newLine();
        $this->command->info('✅ Tüm seed işlemleri tamamlandı!');
        $this->command->newLine();
        $this->command->info('📋 Demo Hesaplar:');
        $this->command->info('   Admin: admin@ihirdavat.com / Admin123!');
        $this->command->info('   Alıcı: buyer@ihirdavat.com / Demo123!');
        $this->command->info('   Satıcı: demo1@ihirdavat.com / Demo123!');
    }
}
