'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { ArrowRight, Boxes, Filter, Loader2, PackageCheck, Scale, TrendingDown } from 'lucide-react';
import Link from 'next/link';
import { productsApi, Product } from '@/lib/api';
import { ProductCard } from '@/components/market/ProductCard';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

const INITIAL_LOAD = 15;
const LOAD_MORE_COUNT = 15;
type QuickFilter = 'all' | 'in_stock' | 'advantage' | 'multi_offer';

function toNumber(value: number | string | null | undefined): number | undefined {
    if (value === null || value === undefined) return undefined;
    if (typeof value === 'number') return Number.isFinite(value) ? value : undefined;
    const normalized = value.includes(',') ? value.replace(/\./g, '').replace(',', '.') : value;
    const parsed = Number.parseFloat(normalized);
    return Number.isFinite(parsed) ? parsed : undefined;
}

function hasPriceAdvantage(product: Product): boolean {
    const psf = toNumber(product.psf);
    const lowest = toNumber(product.lowest_price);
    return Boolean(psf && lowest && psf > lowest);
}

export function AllProductsList() {
    const [products, setProducts] = useState<Product[]>([]);
    const [visibleCount, setVisibleCount] = useState(INITIAL_LOAD);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [page, setPage] = useState(1);
    const [activeFilter, setActiveFilter] = useState<QuickFilter>('all');
    // Mount başına bir seed: aynı seed page=1 ve page=2'yi tutarlı kılar,
    // her sayfa reload'unda yeni seed → yeni karışım.
    const [seed] = useState<number>(() => Math.floor(Math.random() * 1_000_000));

    useEffect(() => {
        const loadProducts = async () => {
            try {
                const response = await productsApi.getAll({
                    page: 1,
                    per_page: INITIAL_LOAD,
                    has_specs: true,
                    has_offers: true,
                    sort_by: 'random',
                    seed,
                });
                const loaded = response.data?.products || [];
                setProducts(loaded);
                setHasMore(loaded.length >= INITIAL_LOAD);
            } catch (error) {
                console.error('Failed to load products', error);
            } finally {
                setIsLoading(false);
            }
        };
        loadProducts();
    }, [seed]);

    const loadMore = useCallback(async () => {
        if (isLoadingMore) return;
        setIsLoadingMore(true);
        try {
            const nextPage = page + 1;
            const response = await productsApi.getAll({
                page: nextPage,
                per_page: LOAD_MORE_COUNT,
                has_specs: true,
                has_offers: true,
                sort_by: 'random',
                seed,
            });
            const newProducts = response.data?.products || [];
            if (newProducts.length > 0) {
                setProducts(prev => [...prev, ...newProducts]);
                setPage(nextPage);
                setVisibleCount(prev => prev + newProducts.length);
                setHasMore(newProducts.length >= LOAD_MORE_COUNT);
            } else {
                setHasMore(false);
            }
        } catch (error) {
            console.error('Failed to load more products', error);
        } finally {
            setIsLoadingMore(false);
        }
    }, [page, isLoadingMore, seed]);

    const filteredProducts = products.filter((product) => {
        if (activeFilter === 'in_stock') return (product.offers_count ?? 0) > 0;
        if (activeFilter === 'advantage') return hasPriceAdvantage(product);
        if (activeFilter === 'multi_offer') return (product.offers_count ?? 0) > 1;
        return true;
    });

    const stats = [
        {
            label: 'Yüklü ürün',
            value: products.length,
            icon: Boxes,
        },
        {
            label: 'Stoklu teklif',
            value: products.filter((product) => (product.offers_count ?? 0) > 0).length,
            icon: PackageCheck,
        },
        {
            label: 'Avantajlı',
            value: products.filter(hasPriceAdvantage).length,
            icon: TrendingDown,
        },
    ];

    const quickFilters: Array<{ key: QuickFilter; label: string; icon: React.ComponentType<{ className?: string }> }> = [
        { key: 'all', label: 'Tümü', icon: Filter },
        { key: 'in_stock', label: 'Stoklu', icon: PackageCheck },
        { key: 'advantage', label: 'Avantajlı', icon: TrendingDown },
        { key: 'multi_offer', label: 'Çok teklifli', icon: Scale },
    ];

    if (isLoading) {
        return (
            <section className="py-8">
                <div className="flex items-center gap-3 mb-6">
                    <Skeleton className="w-10 h-10 rounded-lg" />
                    <Skeleton className="h-6 w-32" />
                </div>
                <div className="bg-white -mx-4 sm:-mx-7 px-4 sm:px-7 border-y border-[#f0eceb] py-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {Array(INITIAL_LOAD).fill(0).map((_, i) => (
                            <Skeleton key={i} className="h-[120px] rounded-2xl" />
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    if (products.length === 0) return null;

    return (
        <section className="py-4">
            <div className="bg-white -mx-4 sm:-mx-7 px-4 sm:px-7 border-y border-[#f0eceb] py-12">
                <div className="mb-6 border-b border-neutral-200 pb-6">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                        <div>
                            <p className="text-[11px] font-bold uppercase text-primary-700">
                                Satın alma ekranı
                            </p>
                            <h2 className="text-2xl font-black text-neutral-900">Tüm Ürünler</h2>
                            <p className="mt-1 max-w-2xl text-sm text-neutral-600">
                                Ürünleri PSF, en düşük teklif, stok ve teklif sayısına göre hızlıca tarayın.
                            </p>
                        </div>
                        <Link href="/market/products" className="group inline-flex h-9 w-fit items-center gap-1.5 rounded-sm border border-neutral-200 bg-white px-4 text-sm font-bold text-primary-700 transition-colors hover:bg-primary-700 hover:text-white">
                            Tümünü Gör
                            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                        </Link>
                    </div>

                    <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-3">
                        {stats.map((stat) => {
                            const Icon = stat.icon;
                            return (
                                <div key={stat.label} className="flex items-center gap-3 rounded-sm border border-neutral-200 bg-neutral-50 px-3 py-2.5">
                                    <Icon className="h-4 w-4 text-primary-700" />
                                    <div>
                                        <p className="text-[11px] font-bold uppercase text-neutral-500">{stat.label}</p>
                                        <p className="text-base font-black text-neutral-900 tabular-num">{stat.value}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
                        {quickFilters.map((filter) => {
                            const Icon = filter.icon;
                            const active = activeFilter === filter.key;
                            return (
                                <button
                                    key={filter.key}
                                    type="button"
                                    onClick={() => {
                                        setActiveFilter(filter.key);
                                        setVisibleCount(INITIAL_LOAD);
                                    }}
                                    className={cn(
                                        "inline-flex h-9 shrink-0 items-center gap-2 rounded-sm border px-3 text-sm font-bold transition-colors",
                                        active
                                            ? "border-primary-700 bg-primary-700 text-white"
                                            : "border-neutral-200 bg-white text-neutral-700 hover:border-primary-500 hover:text-primary-700"
                                    )}
                                >
                                    <Icon className="h-4 w-4" />
                                    {filter.label}
                                </button>
                            );
                        })}
                    </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filteredProducts.slice(0, visibleCount).map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>

                {filteredProducts.length === 0 && (
                    <div className="rounded-md border border-dashed border-neutral-300 bg-neutral-50 px-4 py-10 text-center">
                        <p className="font-bold text-neutral-900">Bu filtreye uygun ürün bulunamadı.</p>
                        <p className="mt-1 text-sm text-neutral-600">Farklı bir hızlı filtre seçerek devam edebilirsiniz.</p>
                    </div>
                )}

                <div className="text-center pt-6 mt-4 border-t border-[#f0eceb]">
                    {hasMore && filteredProducts.length >= visibleCount ? (
                        <Button
                            className="bg-[#1E3A5F] text-white hover:bg-[#0F1F35] rounded-[14px] font-extrabold shadow-sm"
                            onClick={loadMore}
                            disabled={isLoadingMore}
                        >
                            {isLoadingMore ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Yükleniyor...
                                </>
                            ) : (
                                <>
                                    Daha Fazla Göster
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </>
                            )}
                        </Button>
                    ) : (
                        <Link href="/market/products">
                            <Button className="bg-[#1E3A5F] text-white hover:bg-[#0F1F35] rounded-[14px] font-extrabold shadow-sm">
                                Tüm Ürünleri Gör
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        </Link>
                    )}
                </div>
            </div>
        </section>
    );
}
