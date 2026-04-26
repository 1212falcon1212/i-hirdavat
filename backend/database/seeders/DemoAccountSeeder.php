<?php

namespace Database\Seeders;

use App\Models\Contract;
use App\Models\SellerBankAccount;
use App\Models\SellerDocument;
use App\Models\SellerWallet;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

/**
 * Demo accounts for i-hirdavat.
 *
 * Password: 'demo1234' (sellers/buyer) | 'admin1234' (admin)
 *
 * 5 bayi (seller) + 1 admin + 1 corporate buyer. All sellers are:
 * - verification_status = approved
 * - is_verified = true
 * - contract_signed_at filled
 * - have all required SellerDocument rows (all approved)
 * - have 4 Contract rows (kvkk, distance_sales, membership, b2b_sales)
 * - have a SellerWallet (zero balance)
 * - have a default SellerBankAccount (is_verified = true)
 *
 * Sellers can buy from each other (ROLE_SELLER → canBuyFrom → true).
 * Idempotent — safe to re-run.
 */
class DemoAccountSeeder extends Seeder
{
    private const SELLER_PASSWORD = 'demo1234';

    private const ADMIN_PASSWORD = 'admin1234';

    private const DOCUMENT_TYPES = [
        'ruhsat',
        'oda_kaydi',
        'kimlik',
        'vergi_levhasi',
        'imza_sirkusu',
        'ticaret_sicili',
        'sozlesme',
    ];

    private const CONTRACT_TYPES = [
        'kvkk',
        'distance_sales',
        'membership',
        'b2b_sales',
    ];

    public function run(): void
    {
        $sellers = [
            [
                'email' => 'bosch.bayi@i-hirdavat.com',
                'seller_name' => 'Bosch Yetkili Bayii',
                'trade_name' => 'Bosch Yetkili Bayii Tic. Ltd. Şti.',
                'nickname' => 'bosch-bayi',
                'tax_number' => '1234567890',
                'mersis_no' => '1234567890000001',
                'trade_registry_no' => '123456',
                'city' => 'İstanbul',
                'district' => 'Bayrampaşa',
                'address' => 'Sanayi Mah. Hırdavatçılar Çarşısı No:12',
                'phone' => '02125551201',
                'whatsapp_number' => '05551112201',
                'kep_address' => 'boschbayii@hs01.kep.tr',
                'iban' => 'TR120006100519786457841001',
                'bank_name' => 'Türkiye İş Bankası',
            ],
            [
                'email' => 'makita.bayi@i-hirdavat.com',
                'seller_name' => 'Makita Profesyonel Aletler',
                'trade_name' => 'Makita Profesyonel Aletler A.Ş.',
                'nickname' => 'makita-bayi',
                'tax_number' => '2345678901',
                'mersis_no' => '2345678901000002',
                'trade_registry_no' => '234567',
                'city' => 'Ankara',
                'district' => 'Ostim',
                'address' => '100. Yıl OSB 3. Cad. No:45',
                'phone' => '03125552202',
                'whatsapp_number' => '05552223302',
                'kep_address' => 'makitabayii@hs02.kep.tr',
                'iban' => 'TR330006200519790067851002',
                'bank_name' => 'Garanti BBVA',
            ],
            [
                'email' => 'izeltas.bayi@i-hirdavat.com',
                'seller_name' => 'İzeltaş Toptan El Aletleri',
                'trade_name' => 'İzeltaş Toptan El Aletleri San. Tic. Ltd. Şti.',
                'nickname' => 'izeltas-bayi',
                'tax_number' => '3456789012',
                'mersis_no' => '3456789012000003',
                'trade_registry_no' => '345678',
                'city' => 'İzmir',
                'district' => 'Atatürk Organize Sanayi',
                'address' => 'Kemalpaşa Cad. No:280',
                'phone' => '02325553203',
                'whatsapp_number' => '05553334403',
                'kep_address' => 'izeltasbayii@hs03.kep.tr',
                'iban' => 'TR540006400519700089861003',
                'bank_name' => 'Akbank',
            ],
            [
                'email' => 'civata.toptan@i-hirdavat.com',
                'seller_name' => 'Anadolu Civata & Bağlantı',
                'trade_name' => 'Anadolu Civata ve Bağlantı Elemanları A.Ş.',
                'nickname' => 'civata-toptan',
                'tax_number' => '4567890123',
                'mersis_no' => '4567890123000004',
                'trade_registry_no' => '456789',
                'city' => 'Kocaeli',
                'district' => 'Gebze',
                'address' => 'Gebze OSB 400. Sk. No:7',
                'phone' => '02625554204',
                'whatsapp_number' => '05554445504',
                'kep_address' => 'anadolucivata@hs04.kep.tr',
                'iban' => 'TR750006700519700091871004',
                'bank_name' => 'Yapı Kredi',
            ],
            [
                'email' => 'isguvenligi@i-hirdavat.com',
                'seller_name' => 'Profesyonel İş Güvenliği Ekipmanları',
                'trade_name' => 'Profesyonel İş Güvenliği Ekipmanları Tic. Ltd. Şti.',
                'nickname' => 'is-guvenligi',
                'tax_number' => '5678901234',
                'mersis_no' => '5678901234000005',
                'trade_registry_no' => '567890',
                'city' => 'Bursa',
                'district' => 'Nilüfer',
                'address' => 'Minareliçavuş OSB Kırmızı Cad. No:15',
                'phone' => '02245555205',
                'whatsapp_number' => '05555556605',
                'kep_address' => 'isguvenligi@hs05.kep.tr',
                'iban' => 'TR960006800519700093881005',
                'bank_name' => 'Ziraat Bankası',
            ],
        ];

        $now = now();

        foreach ($sellers as $data) {
            $user = User::updateOrCreate(
                ['email' => $data['email']],
                [
                    'password' => Hash::make(self::SELLER_PASSWORD),
                    'seller_name' => $data['seller_name'],
                    'trade_name' => $data['trade_name'],
                    'nickname' => $data['nickname'],
                    'phone' => $data['phone'],
                    'whatsapp_number' => $data['whatsapp_number'],
                    'sector_type' => 'wholesaler',
                    'tax_number' => $data['tax_number'],
                    'mersis_no' => $data['mersis_no'],
                    'trade_registry_no' => $data['trade_registry_no'],
                    'tax_office' => 'Hırdavat V.D.',
                    'kep_address' => $data['kep_address'],
                    'city' => $data['city'],
                    'district' => $data['district'],
                    'address' => $data['address'],
                    'role' => User::ROLE_SELLER,
                    'is_verified' => true,
                    'verified_at' => $now,
                    'verification_status' => 'approved',
                    'approved_at' => $now,
                    'contract_signed_at' => $now,
                    'contract_ip' => '127.0.0.1',
                    'contract_user_agent' => 'DemoAccountSeeder',
                    'seller_score' => 5.0,
                ]
            );

            $this->seedDocumentsFor($user, $now);
            $this->seedContractsFor($user, $now);
            $this->seedWalletFor($user);
            $this->seedBankAccountFor($user, $data);
        }

        User::updateOrCreate(
            ['email' => 'admin@i-hirdavat.com'],
            [
                'password' => Hash::make(self::ADMIN_PASSWORD),
                'seller_name' => 'i-hırdavat Admin',
                'nickname' => 'admin',
                'role' => User::ROLE_SUPER_ADMIN,
                'is_verified' => true,
                'verified_at' => $now,
                'verification_status' => 'approved',
                'approved_at' => $now,
                'tax_number' => '9999999999',
            ]
        );

        User::updateOrCreate(
            ['email' => 'alici@i-hirdavat.com'],
            [
                'password' => Hash::make(self::SELLER_PASSWORD),
                'seller_name' => 'Test Kurumsal Alıcı A.Ş.',
                'trade_name' => 'Test Kurumsal Alıcı Anonim Şirketi',
                'nickname' => 'kurumsal-alici',
                'role' => User::ROLE_COMPANY,
                'is_verified' => true,
                'verified_at' => $now,
                'verification_status' => 'approved',
                'approved_at' => $now,
                'contract_signed_at' => $now,
                'contract_ip' => '127.0.0.1',
                'contract_user_agent' => 'DemoAccountSeeder',
                'tax_number' => '8765432109',
                'mersis_no' => '8765432109000099',
                'tax_office' => 'Büyük Mükellefler V.D.',
                'city' => 'İstanbul',
                'district' => 'Şişli',
                'address' => 'Mecidiyeköy Büyükdere Cad. No:100',
                'sector_type' => 'retailer',
            ]
        );
    }

