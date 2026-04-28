<?php

namespace App\Filament\Pages;

use App\Models\Banner;
use Filament\Forms;
use Filament\Forms\Concerns\InteractsWithForms;
use Filament\Forms\Contracts\HasForms;
use Filament\Forms\Form;
use Filament\Notifications\Notification;
use Filament\Pages\Page;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class BannerManagerPage extends Page implements HasForms
{
    use InteractsWithForms;

    protected static ?string $navigationIcon = 'heroicon-o-photo';

    protected static ?string $navigationLabel = 'Banner Yönetimi';

    protected static ?string $navigationGroup = 'CMS';

    protected static ?int $navigationSort = 1;

    protected static ?string $title = 'Banner Yönetimi';

    protected static string $view = 'filament.pages.banner-manager';

    public ?array $data = [];

    public function mount(): void
    {
        $this->data['location'] = 'home_hero';
        $this->loadBanners();
    }

    public function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Select::make('location')
                    ->label('Konum')
                    ->options(Banner::locationOptions())
                    ->required()
                    ->live()
                    ->afterStateUpdated(fn () => $this->loadBanners())
                    ->columnSpanFull(),

                Forms\Components\Placeholder::make('location_help')
                    ->label('')
                    ->content(fn (Forms\Get $get) => static::locationHelpContent($get('location')))
                    ->columnSpanFull(),

                Forms\Components\Repeater::make('banners')
                    ->label('')
                    ->schema(fn (Forms\Get $get) => $this->getBannerSchema((string) $get('location')))
                    ->collapsible()
                    ->collapsed()
                    ->cloneable()
                    ->reorderableWithButtons()
                    ->itemLabel(fn (array $state): string => $state['title'] ?? 'Banner')
                    ->addActionLabel('Banner Ekle')
                    ->defaultItems(0)
                    ->columnSpanFull(),
            ])
            ->statePath('data');
    }

    /**
     * Konuma göre hangi alanların frontend'te göründüğünü açıklayan info içeriği.
     */
    protected static function locationHelpContent(?string $location): \Illuminate\Support\HtmlString
    {
        $rows = match ($location) {
            'home_hero' => [
                'Anasayfa hero — sol panel beyaz: <b>başlık + alt başlık + buton</b>; sağ panel: <b>tek büyük görsel</b>.',
                'Önerilen görsel: <b>1600 × 550 px</b> (yatay, ürün/sahne fotoğrafı). Görsel sağ paneli tamamen kaplar (<code>object-cover</code>).',
                'Kullanılan alanlar: <b>title, subtitle, button_text, link_url, image_path</b>.',
                'Kullanılmayan: <code>badge_text</code>, <code>bg_color</code> (hero artık tam görsel zemin).',
                '<code>tab_name</code> dolu olan hero banner\'lar üst chip carousel\'de grup oluşturur.',
            ],
            'home_promo' => [
                'Hero altı 2\'li promo şeridi (sıcak gradient kart).',
                '<b>Görsel otomatiktir:</b> sistem <code>link_url</code>\'deki kategoriden temsil ürün görselini çeker — sağ tarafta 120×120 alanda gösterir.',
                'Yüklenen <code>image_path</code> sadece <b>fallback</b>: kategori eşleşmesi yoksa veya kategori görselsizse kullanılır. Bu yüzden link_url\'i mevcut bir kategoriye işaret etmeniz yeterli.',
                'Kullanılan alanlar: <b>title, subtitle, link_url</b>. (image_path opsiyonel fallback)',
            ],
            'home_middle' => [
                'Orta 3\'lü banner alanı — gradient kart. <b>Görsel kullanılmıyor</b> — sadece metin + buton tasarımı.',
                'Kullanılan alanlar: <b>title, subtitle, badge_text (üst etiket), button_text (CTA pill), link_url</b>.',
                'Yüklenmiş <code>image_path</code> bu konumda görünmez (boş bırakılabilir).',
            ],
            'home_featured_campaigns' => [
                'Öne Çıkan Kampanyalar alanı — ana sayfadaki 4\'lü kart grid.',
                'Bu alan artık <b>tek konumdan</b> yönetilir; eski <code>home_grid</code>, <code>home_brand</code>, <code>home_showcase</code> seçenekleri yeni kayıt için kullanılmaz.',
                'Önerilen görsel: <b>960 × 1200 px</b> (4:5). Görsel efekt/opacity uygulanmadan doğrudan gösterilir.',
                'Kullanılan alanlar: <b>title, subtitle, button_text, link_url, image_path</b>.',
            ],
            'home_video_stories' => [
                'İyi ki Almışım Diyeceğiniz Ürünler alanı — ana sayfadaki 4\'lü dikey kart grid.',
                'Önerilen görsel: <b>900 × 1200 px</b> (3:4). Daha yüksek kalite için <b>1200 × 1600 px</b> yükleyebilirsiniz.',
                'Görsel kartı tamamen kaplar; metinler ve oynat butonu frontend tarafından üst katmanda gösterilir.',
                'Kullanılan alanlar: <b>title, subtitle, button_text, link_url, image_path</b>.',
            ],
            default => [
                'Banner içeriği bu konumda admin paneline kaydedilir, frontend ilgili location\'ı çağırarak gösterir.',
            ],
        };

        $html = '<div class="rounded-md border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-100"><div class="mb-2 font-semibold">📋 Bu konum için frontend kullanımı</div><ul class="list-disc space-y-1 pl-5">';
        foreach ($rows as $row) {
            $html .= '<li>'.$row.'</li>';
        }
        $html .= '</ul></div>';

        return new \Illuminate\Support\HtmlString($html);
    }

    protected function getBannerSchema(string $location = 'home_hero'): array
    {
        $imageHelp = match ($location) {
            'home_hero' => 'Hero sağ panel — önerilen boyut <b>1600 × 550 px</b> (~3:1, yatay sahne fotoğrafı). Tam alan kaplar.',
            'home_promo' => 'Promo kartı görseli <b>kategori\'den otomatik</b> çekilir. Buraya yüklediğiniz görsel yalnızca kategori eşleşmesi yoksa fallback olarak kullanılır (önerilen 500 × 500 px).',
            'home_featured_campaigns' => 'Öne çıkan kampanya kartı — önerilen boyut <b>960 × 1200 px</b> (4:5). Görsel efekt uygulanmadan gösterilir.',
            'home_video_stories' => 'İyi ki Almışım kartı — önerilen boyut <b>900 × 1200 px</b> (3:4). Yüksek kalite için <b>1200 × 1600 px</b>.',
            default => 'PNG / JPG / WEBP, max 5 MB.',
        };

        $usesImage = in_array($location, ['home_hero', 'home_promo', 'home_featured_campaigns', 'home_video_stories'], true);
        $imageRequired = in_array($location, ['home_hero', 'home_featured_campaigns', 'home_video_stories'], true);
        $usesBadge = $location === 'home_middle';
        $usesButton = in_array($location, ['home_hero', 'home_middle', 'home_featured_campaigns', 'home_video_stories'], true);

        return [
            Forms\Components\Hidden::make('id'),
            Forms\Components\FileUpload::make('image_path')
                ->label('Görsel')
                ->helperText(new \Illuminate\Support\HtmlString($imageHelp))
                ->image()
                ->directory('banners')
                ->visible($usesImage)
                ->required($imageRequired)
                ->imagePreviewHeight('200')
                ->acceptedFileTypes(['image/jpeg', 'image/png', 'image/webp'])
                ->maxSize(5120)
                ->columnSpanFull(),
            Forms\Components\Grid::make(2)
                ->schema([
                    Forms\Components\TextInput::make('link_url')
                        ->label('Link (Tıklama Yönlendirmesi)')
                        ->placeholder('/market/category/el-aletleri')
                        ->helperText('Banner tıklandığında yönlendirilecek sayfa'),
                    Forms\Components\TextInput::make('title')
                        ->label('Başlık')
                        ->placeholder($location === 'home_hero' ? 'Elektrikli El Aletleri' : 'Aynı Gün Sevkiyat')
                        ->helperText(match ($location) {
                            'home_hero' => 'Hero sol panelde h1 başlık olarak görünür.',
                            'home_featured_campaigns' => 'Kart üzerinde başlık olarak görünür. Görselin içinde metin varsa kısa tutun.',
                            'home_video_stories' => 'Kart üzerindeki küçük başlık olarak kullanılır.',
                            default => null,
                        }),
                ]),
            ...($location === 'home_hero' ? [
                Forms\Components\TextInput::make('tab_name')
                    ->label('Üst Chip Etiketi')
                    ->placeholder('Kampanyalar')
                    ->helperText('Hero üzerinde görünen carousel chip butonunun yazısı. Boş bırakırsanız banner başlığı kullanılır.')
                    ->maxLength(50)
                    ->columnSpanFull(),
            ] : []),
            Forms\Components\Section::make('Gelişmiş Ayarlar')
                ->schema([
                    Forms\Components\Grid::make(2)
                        ->schema([
                            Forms\Components\TextInput::make('subtitle')
                                ->label('Alt Başlık')
                                ->placeholder('Opsiyonel')
                                ->helperText(match ($location) {
                                    'home_hero' => 'Hero sol panelde başlık altında görünür.',
                                    'home_featured_campaigns' => 'Kart altında açıklama metni olarak görünür.',
                                    'home_video_stories' => 'Kart alt kısmında kısa açıklama olarak görünür.',
                                    default => null,
                                }),
                            Forms\Components\TextInput::make('badge_text')
                                ->label('Badge Metni')
                                ->placeholder('Opsiyonel')
                                ->helperText('Orta 3\'lü banner alanında üst etiket olarak görünür.')
                                ->visible($usesBadge),
                        ]),
                    Forms\Components\Grid::make(2)
                        ->schema([
                            Forms\Components\TextInput::make('button_text')
                                ->label('Buton Metni')
                                ->placeholder($location === 'home_hero' ? 'Kategoriyi Keşfet' : 'Opsiyonel')
                                ->helperText($location === 'home_hero' ? 'Hero CTA butonunda görünür.' : null)
                                ->visible($usesButton),
                            Forms\Components\TextInput::make('sort_order')
                                ->label('Sıralama')
                                ->numeric()
                                ->default(0),
                        ]),
                    Forms\Components\Grid::make(3)
                        ->schema([
                            Forms\Components\Toggle::make('is_active')
                                ->label('Aktif')
                                ->default(true),
                            Forms\Components\DateTimePicker::make('starts_at')
                                ->label('Başlangıç Tarihi'),
                            Forms\Components\DateTimePicker::make('ends_at')
                                ->label('Bitiş Tarihi'),
                        ]),
                ])
                ->collapsed()
                ->collapsible(),
        ];
    }

    public function loadBanners(): void
    {
        $location = $this->data['location'] ?? 'home_hero';
        $banners = Banner::where('location', $location)->ordered()->get();

        $this->data['banners'] = $banners->map(fn (Banner $b) => $this->bannerToArray($b))->values()->toArray();
    }

    protected function bannerToArray(Banner $banner): array
    {
        return [
            'id' => $banner->id,
            'image_path' => $banner->image_path ? [$banner->image_path] : [],
            'title' => $banner->title,
            'subtitle' => $banner->subtitle,
            'badge_text' => $banner->badge_text,
            'link_url' => $banner->link_url,
            'button_text' => $banner->button_text,
            'tab_name' => $banner->tab_name,
            'is_active' => $banner->is_active,
            'sort_order' => $banner->sort_order,
            'starts_at' => $banner->starts_at?->format('Y-m-d H:i:s'),
            'ends_at' => $banner->ends_at?->format('Y-m-d H:i:s'),
        ];
    }

    public function save(): void
    {
        $data = $this->form->getState();
        $location = $data['location'];

        DB::beginTransaction();
        try {
            $existingIds = Banner::where('location', $location)->pluck('id')->toArray();
            $processedIds = [];

            foreach ($data['banners'] ?? [] as $index => $bannerData) {
                $id = $this->saveBanner($bannerData, $location, $index, $existingIds);
                $processedIds[] = $id;
            }

            // Kaldırılan bannerları sil
            $toDelete = array_diff($existingIds, $processedIds);
            if (! empty($toDelete)) {
                Banner::whereIn('id', $toDelete)->delete();
            }

            // İlgili cache'leri temizle
            Cache::forget("cms.banners.{$location}");
            Cache::forget('cms.homepage');

            DB::commit();

            Notification::make()
                ->title('Bannerlar başarıyla kaydedildi')
                ->success()
                ->send();

            $this->loadBanners();
        } catch (\Exception $e) {
            DB::rollBack();

            Notification::make()
                ->title('Hata oluştu')
                ->body($e->getMessage())
                ->danger()
                ->send();
        }
    }

    protected function saveBanner(array $data, string $location, int $sortIndex, array $existingIds): int
    {
        $imagePath = $data['image_path'] ?? null;
        if (is_array($imagePath)) {
            $imagePath = array_values($imagePath)[0] ?? null;
        }

        $attrs = [
            'location' => $location,
            'tab_name' => $location === 'home_hero' ? ($data['tab_name'] ?? null) : null,
            'bg_color' => null,
            'image_path' => $imagePath,
            'title' => $data['title'] ?? null,
            'subtitle' => $data['subtitle'] ?? null,
            'badge_text' => $data['badge_text'] ?? null,
            'link_url' => $data['link_url'] ?? null,
            'button_text' => $data['button_text'] ?? null,
            'is_active' => $data['is_active'] ?? true,
            'sort_order' => $data['sort_order'] ?? $sortIndex,
            'starts_at' => $data['starts_at'] ?? null,
            'ends_at' => $data['ends_at'] ?? null,
        ];

        $bannerId = $data['id'] ?? null;

        if ($bannerId && in_array($bannerId, $existingIds)) {
            Banner::where('id', $bannerId)->update($attrs);

            return $bannerId;
        }

        return Banner::create($attrs)->id;
    }
}
