<?php

namespace App\Filament\Pages;

use App\Models\Setting;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Notifications\Notification;
use Filament\Pages\Page;

class CommissionSettingsPage extends Page
{
    protected static ?string $navigationIcon = 'heroicon-o-calculator';

    protected static string $view = 'filament.pages.commission-settings';

    protected static ?string $navigationLabel = 'Hizmet Bedeli Ayarları';

    protected static ?string $title = 'Hizmet Bedeli Ayarları';

    protected static ?string $navigationGroup = 'Finans';

    protected static ?int $navigationSort = 2;

    public ?array $data = [];

    public function mount(): void
    {
        $this->form->fill([
            // Yeni alanlar (Order­Pricing­Service tarafından kullanılır)
            'platform_commission_enabled' => (bool) Setting::getValue('commission.platform_commission_enabled', true),
            'platform_commission_rate' => (float) Setting::getValue('commission.platform_commission_rate',
                (float) Setting::getValue('commission.commission_percentage', 10.00)),
            'service_fee_enabled' => (bool) Setting::getValue('commission.service_fee_enabled', true),
            'service_fee' => (float) Setting::getValue('commission.service_fee',
                (float) Setting::getValue('commission.flat_service_fee', 50.00)),
            'stopaj_enabled' => (bool) Setting::getValue('commission.stopaj_enabled', true),
            'stopaj_rate' => (float) Setting::getValue('commission.stopaj_rate',
                (float) Setting::getValue('commission.withholding_tax_rate', 20.00)),
            'default_kdv_rate' => (float) Setting::getValue('commission.default_kdv_rate', 20.00),
            'shipping_fallback_fee' => (float) Setting::getValue('commission.shipping_fallback_fee', 49.90),
            'min_order_for_free_shipping_cap' => Setting::getValue('commission.min_order_for_free_shipping_cap', null),
            'min_order_amount' => (float) Setting::getValue('commission.min_order_amount', 2000),

            // Legacy alanlar — geri uyumluluk için tutulur (FeeCalculationService /
            // SettlementService bunları okumaya devam ediyor).
            'commission_enabled' => (bool) Setting::getValue('commission.enabled', true),
            'fee_mode' => (string) Setting::getValue('commission.fee_mode', 'flat'),
        ]);
    }

    public function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make('Platform Komisyonu')
                    ->description('Her sipariş için satıcıdan kesilen platform komisyonu (KDV hariç kalem geliri üzerinden).')
                    ->schema([
                        Forms\Components\Toggle::make('platform_commission_enabled')
                            ->label('Komisyon Aktif')
                            ->default(true)
                            ->helperText('Kapatılırsa hiçbir satıcıdan komisyon kesilmez.'),

                        Forms\Components\TextInput::make('platform_commission_rate')
                            ->label('Komisyon Oranı (%)')
                            ->numeric()
                            ->suffix('%')
                            ->step(0.01)
                            ->minValue(0)
                            ->maxValue(100)
                            ->default(10.00)
                            ->required()
                            ->helperText('Varsayılan %10. KDV-hariç kalem geliri üzerinden hesaplanır.'),
                    ])
                    ->columns(2),

                Forms\Components\Section::make('Hizmet Bedeli (Sipariş Başına)')
                    ->description('Sipariş başına alıcıdan tek sefer tahsil edilen sabit hizmet bedeli (komisyondan ayrı).')
                    ->schema([
                        Forms\Components\Toggle::make('service_fee_enabled')
                            ->label('Hizmet Bedeli Aktif')
                            ->default(true),

                        Forms\Components\TextInput::make('service_fee')
                            ->label('Hizmet Bedeli (₺)')
                            ->numeric()
                            ->suffix('₺')
                            ->step(0.01)
                            ->minValue(0)
                            ->default(50.00)
                            ->required()
                            ->helperText('Varsayılan 50₺. Alıcının grand total\'ına eklenir; satıcılara dağıtılmaz.'),
                    ])
                    ->columns(2),

                Forms\Components\Section::make('Vergi (KDV & Stopaj)')
                    ->description('KDV/stopaj hesabı için kullanılan oranlar. Listeleme fiyatları KDV DAHİLDİR; KDV önce ayrıştırılır, stopaj ardından KDV-hariç tutar üzerinden uygulanır.')
                    ->schema([
                        Forms\Components\TextInput::make('default_kdv_rate')
                            ->label('Varsayılan KDV Oranı (%)')
                            ->numeric()
                            ->suffix('%')
                            ->step(0.01)
                            ->minValue(0)
                            ->maxValue(100)
                            ->default(20.00)
                            ->required()
                            ->helperText('Ürün kategorisinde KDV oranı tanımlı değilse bu kullanılır.'),

                        Forms\Components\Toggle::make('stopaj_enabled')
                            ->label('Stopaj Aktif')
                            ->default(true),

                        Forms\Components\TextInput::make('stopaj_rate')
                            ->label('Stopaj Oranı (%)')
                            ->numeric()
                            ->suffix('%')
                            ->step(0.01)
                            ->minValue(0)
                            ->maxValue(100)
                            ->default(20.00)
                            ->required()
                            ->helperText(
                                'KDV-hariç KALEM GELİRİ üzerinden uygulanır (komisyon geliri üzerinden değil). '
                                .'Türk e-ticaret pratiğinde stopaj genelde komisyon geliri üzerinden alınır; '
                                .'i-hirdavat\'ta yerleşik konvansiyon "net satıcı geliri × stopaj oranı"dır. '
                                .'Vergi danışmanınızla kontrol edin.'
                            ),
                    ])
                    ->columns(3),