    private function seedDocumentsFor(User $user, \Illuminate\Support\Carbon $now): void
    {
        foreach (self::DOCUMENT_TYPES as $type) {
            SellerDocument::updateOrCreate(
                ['user_id' => $user->id, 'type' => $type],
                [
                    'file_path' => "demo/documents/{$user->id}/{$type}.pdf",
                    'original_name' => SellerDocument::TYPE_LABELS[$type].'.pdf',
                    'mime_type' => 'application/pdf',
                    'file_size' => 102400,
                    'status' => 'approved',
                    'reviewed_at' => $now,
                ]
            );
        }
    }

    private function seedContractsFor(User $user, \Illuminate\Support\Carbon $now): void
    {
        foreach (self::CONTRACT_TYPES as $type) {
            Contract::updateOrCreate(
                ['user_id' => $user->id, 'type' => $type],
                [
                    'version' => '1.0',
                    'ip_address' => '127.0.0.1',
                    'approved_at' => $now,
                    'metadata' => ['source' => 'DemoAccountSeeder'],
                ]
            );
        }
    }

    private function seedWalletFor(User $user): void
    {
        SellerWallet::updateOrCreate(
            ['seller_id' => $user->id],
            [
                'balance' => 0,
                'pending_balance' => 0,
                'withdrawn_balance' => 0,
                'total_earned' => 0,
                'total_commission' => 0,
            ]
        );
    }

    private function seedBankAccountFor(User $user, array $data): void
    {
        SellerBankAccount::updateOrCreate(
            ['seller_id' => $user->id, 'iban' => $data['iban']],
            [
                'bank_name' => $data['bank_name'],
                'account_holder' => $data['trade_name'],
                'is_default' => true,
                'is_verified' => true,
                'tax_id' => $data['tax_number'],
                'tax_office' => 'Hırdavat V.D.',
                'kep_address' => $data['kep_address'],
                'mersis_number' => $data['mersis_no'],
                'phone' => $data['phone'],
            ]
        );
    }
}
