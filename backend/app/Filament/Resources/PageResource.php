<?php

declare(strict_types=1);

namespace App\Filament\Resources;

use App\Filament\Resources\PageResource\Pages;
use App\Models\Page;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use FilamentTiptapEditor\TiptapEditor;
use Illuminate\Support\Str;

class PageResource extends Resource
{
    protected static ?string $model = Page::class;

    protected static ?string $navigationIcon = 'heroicon-o-document-duplicate';

    protected static ?string $navigationLabel = 'Sayfalar';

    protected static ?string $modelLabel = 'Sayfa';

    protected static ?string $pluralModelLabel = 'Sayfalar';

    protected static ?string $navigationGroup = 'CMS';

    protected static ?int $navigationSort = 5;

    /**
     * Frontend route'larina hardcoded baglanmis slug'lar.
     * Bu sayfalarin slug'i Filament formundan degistirilemez —
     * URL kontrati frontend kodunda sabit oldugu icin slug degisirse
     * sayfa "Sayfa bulunamadi" verir.
     */
    private const SYSTEM_SLUGS = [
        'hakkimizda',
        'iletisim',
        'hizli-siparis',
        'toplu-alim',
        'kvkk',
        'terms',
        'privacy',
        'cookies',
        'mesafeli-satis-sozlesmesi',
        'iptal-iade',
        'uyelik-sozlesmesi',
    ];

    /**
     * Yardim ve sistem sayfalari icin slug "URL kontrati" oldugundan
     * formdan editlenemez. Yardim slug'lari `yardim` prefix'i ile baslar.
     */
    public static function isSystemSlug(?string $slug): bool
    {
        if ($slug === null || $slug === '') {
            return false;
        }

        if (in_array($slug, self::SYSTEM_SLUGS, true)) {
            return true;
        }

        return str_starts_with($slug, 'yardim');
    }

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Grid::make(3)
                    ->schema([
                        // Sol Kolon (2/3)
                        Forms\Components\Section::make('Icerik')
                            ->schema([
                                Forms\Components\TextInput::make('title')
                                    ->label('Baslik')
                                    ->required()
                                    ->maxLength(255)
                                    ->live(onBlur: true)
                                    ->afterStateUpdated(function (Forms\Set $set, ?string $state, ?Page $record) {
                                        // Sistem sayfalari icin slug auto-sync KAPALI: URL kontrati korunur.
                                        if ($record !== null && self::isSystemSlug($record->slug)) {
                                            return;
                                        }
                                        $set('slug', Str::slug($state ?? ''));
                                    }),
                                Forms\Components\TextInput::make('slug')
                                    ->label('Slug')
                                    ->required()
                                    ->unique(ignoreRecord: true)
                                    ->maxLength(255)
                                    ->disabled(fn (?Page $record): bool => $record !== null && self::isSystemSlug($record->slug))
                                    ->dehydrated(fn (?Page $record): bool => $record === null || ! self::isSystemSlug($record->slug))
                                    ->helperText(function (?Page $record): ?string {
                                        if ($record !== null && self::isSystemSlug($record->slug)) {
                                            return '🔒 Sistem sayfası — URL kontratı sabit, slug değiştirilemez. Yalnızca başlık, içerik ve SEO alanlarını düzenleyebilirsiniz.';
                                        }

                                        return null;
                                    }),
                                Forms\Components\Textarea::make('excerpt')
                                    ->label('Ozet')
                                    ->rows(3)
                                    ->maxLength(500)
                                    ->helperText('Sayfa hakkinda kisa aciklama'),
                                TiptapEditor::make('content')
                                    ->label('Icerik')
                                    ->columnSpanFull(),
                            ])
                            ->columnSpan(2),

                        // Sag Kolon (1/3)
                        Forms\Components\Grid::make(1)
                            ->schema([
                                Forms\Components\Section::make('Ayarlar')
                                    ->schema([
                                        Forms\Components\Select::make('status')
                                            ->label('Durum')
                                            ->options([
                                                'draft' => 'Taslak',
                                                'published' => 'Yayinda',
                                            ])
                                            ->default('published')
                                            ->required(),
                                        Forms\Components\Select::make('template')
                                            ->label('Sablon')
                                            ->options([
                                                'default' => 'Varsayilan',
                                                'contact' => 'Iletisim',
                                                'legal' => 'Yasal',
                                            ])
                                            ->default('default')
                                            ->required(),
                                        Forms\Components\TextInput::make('sort_order')
                                            ->label('Siralama')
                                            ->numeric()
                                            ->default(0),
                                    ]),

                                Forms\Components\Section::make('SEO')
                                    ->schema([
                                        Forms\Components\TextInput::make('meta_title')
                                            ->label('Meta Baslik')
                                            ->maxLength(70),
                                        Forms\Components\Textarea::make('meta_description')
                                            ->label('Meta Aciklama')
                                            ->rows(3)
                                            ->maxLength(160),
                                    ]),
                            ])
                            ->columnSpan(1),
                    ]),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('title')
                    ->label('Baslik')
                    ->searchable()
                    ->sortable()
                    ->limit(50),
                Tables\Columns\TextColumn::make('slug')
                    ->label('Slug')
                    ->searchable()
                    ->limit(30),
                Tables\Columns\TextColumn::make('status')
                    ->label('Durum')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'published' => 'success',
                        'draft' => 'warning',
                        default => 'gray',
                    })
                    ->formatStateUsing(fn (string $state): string => match ($state) {
                        'published' => 'Yayinda',
                        'draft' => 'Taslak',
                        default => $state,
                    }),
                Tables\Columns\TextColumn::make('template')
                    ->label('Sablon')
                    ->badge()
                    ->color('info')
                    ->formatStateUsing(fn (string $state): string => match ($state) {
                        'default' => 'Varsayilan',
                        'contact' => 'Iletisim',
                        'legal' => 'Yasal',
                        default => $state,
                    }),
                Tables\Columns\TextColumn::make('updated_at')
                    ->label('Guncelleme')
                    ->dateTime('d.m.Y H:i')
                    ->sortable(),
            ])
            ->defaultSort('sort_order', 'asc')
            ->filters([
                Tables\Filters\SelectFilter::make('status')
                    ->label('Durum')
                    ->options([
                        'draft' => 'Taslak',
                        'published' => 'Yayinda',
                    ]),
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
                Tables\Actions\DeleteAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                ]),
            ]);
    }

    public static function getRelations(): array
    {
        return [];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListPages::route('/'),
            'create' => Pages\CreatePage::route('/create'),
            'edit' => Pages\EditPage::route('/{record}/edit'),
        ];
    }
}
