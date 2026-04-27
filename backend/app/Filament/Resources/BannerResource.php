<?php

namespace App\Filament\Resources;

use App\Filament\Resources\BannerResource\Pages;
use App\Models\Banner;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class BannerResource extends Resource
{
    protected static ?string $model = Banner::class;

    protected static ?string $navigationIcon = 'heroicon-o-photo';

    protected static ?string $navigationLabel = 'Bannerlar';

    protected static ?string $navigationGroup = 'CMS';

    protected static ?int $navigationSort = 1;

    protected static bool $shouldRegisterNavigation = false;

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make('Banner Bilgileri')
                    ->schema([
                        Forms\Components\FileUpload::make('image_path')
                            ->label('Görsel')
                            ->image()
                            ->directory('banners')
                            ->required()
                            ->imagePreviewHeight('200')
                            ->acceptedFileTypes(['image/jpeg', 'image/png', 'image/webp'])
                            ->maxSize(5120) // 5MB
                            ->helperText(new \Illuminate\Support\HtmlString(
                                'Önerilen boyutlar konuma göre: '
                                .'<b>Hero</b> 1600×550 px (sağ panel tam görsel) · '
                                .'<b>Promo</b> 200×200 px (küçük thumb) · '
                                .'<b>Middle</b> 400×280 px (sağ-alt köşe) · '
                                .'<b>Grid/Showcase</b> 500×600 px (4:5 kart).'
                            ))
                            ->columnSpanFull(),
                        Forms\Components\TextInput::make('title')
                            ->label('Başlık (Opsiyonel)')
                            ->placeholder('Elektrikli El Aletleri')
                            ->helperText('Hero\'da h1, diğer konumlarda ana başlık olarak gösterilir.')
                            ->maxLength(255),
                        Forms\Components\TextInput::make('subtitle')
                            ->label('Alt Başlık (Opsiyonel)')
                            ->placeholder('Bosch, Makita, DeWalt — profesyonel matkap & taşlama')
                            ->maxLength(255),
                        Forms\Components\TextInput::make('badge_text')
                            ->label('Badge Metni (Opsiyonel)')
                            ->placeholder('ÖZEL FIRSAT')
                            ->helperText('Üst köşede görünen etiket. Hero için kullanılmaz; Middle / Grid için tercih edin.')
                            ->disabled(fn (Forms\Get $get): bool => $get('location') === 'home_hero')
                            ->maxLength(50),
                        Forms\Components\TextInput::make('link_url')
                            ->label('Link URL (Opsiyonel)')
                            ->placeholder('/market/category/el-aletleri')
                            ->helperText('Tıklandığında gidilecek sayfa. Mevcut kategori slug\'ına yönlendirin.')
                            ->maxLength(255),
                        Forms\Components\TextInput::make('button_text')
                            ->label('Buton Metni (Opsiyonel)')
                            ->placeholder('Kategoriyi Keşfet')
                            ->maxLength(50),
                    ])->columns(2),

                Forms\Components\Section::make('Ayarlar')
                    ->schema([
                        Forms\Components\Select::make('location')
                            ->label('Konum')
                            ->options(Banner::locationOptions())
                            ->required()
                            ->live(),
                        Forms\Components\TextInput::make('tab_name')
                            ->label('Tab Adı')
                            ->placeholder('Kampanyalar')
                            ->helperText('Hero üst chip carousel etiketi. Aynı tab adlı banner\'lar aynı chip içinde dönüşümle gösterilir.')
                            ->maxLength(50)
                            ->visible(fn (Forms\Get $get): bool => $get('location') === 'home_hero'),
                        // bg_color: yeni hero tasarımı tam görsel olduğu için artık kullanılmıyor;
                        // alan veritabanında tutulur ama formda gizli — geriye dönük uyumluluk.
                        Forms\Components\TextInput::make('sort_order')
                            ->label('Sıra')
                            ->numeric()
                            ->default(0),
                        Forms\Components\Toggle::make('is_active')
                            ->label('Aktif')
                            ->default(true),
                        Forms\Components\DateTimePicker::make('starts_at')
                            ->label('Başlangıç Tarihi'),
                        Forms\Components\DateTimePicker::make('ends_at')
                            ->label('Bitiş Tarihi'),
                    ])->columns(2),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\ImageColumn::make('image_path')
                    ->label('Görsel')
                    ->height(40)
                    ->width(80),
                Tables\Columns\TextColumn::make('title')
                    ->label('Başlık')
                    ->searchable()
                    ->limit(30)
                    ->tooltip(fn ($record) => $record->title),
                Tables\Columns\TextColumn::make('location')
                    ->label('Konum')
                    ->badge()
                    ->formatStateUsing(fn (string $state): string => match ($state) {
                        'home_hero' => 'Hero',
                        'home_promo' => 'Promosyon',
                        'home_middle' => 'Orta',
                        'home_brand' => 'Marka',
                        'home_grid' => 'Grid',
                        'home_bottom' => 'Alt',
                        'home_showcase' => 'Vitrin',
                        'sidebar' => 'Sidebar',
                        'category_top' => 'Kategori',
                        default => $state,
                    }),
                Tables\Columns\TextColumn::make('tab_name')
                    ->label('Tab')
                    ->badge()
                    ->color('info')
                    ->placeholder('-'),
                Tables\Columns\TextColumn::make('sort_order')
                    ->label('Sıra')
                    ->sortable(),
                Tables\Columns\IconColumn::make('is_active')
                    ->label('Aktif')
                    ->boolean(),
                Tables\Columns\TextColumn::make('starts_at')
                    ->label('Başlangıç')
                    ->dateTime('d.m.Y')
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
                Tables\Columns\TextColumn::make('ends_at')
                    ->label('Bitiş')
                    ->dateTime('d.m.Y')
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->defaultSort('sort_order')
            ->filters([
                Tables\Filters\SelectFilter::make('location')
                    ->label('Konum')
                    ->options(Banner::locationOptions()),
                Tables\Filters\TernaryFilter::make('is_active')
                    ->label('Aktif'),
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
                Tables\Actions\DeleteAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                ]),
            ])
            ->reorderable('sort_order');
    }

    public static function getRelations(): array
    {
        return [];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListBanners::route('/'),
            'create' => Pages\CreateBanner::route('/create'),
            'edit' => Pages\EditBanner::route('/{record}/edit'),
        ];
    }
}
