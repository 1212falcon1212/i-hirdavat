'use client';

import { useEffect, useState, useCallback, useRef, useMemo, Suspense } from 'react';
import { useInfiniteScroll } from '@/hooks/use-infinite-scroll';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { productsApi, Product, Category, api } from '@/lib/api';
import { ProductCard } from '@/components/market/ProductCard';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import {
    ArrowLeft,
    Package,
    Filter,
    X,
    ChevronRight,
    LayoutGrid,
    List,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Slug'ı okunabilir isme dönüştür
const formatSlugToName = (slug: string): string => {
    const words = slug.replace(/-/g, ' ').split(' ');
    return words.map(word => {
        if (!word) return '';
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    }).join(' ');
};

/**
 * Category bazlı teknik özellik filtreleri (CLAUDE.md §6.3).
 * Backend `filter_schema` endpoint'i henüz yok — client-side mapping.
 * Her kategori kökü için farklı facet'ler gösterilir.
 */
interface FacetOption {
    value: string;
    label: string;
    count?: number;
}

interface Facet {
    key: string;
    label: string;
    options: FacetOption[];
}

const DYNAMIC_FACETS: Record<string, Facet[]> = {
    'elektrikli-aletler': [
        {
            key: 'power',
            label: 'Güç (Watt)',
            options: [
                { value: '0-400', label: '0-400W' },
                { value: '400-600', label: '400-600W' },
                { value: '600-800', label: '600-800W' },
                { value: '800+', label: '800W+' },
            ],
        },
        {
            key: 'energy',
            label: 'Enerji Kaynağı',
            options: [
                { value: 'corded', label: 'Kablolu (220V)' },
                { value: 'battery-12', label: 'Akülü 12V' },
                { value: 'battery-18', label: 'Akülü 18V' },
                { value: 'battery-20', label: 'Akülü 20V+' },
            ],
        },
    ],
    'baglanti-elemanlari': [
        {
            key: 'm_size',
            label: 'M Ölçüsü',
            options: [
                { value: 'm4', label: 'M4' },
                { value: 'm5', label: 'M5' },
                { value: 'm6', label: 'M6' },
                { value: 'm8', label: 'M8' },
                { value: 'm10', label: 'M10' },
                { value: 'm12', label: 'M12' },
            ],
        },
        {
            key: 'coating',
            label: 'Kaplama',
            options: [
                { value: 'galvanized', label: 'Galvaniz' },
                { value: 'stainless', label: 'Paslanmaz' },
                { value: 'black', label: 'Siyah Oksit' },
            ],
        },
    ],
    'is-guvenligi': [
        {
            key: 'size',
            label: 'Beden',
            options: [
                { value: 's', label: 'S' },
                { value: 'm', label: 'M' },
                { value: 'l', label: 'L' },
                { value: 'xl', label: 'XL' },
                { value: 'xxl', label: 'XXL' },
            ],
        },
        {
            key: 'protection',
            label: 'Koruma Sınıfı',
            options: [
                { value: 'ffp2', label: 'FFP2' },
                { value: 'ffp3', label: 'FFP3' },
                { value: 'cut-a', label: 'Kesim A' },
                { value: 'cut-b', label: 'Kesim B' },
                { value: 'cut-c', label: 'Kesim C' },
            ],
        },
    ],
};

interface Filters {
    brand: string;
    minPrice: string;
    maxPrice: string;
    sortBy: string;
    stock: 'all' | 'in_stock' | 'preorder';
    dynamic: Record<string, string[]>;
}

interface Subcategory {
    id: number;
    name: string;
    slug: string;
    full_slug?: string;
}

interface BreadcrumbItem {
    id: number;
    name: string;
    slug: string;
    full_slug?: string;
}

interface CategoryInfo extends Category {
    full_slug?: string;
    parent?: {
        id: number;
        name: string;
        slug: string;
        full_slug?: string;
    };
}

type ViewMode = 'grid' | 'list';

function MarketCategoryContent() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();

    const slugArray = Array.isArray(params.slug) ? params.slug : [params.slug];
    const fullSlug = slugArray.join('/');
    const lastSlug = slugArray[slugArray.length - 1];
    const rootSlug = slugArray[0];

    const [categoryInfo, setCategoryInfo] = useState<CategoryInfo | null>(null);
    const [breadcrumb, setBreadcrumb] = useState<BreadcrumbItem[]>([]);
    const [, setSubcategories] = useState<Subcategory[]>([]);
    const [availableBrands, setAvailableBrands] = useState<string[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [totalProducts, setTotalProducts] = useState(0);
    const filtersRef = useRef(0);
    const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
    const [viewMode, setViewMode] = useState<ViewMode>('grid');

    const [filters, setFilters] = useState<Filters>({
        brand: searchParams.get('brand') || '',
        minPrice: searchParams.get('min_price') || '',
        maxPrice: searchParams.get('max_price') || '',
        sortBy: searchParams.get('sort_by') || 'offers_count',
        stock: (searchParams.get('stock') as Filters['stock']) || 'all',
        dynamic: {},
    });

    const categoryName = categoryInfo?.name || formatSlugToName(lastSlug || '');

    const activeFacets = useMemo(() => {
        return (rootSlug ? DYNAMIC_FACETS[rootSlug] : undefined) ?? [];
    }, [rootSlug]);

    const loadCategoryInfo = useCallback(async () => {
        try {
            const categoryResponse = await api.get<{
                category?: CategoryInfo & { children?: Subcategory[] };
                breadcrumb?: BreadcrumbItem[];
            }>(`/categories/slug/${fullSlug}`);
            if (categoryResponse.data) {
                const data = categoryResponse.data;
                if (data.category) setCategoryInfo(data.category);
                if (data.breadcrumb) setBreadcrumb(data.breadcrumb);
                if (data.category?.children) setSubcategories(data.category.children);
            }
        } catch (error) {
            console.error('Failed to load category:', error);
        }
    }, [fullSlug]);

    const loadProducts = useCallback(
        async (page: number, append: boolean) => {
            const requestId = ++filtersRef.current;
            if (append) setIsLoadingMore(true);
            else setIsLoading(true);
            try {
                const response = await productsApi.getAll({
                    category: lastSlug,
                    page,
                    per_page: 12,
                    brand: filters.brand || undefined,
                    min_price: filters.minPrice || undefined,
                    max_price: filters.maxPrice || undefined,
                    sort_by: filters.sortBy,
                });
                if (filtersRef.current !== requestId) return;
                if (response.data) {
                    const newProducts = response.data.products;
                    setProducts((prev) => (append ? [...prev, ...newProducts] : newProducts));
                    setTotalProducts(response.data.pagination?.total || 0);
                    setHasMore(page < (response.data.pagination?.last_page || 1));
                    if (response.data.filters?.brands) {
                        setAvailableBrands(response.data.filters.brands);
                    }
                    if (response.data.filters?.subcategories) {
                        setSubcategories(response.data.filters.subcategories);
                    }
                    if (response.data.filters?.category && !categoryInfo) {
                        setCategoryInfo(response.data.filters.category);
                    }
                }
            } catch (error) {
                console.error('Failed to load products:', error);
            } finally {
                if (filtersRef.current === requestId) {
                    setIsLoading(false);
                    setIsLoadingMore(false);
                }
            }
        },
        [lastSlug, filters, categoryInfo]
    );

    useEffect(() => {
        loadCategoryInfo();
    }, [loadCategoryInfo]);

    useEffect(() => {
        setProducts([]);
        setCurrentPage(1);
        setHasMore(true);
        loadProducts(1, false);
    }, [loadProducts]);

    const handleLoadMore = useCallback(() => {
        const nextPage = currentPage + 1;
        setCurrentPage(nextPage);
        loadProducts(nextPage, true);
    }, [currentPage, loadProducts]);

    const { sentinelRef } = useInfiniteScroll({
        hasMore,
        isLoading: isLoading || isLoadingMore,
        onLoadMore: handleLoadMore,
    });

    const applyFilters = (newFilters: Filters) => {
        setFilters(newFilters);
        const urlParams = new URLSearchParams();
        if (newFilters.brand) urlParams.set('brand', newFilters.brand);
        if (newFilters.minPrice) urlParams.set('min_price', newFilters.minPrice);
        if (newFilters.maxPrice) urlParams.set('max_price', newFilters.maxPrice);
        if (newFilters.sortBy && newFilters.sortBy !== 'offers_count') {
            urlParams.set('sort_by', newFilters.sortBy);
        }
        if (newFilters.stock && newFilters.stock !== 'all') {
            urlParams.set('stock', newFilters.stock);
        }
        const queryString = urlParams.toString();
        router.push(
            `/market/category/${fullSlug}${queryString ? `?${queryString}` : ''}`,
            { scroll: false }
        );
        setMobileFilterOpen(false);
    };

    const clearFilters = () => {
        applyFilters({
            brand: '',
            minPrice: '',
            maxPrice: '',
            sortBy: 'offers_count',
            stock: 'all',
            dynamic: {},
        });
    };

    const hasActiveFilters =
        !!filters.brand ||
        !!filters.minPrice ||
        !!filters.maxPrice ||
        filters.sortBy !== 'offers_count' ||
        filters.stock !== 'all' ||
        Object.values(filters.dynamic).some((vals) => vals.length > 0);

    // ===== Filter Sidebar =====
    const FilterContent = () => (
        <div className="space-y-5">
            {/* Sıralama */}
            <div>
                <p className="text-[11px] font-bold uppercase tracking-[1.5px] text-neutral-600 mb-2">
                    Sıralama
                </p>
                <Select
                    value={filters.sortBy}
                    onValueChange={(value) => applyFilters({ ...filters, sortBy: value })}
                >
                    <SelectTrigger className="w-full h-10 rounded-sm border-neutral-200 bg-white">
                        <SelectValue placeholder="Sıralama seçin" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="offers_count">Önerilen</SelectItem>
                        <SelectItem value="best_selling">En Çok Satan</SelectItem>
                        <SelectItem value="price_asc">Fiyat: Düşük → Yüksek</SelectItem>
                        <SelectItem value="price_desc">Fiyat: Yüksek → Düşük</SelectItem>
                        <SelectItem value="newest">Yeni Eklenenler</SelectItem>
                        <SelectItem value="name">İsim (A-Z)</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Stok Durumu */}
            <div className="pt-4 border-t border-neutral-100">
                <p className="text-[11px] font-bold uppercase tracking-[1.5px] text-neutral-600 mb-2.5">
                    Stok Durumu
                </p>
                <div className="space-y-1.5">
                    {[
                        { value: 'in_stock' as const, label: 'Stokta Var' },
                        { value: 'preorder' as const, label: 'Ön Sipariş' },
                    ].map((opt) => (
                        <label
                            key={opt.value}
                            className="flex items-center justify-between cursor-pointer group"
                        >
                            <span className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={filters.stock === opt.value}
                                    onChange={() =>
                                        applyFilters({
                                            ...filters,
                                            stock: filters.stock === opt.value ? 'all' : opt.value,
                                        })
                                    }
                                    className="w-4 h-4 accent-primary-700"
                                />
                                <span className="text-sm text-neutral-800 group-hover:text-primary-700 transition-colors">
                                    {opt.label}
                                </span>
                            </span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Marka */}
            {availableBrands.length > 0 && (
                <div className="pt-4 border-t border-neutral-100">
                    <p className="text-[11px] font-bold uppercase tracking-[1.5px] text-neutral-600 mb-2.5">
                        Marka
                    </p>
                    <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
                        {availableBrands.map((brand) => (
                            <label
                                key={brand}
                                className="flex items-center justify-between cursor-pointer group"
                            >
                                <span className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={filters.brand === brand}
                                        onChange={() =>
                                            applyFilters({
                                                ...filters,
                                                brand: filters.brand === brand ? '' : brand,
                                            })
                                        }
                                        className="w-4 h-4 accent-primary-700"
                                    />
                                    <span className="text-sm text-neutral-800 group-hover:text-primary-700 transition-colors truncate">
                                        {brand}
                                    </span>
                                </span>
                            </label>
                        ))}
                    </div>
                </div>
            )}

            {/* Fiyat Aralığı */}
            <div className="pt-4 border-t border-neutral-100">
                <p className="text-[11px] font-bold uppercase tracking-[1.5px] text-neutral-600 mb-2.5">
                    Fiyat (₺)
                </p>
                <div className="flex items-center gap-2 mb-2">
                    <input
                        type="number"
                        placeholder="Min"
                        value={filters.minPrice}
                        onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                        className="w-full h-9 px-2.5 text-sm border border-neutral-200 rounded-sm focus:outline-none focus:border-primary-500 tabular-num"
                        min="0"
                    />
                    <span className="text-neutral-300">—</span>
                    <input
                        type="number"
                        placeholder="Max"
                        value={filters.maxPrice}
                        onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                        className="w-full h-9 px-2.5 text-sm border border-neutral-200 rounded-sm focus:outline-none focus:border-primary-500 tabular-num"
                        min="0"
                    />
                </div>
                <Button
                    size="sm"
                    className="w-full h-8 text-xs bg-primary-700 hover:bg-primary-900 text-white"
                    onClick={() => applyFilters(filters)}
                >
                    Uygula
                </Button>
            </div>

            {/* Teknik Özellikler — kategori-bazlı dinamik */}
            {activeFacets.length > 0 && (
                <div className="pt-4 border-t border-neutral-100">
                    <div className="bg-accent-bg border-l-4 border-accent-500 rounded-sm p-3">
                        <p className="text-[11px] font-bold uppercase tracking-[1.5px] text-accent-600 mb-3">
                            Teknik Özellikler
                        </p>
                        <div className="space-y-4">
                            {activeFacets.map((facet) => (
                                <div key={facet.key}>
                                    <p className="text-xs font-semibold text-neutral-800 mb-1.5">
                                        {facet.label}
                                    </p>
                                    <div className="space-y-1">
                                        {facet.options.map((opt) => {
                                            const selected = (filters.dynamic[facet.key] || []).includes(opt.value);
                                            return (
                                                <label
                                                    key={opt.value}
                                                    className="flex items-center gap-2 cursor-pointer group"
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={selected}
                                                        onChange={() => {
                                                            const current = filters.dynamic[facet.key] || [];
                                                            const next = selected
                                                                ? current.filter((v) => v !== opt.value)
                                                                : [...current, opt.value];
                                                            setFilters({
                                                                ...filters,
                                                                dynamic: { ...filters.dynamic, [facet.key]: next },
                                                            });
                                                        }}
                                                        className="w-4 h-4 accent-accent-600"
                                                    />
                                                    <span className="text-sm text-neutral-800 group-hover:text-accent-600 transition-colors flex-1">
                                                        {opt.label}
                                                    </span>
                                                </label>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {hasActiveFilters && (
                <div className="pt-4 border-t border-neutral-100">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="w-full h-8 text-xs text-danger hover:text-danger hover:bg-danger-bg"
                        onClick={clearFilters}
                    >
                        <X className="w-3.5 h-3.5 mr-1.5" />
                        Filtreleri Temizle
                    </Button>
                </div>
            )}
        </div>
    );

    const totalLabel = totalProducts > 0
        ? `${totalProducts.toLocaleString('tr-TR')} ürün bulundu`
        : 'Ürün bulunamadı';

    return (
        <div className="max-w-[1300px] mx-auto px-4 sm:px-7 py-6">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-neutral-500 mb-4 overflow-x-auto whitespace-nowrap pb-2">
                <Link href="/market" className="hover:text-primary-700 transition-colors flex-shrink-0">
                    Pazaryeri
                </Link>

                {breadcrumb.length > 0 ? (
                    breadcrumb.map((item, index) => (
                        <span key={item.id} className="flex items-center gap-2 flex-shrink-0">
                            <span className="text-neutral-300">/</span>
                            {index === breadcrumb.length - 1 ? (
                                <span className="text-neutral-900 font-semibold">{item.name}</span>
                            ) : (
                                <Link
                                    href={`/market/category/${item.full_slug || item.slug}`}
                                    className="hover:text-primary-700 transition-colors"
                                >
                                    {item.name}
                                </Link>
                            )}
                        </span>
                    ))
                ) : (
                    slugArray.map((slug, index) => (
                        <span key={index} className="flex items-center gap-2 flex-shrink-0">
                            <span className="text-neutral-300">/</span>
                            {index === slugArray.length - 1 ? (
                                <span className="text-neutral-900 font-semibold">
                                    {categoryInfo?.name || formatSlugToName(slug || '')}
                                </span>
                            ) : (
                                <Link
                                    href={`/market/category/${slugArray.slice(0, index + 1).join('/')}`}
                                    className="hover:text-primary-700 transition-colors"
                                >
                                    {formatSlugToName(slug || '')}
                                </Link>
                            )}
                        </span>
                    ))
                )}
            </nav>

            {/* Header */}
            <div className="flex items-start justify-between gap-4 mb-6 pb-4 border-b border-neutral-200">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight">
                        {categoryName}
                    </h1>
                    <p className="text-sm text-neutral-500 mt-1 tabular-num">{totalLabel}</p>
                </div>

                <div className="flex items-center gap-2">
                    {/* View mode toggle */}
                    <div className="hidden sm:flex items-center rounded-sm border border-neutral-200 bg-white overflow-hidden">
                        <button
                            type="button"
                            onClick={() => setViewMode('grid')}
                            className={cn(
                                'inline-flex items-center gap-1.5 px-4 h-10 text-sm font-semibold transition-colors',
                                viewMode === 'grid'
                                    ? 'bg-primary-900 text-white'
                                    : 'text-neutral-800 hover:bg-neutral-50'
                            )}
                            aria-pressed={viewMode === 'grid'}
                        >
                            <LayoutGrid className="w-4 h-4" />
                            Grid
                        </button>
                        <button
                            type="button"
                            onClick={() => setViewMode('list')}
                            className={cn(
                                'inline-flex items-center gap-1.5 px-4 h-10 text-sm font-semibold transition-colors border-l border-neutral-200',
                                viewMode === 'list'
                                    ? 'bg-primary-900 text-white'
                                    : 'text-neutral-800 hover:bg-neutral-50'
                            )}
                            aria-pressed={viewMode === 'list'}
                        >
                            <List className="w-4 h-4" />
                            Liste
                        </button>
                    </div>

                    {/* Mobile filter button */}
                    <Sheet open={mobileFilterOpen} onOpenChange={setMobileFilterOpen}>
                        <SheetTrigger asChild>
                            <Button variant="outline" className="lg:hidden gap-2 rounded-sm">
                                <Filter className="w-4 h-4" />
                                Filtrele
                                {hasActiveFilters && (
                                    <span className="w-2 h-2 rounded-full bg-accent-500" />
                                )}
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="w-80">
                            <SheetHeader>
                                <SheetTitle>Filtreler</SheetTitle>
                            </SheetHeader>
                            <div className="mt-6 px-4 pb-8">
                                <FilterContent />
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>

            {/* Main content */}
            <div className="flex gap-6">
                {/* Desktop sidebar */}
                <aside className="hidden lg:block w-[260px] flex-shrink-0">
                    <div className="sticky top-24 bg-white rounded-sm border border-neutral-200 overflow-hidden">
                        <div className="flex items-center justify-between px-5 py-3 border-b border-neutral-200">
                            <h2 className="text-[13px] font-black text-neutral-900 uppercase tracking-[1.5px]">
                                Filtreler
                            </h2>
                            {hasActiveFilters && (
                                <button
                                    type="button"
                                    onClick={clearFilters}
                                    className="text-xs text-danger hover:underline font-medium"
                                >
                                    Temizle
                                </button>
                            )}
                        </div>
                        <div className="px-5 py-4">
                            <FilterContent />
                        </div>
                    </div>
                </aside>

                {/* Product grid */}
                <div className="flex-1 min-w-0">
                    {isLoading ? (
                        <div
                            className={cn(
                                'grid gap-3',
                                viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'
                            )}
                        >
                            {[...Array(6)].map((_, i) => (
                                <Skeleton key={i} className="h-[340px] rounded-sm" />
                            ))}
                        </div>
                    ) : products.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 px-4 bg-white rounded-sm border border-neutral-200">
                            <Package className="h-16 w-16 text-neutral-300 mb-4" />
                            <h2 className="text-xl font-semibold mb-2 text-neutral-900">
                                {hasActiveFilters
                                    ? 'Filtrelere uygun ürün bulunamadı'
                                    : 'Bu kategoride ürün yok'}
                            </h2>
                            <p className="text-neutral-500 mb-4 text-center">
                                {hasActiveFilters
                                    ? 'Filtreleri değiştirerek tekrar deneyin.'
                                    : 'Diğer kategorilere göz atabilirsiniz.'}
                            </p>
                            {hasActiveFilters ? (
                                <Button onClick={clearFilters} className="bg-primary-700 hover:bg-primary-900 text-white">
                                    <X className="w-4 h-4 mr-2" />
                                    Filtreleri Temizle
                                </Button>
                            ) : (
                                <Link href="/market">
                                    <Button className="bg-primary-700 hover:bg-primary-900 text-white">
                                        <ArrowLeft className="w-4 h-4 mr-2" />
                                        Pazaryerine Dön
                                    </Button>
                                </Link>
                            )}
                        </div>
                    ) : (
                        <>
                            <div
                                className={cn(
                                    'grid gap-3',
                                    viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'
                                )}
                            >
                                {products.map((product) => (
                                    <ProductCard
                                        key={product.id}
                                        product={product}
                                        variant={viewMode === 'list' ? 'list' : 'default'}
                                    />
                                ))}
                            </div>

                            <div className="py-6">
                                {isLoadingMore && (
                                    <div className="flex justify-center items-center gap-3 py-4">
                                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary-700 border-t-transparent" />
                                        <span className="text-sm text-neutral-500">Daha fazla ürün yükleniyor...</span>
                                    </div>
                                )}
                                {hasMore && <div ref={sentinelRef} className="h-1" />}
                                {!hasMore && products.length > 0 && (
                                    <p className="text-center text-sm text-neutral-400 py-2 tabular-num">
                                        Tüm ürünler gösteriliyor ({products.length} / {totalProducts})
                                    </p>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export function CategoryClient() {
    return (
        <Suspense
            fallback={
                <div className="max-w-[1300px] mx-auto px-4 sm:px-7 py-6">
                    <Skeleton className="h-5 w-48 mb-4" />
                    <Skeleton className="h-10 w-64 mb-2" />
                    <Skeleton className="h-4 w-32 mb-6" />
                    <div className="flex gap-6">
                        <Skeleton className="hidden lg:block w-[260px] h-[600px] rounded-sm" />
                        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {[...Array(6)].map((_, i) => (
                                <Skeleton key={i} className="h-[340px] rounded-sm" />
                            ))}
                        </div>
                    </div>
                </div>
            }
        >
            <MarketCategoryContent />
        </Suspense>
    );
}
