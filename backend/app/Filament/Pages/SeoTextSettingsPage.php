<?php

namespace App\Filament\Pages;

use App\Models\Setting;
use Filament\Forms\Components\RichEditor;
use Filament\Forms\Components\Section;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Concerns\InteractsWithForms;
use Filament\Forms\Contracts\HasForms;
use Filament\Forms\Form;
use Filament\Notifications\Notification;
use Filament\Pages\Page;
use Illuminate\Support\Facades\Cache;

class SeoTextSettingsPage extends Page implements HasForms
{
    use InteractsWithForms;

    protected static ?string $navigationIcon = 'heroicon-o-document-text';
    protected static ?string $navigationGroup = 'CMS';
    protected static ?string $title = 'SEO Tanitim Yazisi';
    protected static ?string $navigationLabel = 'SEO Tanitim Yazisi';
    protected static ?int $navigationSort = 13;
    protected static string $view = 'filament.pages.seo-text-settings';

    public const DEFAULT_TITLE = 'Türkiyenin B2B Hırdavat Tedarik Platformu';

    public const DEFAULT_CONTENT = '<p>i-hirdavat.com, Türkiye genelindeki bayiler, toptancılar, üreticiler ve kurumsal alıcılar için özel olarak tasarlanmış bir B2B hırdavat tedarik platformudur. Platformumuz üzerinden 125.000&#43; çeşit el aleti, elektrikli alet, bağlantı elemanı, tesisat malzemesi, elektrik malzemesi ve iş güvenliği ekipmanına bayi fiyatlarıyla ulaşabilirsiniz.</p><h2>Neden i-hırdavat?</h2><p>Doğrulanmış bayilerden doğrudan alışveriş yapabilir, fiyatları karşılaştırabilir ve en uygun teklifi seçebilirsiniz. Tüm işlemleriniz PayTR güvenli ödeme altyapısı üzerinden gerçekleşir, kargo entegrasyonu ile tek tıkla takip edilebilir.</p><h2>Geniş Ürün Yelpazesi</h2><p>Bosch, Makita, DeWalt, Stanley, 3M, İzeltaş, Hilti, Milwaukee ve daha fazla markanın binlerce ürününü tek platformda bulabilirsiniz. Ürün kataloğumuzu düzenli olarak güncelliyor ve yeni SKU\'ları sisteme ekliyoruz.</p><h2>14:00\'a Kadar Siparişler Aynı Gün Kargoda</h2><p>Kullanıcı dostu arayüzümüz sayesinde saniyeler içinde sipariş verebilir, SKU bazlı toplu yükleme yapabilir, kargo takibinizi ve geçmiş siparişlerinizi inceleyebilirsiniz. Türkiye geneli hızlı ve güvenli teslimat seçenekleriyle ürünleriniz aynı gün kargoya verilir.</p>';

    public ?array $data = [];

    public function mount(): void
    {
        $this->form->fill([
            'title' => Setting::getValue('seo_text.title', self::DEFAULT_TITLE),
            'content' => Setting::getValue('seo_text.content', self::DEFAULT_CONTENT),
        ]);
    }

    public function form(Form $form): Form
    {
        return $form
            ->schema([
                Section::make('Ana Sayfa SEO Tanitim Yazisi')
                    ->description('Market ana sayfasinin en altinda gorunecek SEO uyumlu tanitim metni')
                    ->schema([
                        TextInput::make('title')
                            ->label('Baslik')
                            ->placeholder('Örneğin: Türkiyenin B2B Hırdavat Platformu'),
                        RichEditor::make('content')
                            ->label('Icerik')
                            ->toolbarButtons([
                                'bold',
                                'italic',
                                'underline',
                                'strike',
                                'link',
                                'orderedList',
                                'bulletList',
                                'h2',
                                'h3',
                                'blockquote',
                                'redo',
                                'undo',
                            ])
                            ->placeholder('SEO tanitim yazisini buraya girin...'),
                    ]),
            ])
            ->statePath('data');
    }

    public function submit(): void
    {
        $data = $this->form->getState();

        Setting::setValue('seo_text.title', $data['title'] ?? '', 'seo_text', 'string');
        Setting::setValue('seo_text.content', $data['content'] ?? '', 'seo_text', 'text');

        Cache::forget('cms.homepage.seo_text');

        Notification::make()
            ->title('SEO tanitim yazisi kaydedildi.')
            ->success()
            ->send();
    }
}
