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

        // 1. Demo Hesaplar (önce: TestOfferSeeder seller'lara ihtiyaç duyar)
        $this->call(DemoAccountSeeder::class);

        // 2. Kategori ağacı + markalar + ürünler + görseller + özellikler — JSON'dan
        $this->command->info('📦 Hırdavat ürünleri JSON\'dan import ediliyor (--fresh)...');
        \Illuminate\Support\Facades\Artisan::call('import:hirdavat-products', [
            '--fresh' => true,
        ], $this->command->getOutput());

        // 3. Test ilanları (farklı kategorilerden ürünlere)
        $this->call(TestOfferSeeder::class);

        // 4. CMS İçerikleri
        $this->call(CmsSeeder::class);

        $this->command->newLine();
        $this->command->info('✅ Tüm seed işlemleri tamamlandı!');
        $this->command->newLine();
        $this->command->info('📋 Demo Hesaplar:');
        $this->command->info('   Admin: admin@ihirdavat.com / Admin123!');
        $this->command->info('   Alıcı: buyer@ihirdavat.com / Demo123!');
        $this->command->info('   Satıcı: demo1@ihirdavat.com / Demo123!');
    }
}