                Forms\Components\Section::make('Kargo Yedek Ücreti (Platform)')
                    ->description('Bayi kendi kargo ayarını yapmadıysa kullanılan platform fallback değeri. Bayi kargo ayarı bayinin "Hesabım → Ayarlar → Kargo Ayarları" sayfasından yönetilir.')
                    ->schema([
                        Forms\Components\TextInput::make('shipping_fallback_fee')
                            ->label('Fallback Kargo Ücreti (₺)')
                            ->numeric()
                            ->suffix('₺')
                            ->step(0.01)
                            ->minValue(0)
                            ->default(49.90)
                            ->required()
                            ->helperText('Bayi shipping_flat_fee tanımlamadıysa bu değer uygulanır.'),

                        Forms\Components\TextInput::make('min_order_for_free_shipping_cap')
                            ->label('Bayi Ücretsiz Kargo Üst Sınırı (₺, opsiyonel)')
                            ->numeric()
                            ->suffix('₺')
                            ->step(0.01)
                            ->minValue(0)
                            ->nullable()
                            ->helperText('Bayinin tanımladığı ücretsiz kargo eşiği bu değeri aşamaz. Boş = sınırsız.'),
                    ])
                    ->columns(2),

                Forms\Components\Section::make('Sipariş Kuralları')
                    ->schema([
                        Forms\Components\TextInput::make('min_order_amount')
                            ->label('Minimum Sipariş Tutarı (₺)')
                            ->numeric()
                            ->suffix('₺')
                            ->step(1)
                            ->minValue(0)
                            ->default(2000)
                            ->helperText('Alıcı sepet alt toplamı bu tutarın altındaysa sipariş oluşturulamaz.'),
                    ])
                    ->columns(1),

