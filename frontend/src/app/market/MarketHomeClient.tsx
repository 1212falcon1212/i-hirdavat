'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { cmsApi, Banner } from '@/lib/api';
import { HeroSlider } from '@/components/market/HeroSlider';
import { ValuePropositions } from '@/components/market/ValuePropositions';
import { CategoryHighlightBanner } from '@/components/market/CategoryHighlightBanner';
import { Skeleton } from '@/components/ui/skeleton';

const AllProductsList = dynamic(
    () => import('@/components/market/AllProductsList').then(mod => ({ default: mod.AllProductsList })),
    { ssr: false }
);

function HeroSkeleton() {
    return <Skeleton className="w-full h-[400px] rounded-3xl" />;
}

export function MarketHomeClient() {
    const [heroBanners, setHeroBanners] = useState<Banner[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const response = await cmsApi.getHomepage();

                if (response.data) {
                    if (response.data.banners?.hero?.length > 0) {
                        setHeroBanners(response.data.banners.hero);
                    }
                }
            } catch (error) {
                console.error("Failed to load homepage data", error);
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, []);

    if (isLoading) {
        return (
            <div className="min-h-screen pb-20">
                <div className="max-w-[1300px] mx-auto px-7 space-y-4 pt-4">
                    <HeroSkeleton />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                        {[1, 2, 3].map(i => <Skeleton key={i} className="h-20 rounded-2xl" />)}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pb-20">
            {/* 1. Hero Banner */}
            <HeroSlider banners={heroBanners} />

            <div className="max-w-[1300px] mx-auto px-4 sm:px-7 space-y-4 pt-4">
                {/* 2. Güven Badge'leri */}
                <ValuePropositions />

                {/* 3. Tüm Ürünler */}
                <section>
                    <AllProductsList />
                </section>

                {/* 4. Kategori Banner'ı */}
                <CategoryHighlightBanner />
            </div>
        </div>
    );
}
