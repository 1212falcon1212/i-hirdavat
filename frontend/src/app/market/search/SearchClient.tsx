'use client';

import { useEffect, useState, useCallback, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { productsApi, Product } from '@/lib/api';
import { ProductCard } from '@/components/market/ProductCard';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
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
    Box,
    Filter,
    X,
    ChevronRight,
    SlidersHorizontal,
    Search,
    Package,
} from 'lucide-react';
import { useInfiniteScroll } from '@/hooks/use-infinite-scroll';
import { addRecentSearch } from '@/lib/search-history';

interface Filters {
    brand: string;
    minPrice: string;
    maxPrice: string;
    sortBy: string;
    inStockOnly: boolean;
}

function SearchContent() {
    const searchParams = useSearchParams();
    const query = searchParams.get('q') || '';

    const [products, setProducts] = useState<Product[]>([]);
    const [availableBrands, setAvailableBrands] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [totalProducts, setTotalProducts] = useState(0);
    const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
    const filtersRef = useRef(0);
    const searchSavedRef = useRef(false);

    const [filters, setFilters] = useState<Filters>({
        brand: '',
        minPrice: '',
        maxPrice: '',
        sortBy: 'offers_count',
        inStockOnly: false,
    });

    const PER_PAGE = 24;

    // Save search query to recent searches on first load
    useEffect(() => {
        if (query && !searchSavedRef.current) {
            addRecentSearch(query);
            searchSavedRef.current = true;
        }
    }, [query]);

    const loadProducts = useCallback(async (page: number, append: boolean) => {
        if (!query) {
            setProducts([]);
            setIsLoading(false);
            return;
        }
        const requestId = ++filtersRef.current;
        if (append) {
            setIsLoadingMore(true);
        } else {
            setIsLoading(true);
        }
        try {
            const response = await productsApi.getAll({
                page,
                per_page: PER_PAGE,
                search: query,
                brand: filters.brand || undefined,
                min_price: filters.minPrice || undefined,
                max_price: filters.maxPrice || undefined,
                sort_by: filters.sortBy,
            });
            if (filtersRef.current !== requestId) return;
            if (response.data) {
                let newProducts = response.data.products;

                // Client-side filter: in-stock only
                if (filters.inStockOnly) {
                    newProducts = newProducts.filter(
                        (p) => (p.offers_count ?? 0) > 0
                    );
                }

                setProducts(prev => append ? [...prev, ...newProducts] : newProducts);
                setTotalProducts(response.data.pagination?.total || 0);
                setHasMore(page < (response.data.pagination?.last_page || 1));
                if (response.data.filters?.brands) {
                    setAvailableBrands(response.data.filters.brands);
                }
            }
        } catch (error) {
            console.error('Search failed:', error);
        } finally {
            if (filtersRef.current === requestId) {
                setIsLoading(false);
                setIsLoadingMore(false);
            }
        }
    }, [query, filters]);

    // Initial load & filter/query changes
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
        setMobileFilterOpen(false);
    };

    const clearFilters = () => {
        applyFilters({ brand: '', minPrice: '', maxPrice: '', sortBy: 'offers_count', inStockOnly: false });
    };

    const hasActiveFilters = filters.brand || filters.minPrice || filters.maxPrice || filters.sortBy !== 'offers_count' || filters.inStockOnly;

    // Count products with offers per brand (from loaded products)
    const brandOfferCounts = products.reduce<Record<string, number>>((acc, p) => {
        if (p.brand && (p.offers_count ?? 0) > 0) {
            acc[p.brand] = (acc[p.brand] || 0) + 1;
        }
        return acc;
    }, {});

    const FilterContent = () => (
        <div className="space-y-5">
            {/* Sort */}
            <div>
                <Label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 block">
                    Siralama
                </Label>
                <Select
                    value={filters.sortBy}
                    onValueChange={(value) => applyFilters({ ...filters, sortBy: value })}
                >
                    <SelectTrigger className="w-full h-9">
                        <SelectValue placeholder="Siralama secin" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="offers_count">Teklif Sayisi</SelectItem>
                        <SelectItem value="price_asc">Fiyat (Artan)</SelectItem>
                        <SelectItem value="price_desc">Fiyat (Azalan)</SelectItem>
                        <SelectItem value="name">Isim (A-Z)</SelectItem>
                        <SelectItem value="newest">En Yeniler</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Stock Filter */}
            <div className="pt-4 border-t border-black/5 dark:border-white/5">
                <Label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 block">
                    Stok Durumu
                </Label>
                <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-700 dark:text-slate-300">Stokta Var</span>
                    <Switch
                        checked={filters.inStockOnly}
                        onCheckedChange={(checked) => applyFilters({ ...filters, inStockOnly: checked })}
                    />
                </div>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                    Yalnizca teklifi olan urunleri goster
                </p>
            </div>

            {/* Brand */}
            {availableBrands.length > 0 && (
                <div className="pt-4 border-t border-black/5 dark:border-white/5">
                    <Label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 block">
                        Marka
                    </Label>
                    <div className="space-y-1 max-h-48 overflow-y-auto">
                        <button
                            onClick={() => applyFilters({ ...filters, brand: '' })}
                            className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-sm transition-colors ${
                                !filters.brand
                                    ? 'bg-[#F0F4FA] text-[#1E3A5F] font-semibold dark:bg-[#0F1F35]/30 dark:text-[#D9E2EF]'
                                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                            }`}
                        >
                            <span>Tum Markalar</span>
                        </button>
                        {availableBrands.map((brand) => (
                            <button
                                key={brand}
                                onClick={() => applyFilters({ ...filters, brand: filters.brand === brand ? '' : brand })}
                                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-sm transition-colors ${
                                    filters.brand === brand
                                        ? 'bg-[#F0F4FA] text-[#1E3A5F] font-semibold dark:bg-[#0F1F35]/30 dark:text-[#D9E2EF]'
                                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                                }`}
                            >
                                <span className="truncate">{brand}</span>
                                {brandOfferCounts[brand] && (
                                    <span className="ml-2 flex-shrink-0 text-[10px] font-bold bg-[#D9E2EF] dark:bg-[#0F1F35]/40 text-[#1E3A5F] dark:text-[#D9E2EF] px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                                        {brandOfferCounts[brand]}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Price Range */}
            <div className="pt-4 border-t border-black/5 dark:border-white/5">
                <Label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 block">
                    Fiyat Araligi
                </Label>
                <div className="flex items-center gap-2">
                    <Input
                        type="number"
                        placeholder="Min"
                        value={filters.minPrice}
                        onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                        className="w-full h-9"
                        min="0"
                    />
                    <span className="text-slate-300 text-xs">&mdash;</span>
                    <Input
                        type="number"
                        placeholder="Max"
                        value={filters.maxPrice}
                        onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                        className="w-full h-9"
                        min="0"
                    />
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-2 h-8 text-xs bg-[#F0F4FA] text-[#1E3A5F] border-[#D9E2EF] hover:bg-[#0F1F35] hover:text-white dark:bg-[#0F1F35]/30 dark:text-[#D9E2EF] dark:border-[#0F1F35] dark:hover:bg-[#0F1F35]/50"
                    onClick={() => applyFilters(filters)}
                >
                    Fiyat Uygula
                </Button>
            </div>

            {hasActiveFilters && (
                <div className="pt-4 border-t border-black/5 dark:border-white/5">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="w-full h-8 text-xs text-red-500 hover:text-red-600 hover:bg-red-50/80 dark:hover:bg-red-900/20"
                        onClick={clearFilters}
                    >
                        <X className="w-3.5 h-3.5 mr-1.5" />
                        Filtreleri Temizle
                    </Button>
                </div>
            )}
        </div>
    );

    // Sort description for info bar
    const getSortLabel = (sortBy: string): string => {
        switch (sortBy) {
            case 'price_asc': return 'Fiyat (Artan)';
            case 'price_desc': return 'Fiyat (Azalan)';
            case 'name': return 'Isim (A-Z)';
            case 'newest': return 'En Yeniler';
            default: return 'Teklif Sayisi';
        }
    };

    // No query state
    if (!query) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="flex flex-col items-center justify-center py-16 px-4">
                    <Search className="h-16 w-16 text-slate-300 dark:text-slate-600 mb-4" />
                    <h2 className="text-xl font-semibold mb-2 text-slate-900 dark:text-white">Arama yapin</h2>
                    <p className="text-slate-500 dark:text-slate-400 mb-4">
                        Urun aramak icin yukaridaki arama kutusunu kullanin.
                    </p>
                    <Link href="/market">
                        <Button>
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Pazaryerine Don
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-5">
                <Link href="/market" className="hover:text-[#1E3A5F] transition-colors">
                    Pazaryeri
                </Link>
                <ChevronRight className="w-4 h-4" />
                <span className="text-slate-900 dark:text-white font-medium">Arama Sonuclari</span>
            </div>

            {/* Search Info Bar */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-[#f0eceb] dark:border-slate-700 p-4 sm:p-5 mb-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                        <h1 className="text-lg sm:text-xl font-bold text-[#1a1a1a] dark:text-white">
                            <span className="text-[#1E3A5F] dark:text-[#D9E2EF]">&quot;{query}&quot;</span>
                            {' '}icin arama sonuclari
                        </h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                            {isLoading ? (
                                <span className="inline-block w-16 h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse align-middle" />
                            ) : (
                                <span className="font-semibold text-[#1a1a1a] dark:text-white">{totalProducts}</span>
                            )}
                            {' '}urun bulundu
                            {' '}&middot; {getSortLabel(filters.sortBy)} ile sirali
                        </p>
                    </div>

                    {/* Mobile filter trigger */}
                    <Sheet open={mobileFilterOpen} onOpenChange={setMobileFilterOpen}>
                        <SheetTrigger asChild>
                            <Button variant="outline" className="lg:hidden gap-2 shrink-0 self-start">
                                <Filter className="w-4 h-4" />
                                Filtrele
                                {hasActiveFilters && <span className="w-2 h-2 rounded-full bg-[#1E3A5F]" />}
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="w-80">
                            <SheetHeader>
                                <SheetTitle>Filtreler</SheetTitle>
                            </SheetHeader>
                            <div className="mt-6">
                                <FilterContent />
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>

                {/* Active Filter Tags */}
                {hasActiveFilters && (
                    <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-[#f0eceb] dark:border-slate-700">
                        <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">Aktif:</span>
                        {filters.brand && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#F0F4FA] dark:bg-[#0F1F35]/30 text-[#1E3A5F] dark:text-[#D9E2EF] text-xs font-semibold rounded-full">
                                {filters.brand}
                                <button
                                    onClick={() => applyFilters({ ...filters, brand: '' })}
                                    className="hover:bg-[#1E3A5F]/10 rounded-full p-0.5"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </span>
                        )}
                        {(filters.minPrice || filters.maxPrice) && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#F0F4FA] dark:bg-[#0F1F35]/30 text-[#1E3A5F] dark:text-[#D9E2EF] text-xs font-semibold rounded-full">
                                {filters.minPrice || '0'} - {filters.maxPrice || '\u221e'} TL
                                <button
                                    onClick={() => applyFilters({ ...filters, minPrice: '', maxPrice: '' })}
                                    className="hover:bg-[#1E3A5F]/10 rounded-full p-0.5"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </span>
                        )}
                        {filters.inStockOnly && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-500 text-xs font-semibold rounded-full">
                                Stokta Var
                                <button
                                    onClick={() => applyFilters({ ...filters, inStockOnly: false })}
                                    className="hover:bg-primary-100 dark:hover:bg-primary-900/50 rounded-full p-0.5"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </span>
                        )}
                        {filters.sortBy !== 'offers_count' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold rounded-full">
                                <SlidersHorizontal className="w-3 h-3" />
                                {getSortLabel(filters.sortBy)}
                            </span>
                        )}
                        <button
                            onClick={clearFilters}
                            className="text-xs text-red-500 hover:text-red-600 font-medium ml-1"
                        >
                            Temizle
                        </button>
                    </div>
                )}
            </div>

            {/* Main Content */}
            <div className="flex gap-6">
                {/* Desktop Sidebar */}
                <aside className="hidden lg:block w-60 flex-shrink-0">
                    <div className="sticky top-20 bg-white dark:bg-slate-900 rounded-xl border border-[#f0eceb] dark:border-slate-700">
                        <div className="px-5 py-3 border-b border-black/5 dark:border-white/5 bg-gradient-to-r from-[#F0F4FA]/80 to-primary-50/50 dark:from-[#0F1F35]/20 dark:to-primary-900/10 rounded-t-xl">
                            <h2 className="text-xs font-semibold text-[#1E3A5F] dark:text-[#D9E2EF] uppercase tracking-widest flex items-center gap-2">
                                <SlidersHorizontal className="w-3.5 h-3.5" />
                                Filtreler
                            </h2>
                        </div>
                        <div className="px-5 py-4">
                            <FilterContent />
                        </div>
                    </div>
                </aside>

                {/* Products Grid */}
                <div className="flex-1 min-w-0">
                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-black/10 dark:border-slate-700 overflow-clip">
                    {isLoading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-3">
                            {[...Array(12)].map((_, i) => (
                                <Skeleton key={i} className="h-[120px] rounded-2xl" />
                            ))}
                        </div>
                    ) : products.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 px-4">
                            <Package className="h-16 w-16 text-slate-300 dark:text-slate-600 mb-4" />
                            <h2 className="text-xl font-semibold mb-2 text-slate-900 dark:text-white">
                                Sonuç bulunamadı
                            </h2>
                            <p className="text-slate-500 dark:text-slate-400 mb-4 text-center max-w-md">
                                &quot;{query}&quot; ile eşleşen ürün bulunamadı.
                                {hasActiveFilters && ' Filtreleri değiştirerek tekrar deneyebilirsiniz.'}
                            </p>
                            {hasActiveFilters ? (
                                <Button onClick={clearFilters} variant="outline" className="gap-2">
                                    <X className="w-4 h-4" />
                                    Filtreleri Temizle
                                </Button>
                            ) : (
                                <Link href="/market">
                                    <Button className="gap-2">
                                        <ArrowLeft className="w-4 h-4" />
                                        Pazaryerine Dön
                                    </Button>
                                </Link>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-3">
                            {products.map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    )}

                    {/* Infinite Scroll Sentinel & Loading */}
                    {!isLoading && products.length > 0 && (
                        <div className="py-6">
                            {isLoadingMore && (
                                <div className="flex justify-center items-center gap-3 py-4">
                                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                                    <span className="text-sm text-slate-500">Daha fazla ürün yükleniyor...</span>
                                </div>
                            )}
                            {hasMore && <div ref={sentinelRef} className="h-1" />}
                            {!hasMore && products.length > 0 && (
                                <p className="text-center text-sm text-slate-400 py-2">
                                    Tüm ürünler gösteriliyor ({products.length} / {totalProducts})
                                </p>
                            )}
                        </div>
                    )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export function SearchClient() {
    return (
        <Suspense fallback={
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <Skeleton className="h-8 w-48 mb-5" />
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-[#f0eceb] dark:border-slate-700 p-5 mb-5">
                    <Skeleton className="h-6 w-64 mb-2" />
                    <Skeleton className="h-4 w-40" />
                </div>
                <div className="flex gap-6">
                    <div className="hidden lg:block w-60 flex-shrink-0">
                        <Skeleton className="h-64 w-full rounded-xl" />
                    </div>
                    <div className="flex-1">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {[...Array(12)].map((_, i) => (
                                <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border overflow-hidden">
                                    <Skeleton className="aspect-square w-full" />
                                    <div className="p-3.5 space-y-2">
                                        <Skeleton className="h-3 w-16" />
                                        <Skeleton className="h-4 w-full" />
                                        <Skeleton className="h-5 w-20 mt-3" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        }>
            <SearchContent />
        </Suspense>
    );
}