                Forms\Components\Section::make('Hesaplama Önizlemesi')
                    ->description('Aşağıdaki örnek 2 satıcılı, 2 kalemli (₺1.000 + ₺1.500 KDV dahil) bir sipariş için kırılımı gösterir.')
                    ->schema([
                        Forms\Components\Placeholder::make('preview')
                            ->label('')
                            ->content(function (Forms\Get $get): string {
                                return $this->buildPreview(
                                    commissionEnabled: (bool) $get('platform_commission_enabled'),
                                    commissionRate: (float) ($get('platform_commission_rate') ?? 10),
                                    serviceFeeEnabled: (bool) $get('service_fee_enabled'),
                                    serviceFee: (float) ($get('service_fee') ?? 50),
                                    stopajEnabled: (bool) $get('stopaj_enabled'),
                                    stopajRate: (float) ($get('stopaj_rate') ?? 20),
                                    kdvRate: (float) ($get('default_kdv_rate') ?? 20),
                                    shippingFallback: (float) ($get('shipping_fallback_fee') ?? 49.90),
                                );
                            }),
                    ])
                    ->collapsible(),
            ])
            ->statePath('data');
    }

    public function save(): void
    {
        $data = $this->form->getState();

        // Yeni anahtarlar
        Setting::setValue('commission.platform_commission_enabled', (bool) ($data['platform_commission_enabled'] ?? true), 'commission', 'boolean');
        Setting::setValue('commission.platform_commission_rate', (float) ($data['platform_commission_rate'] ?? 10.00), 'commission');
        Setting::setValue('commission.service_fee_enabled', (bool) ($data['service_fee_enabled'] ?? true), 'commission', 'boolean');
        Setting::setValue('commission.service_fee', (float) ($data['service_fee'] ?? 50.00), 'commission');
        Setting::setValue('commission.stopaj_enabled', (bool) ($data['stopaj_enabled'] ?? true), 'commission', 'boolean');
        Setting::setValue('commission.stopaj_rate', (float) ($data['stopaj_rate'] ?? 20.00), 'commission');
        Setting::setValue('commission.default_kdv_rate', (float) ($data['default_kdv_rate'] ?? 20.00), 'commission');
        Setting::setValue('commission.shipping_fallback_fee', (float) ($data['shipping_fallback_fee'] ?? 49.90), 'commission');

        if (array_key_exists('min_order_for_free_shipping_cap', $data) && $data['min_order_for_free_shipping_cap'] !== null && $data['min_order_for_free_shipping_cap'] !== '') {
            Setting::setValue('commission.min_order_for_free_shipping_cap', (float) $data['min_order_for_free_shipping_cap'], 'commission');
        } else {
            Setting::setValue('commission.min_order_for_free_shipping_cap', '', 'commission');
        }

        Setting::setValue('commission.min_order_amount', (float) ($data['min_order_amount'] ?? 2000), 'commission');

        // Legacy alanları senkronize tut — eski FeeCalculationService / SettlementService
        // yapılandırmasını bozmamak için ayna değerleri yaz.
        Setting::setValue('commission.enabled', (bool) ($data['service_fee_enabled'] ?? true), 'commission', 'boolean');
        Setting::setValue('commission.flat_service_fee', (float) ($data['service_fee'] ?? 50.00), 'commission');
        Setting::setValue('commission.commission_percentage', (float) ($data['platform_commission_rate'] ?? 10.00), 'commission');
        Setting::setValue('commission.withholding_tax_rate', (float) ($data['stopaj_rate'] ?? 20.00), 'commission');

        Setting::clearCache();

        Notification::make()
            ->title('Hizmet bedeli ayarları kaydedildi')
            ->success()
            ->send();
    }

    protected function getFormActions(): array
    {
        return [
            Forms\Components\Actions\Action::make('save')
                ->label('Kaydet')
                ->submit('save'),
        ];
    }

    /**
     * Kullanıcıya canlı bir hesap önizlemesi göster.
     */
    protected function buildPreview(
        bool $commissionEnabled,
        float $commissionRate,
        bool $serviceFeeEnabled,
        float $serviceFee,
        bool $stopajEnabled,
        float $stopajRate,
        float $kdvRate,
        float $shippingFallback,
    ): string {
        $lines = [
            'Bayi A: ₺1.000 (KDV dahil)',
            'Bayi B: ₺1.500 (KDV dahil)',
            '',
            'KDV ayrıştırma (%'.number_format($kdvRate, 2).'):',
            sprintf('  Bayi A net: ₺%s · KDV: ₺%s',
                number_format(1000 / (1 + $kdvRate / 100), 2),
                number_format(1000 - (1000 / (1 + $kdvRate / 100)), 2),
            ),
            sprintf('  Bayi B net: ₺%s · KDV: ₺%s',
                number_format(1500 / (1 + $kdvRate / 100), 2),
                number_format(1500 - (1500 / (1 + $kdvRate / 100)), 2),
            ),
            '',
        ];

        $netA = 1000 / (1 + $kdvRate / 100);
        $netB = 1500 / (1 + $kdvRate / 100);
        $commA = $commissionEnabled ? $netA * $commissionRate / 100 : 0;
        $commB = $commissionEnabled ? $netB * $commissionRate / 100 : 0;
        $stopA = $stopajEnabled ? $netA * $stopajRate / 100 : 0;
        $stopB = $stopajEnabled ? $netB * $stopajRate / 100 : 0;
        $shippingA = $shippingFallback;
        $shippingB = $shippingFallback;
        $svcFee = $serviceFeeEnabled ? $serviceFee : 0;
        $grandTotal = 1000 + 1500 + $shippingA + $shippingB + $svcFee;
        $payoutA = 1000 - $commA - $stopA;
        $payoutB = 1500 - $commB - $stopB;

        $lines[] = sprintf('Komisyon (%%%s, KDV-hariç gelir): A: ₺%s · B: ₺%s', number_format($commissionRate, 2),
            number_format($commA, 2), number_format($commB, 2));
        $lines[] = sprintf('Stopaj (%%%s, KDV-hariç gelir): A: ₺%s · B: ₺%s', number_format($stopajRate, 2),
            number_format($stopA, 2), number_format($stopB, 2));
        $lines[] = '';
        $lines[] = sprintf('Bayi A Net Hakediş: ₺%s', number_format($payoutA, 2));
        $lines[] = sprintf('Bayi B Net Hakediş: ₺%s', number_format($payoutB, 2));
        $lines[] = '';
        $lines[] = '── Alıcı tarafı ──';
        $lines[] = sprintf('  Ürünler: ₺%s', number_format(2500, 2));
        $lines[] = sprintf('  Kargo (2 satıcı × ₺%s): ₺%s', number_format($shippingFallback, 2), number_format($shippingA + $shippingB, 2));
        $lines[] = sprintf('  Hizmet Bedeli: ₺%s', number_format($svcFee, 2));
        $lines[] = sprintf('  GENEL TOPLAM: ₺%s', number_format($grandTotal, 2));

        return implode("\n", $lines);
    }
}
