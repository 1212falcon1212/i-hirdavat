'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Wrench, Drill, Hammer, Ruler, Lightbulb, Sprout, ShieldCheck, Wind, Car, Box, Cog } from 'lucide-react';
import { categoriesApi, Category } from '@/lib/api';

/**
 * Root kategorilere yönlendiren tek-blok banner.
 * "/market" ana sayfasının en altında ClosingBanner yerine kullanılır.
 */

const CATEGORY_ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
    'aksesuarlar': Cog,
    'aydinlatma': Lightbulb,
    'dijital-olcme-cihazlari': Ruler,
    'el-aletleri': Wrench,
    'elektrikli-el-aletleri': Drill,
    'havali-el-aletleri': Wind,
    'hirdavat': Hammer,
    'hobi-urunleri-ve-bahce-aletleri': Sprout,
    'oto-bakim-aletleri': Car,
    'is-guvenligi': ShieldCheck,
    'diger-urunler': Box,
};

const SHORT_NAME_MAP: Record<string, string> = {
    'hobi-urunleri-ve-bahce-aletleri': 'Hobi & Bahçe',
    'dijital-olcme-cihazlari': 'Ölçme Cihazları',
    'oto-bakim-aletleri': 'Oto Bakım',
    'elektrikli-el-aletleri': 'Elektrikli Aletler',
    'havali-el-aletleri': 'Havalı Aletler',
};

// Footer'a girmeyecek/gizlenecek kategoriler (banner'da göstermek istemediklerimiz)
const HIDE_SLUGS = new Set(['indirimli-urunler', 'diger-urunler']);

interface RootCategory extends Category {
    children?: Category[];
    products_count?: number;
}

export function CategoryHighlightBanner() {
    const [categories, setCategories] = useState<RootCategory[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        categoriesApi.getAll().then((res) => {
            const list: RootCategory[] = res.data?.categories ?? [];
            const roots = list
                .filter((c) => !c.parent_id && !HIDE_SLUGS.has(c.slug))
                .sort((a, b) => (b.products_count ?? 0) - (a.products_count ?? 0))
                .slice(0, 8);
            setCategories(roots);
            setLoading(false);
        }).catch(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="rounded-3xl bg-primary-900 h-[320px] animate-pulse" />
        );
    }

    if (categories.length === 0) {
        return null;
    }

    return (
        <section className="relative overflow-hidden rounded-3xl bg-primary-900 border border-white/5">
            {/* Decorative accent stripes */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-accent-500 via-accent-400 to-accent-500" />
            <div className="absolute top-0 left-0 w-1.5 h-full bg-accent-500" />

            <div className="relative p-7 md:p-10">
                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-7">
                    <div>
                        <span className="inline-block text-[10px] font-bold tracking-[4px] uppercase text-accent-500 mb-2">
                            Tüm Kategoriler
                        </span>
                        <h3 className="text-2xl md:text-3xl font-black text-white leading-tight">
                            İhtiyacın olan kategoriyi seç, tek tıkla ürünlere ulaş
                        </h3>
                        <p className="text-sm text-white/60 mt-2 max-w-xl">
                            2.898 ürün · 11 ana kategori · doğrulanmış satıcılardan toptan fiyatlarla.
                        </p>
                    </div>
                    <Link
                        href="/market/products"
                        className="inline-flex items-center gap-2 text-accent-500 hover:text-accent-400 text-sm font-bold whitespace-nowrap"
                    >
                        Tüm Ürünleri Gör
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {categories.map((cat) => {
                        const Icon = CATEGORY_ICON_MAP[cat.slug] ?? Box;
                        const displayName = SHORT_NAME_MAP[cat.slug] ?? cat.name;
                        const productCount = cat.products_count ?? 0;
                        return (
                            <Link
                                key={cat.id}
                                href={`/market/category/${cat.full_slug ?? cat.slug}`}
                                className="group relative flex items-center gap-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-accent-500/40 px-4 py-3.5 transition-all"
                            >
                                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-accent-500/10 group-hover:bg-accent-500/20 flex items-center justify-center transition-colors">
                                    <Icon className="w-5 h-5 text-accent-500" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-bold text-white group-hover:text-accent-500 transition-colors truncate">
                                        {displayName}
                                    </div>
                                    {productCount > 0 && (
                                        <div className="text-[11px] text-white/50 tabular-nums">
                                            {productCount.toLocaleString('tr-TR')} ürün
                                        </div>
                                    )}
                                </div>
                                <ArrowRight className="w-4 h-4 text-white/30 group-hover:text-accent-500 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                            </Link>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
