'use client';

import React, { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { cmsApi, Banner, HomepageSection, CategorySection, api } from '@/lib/api';
import { HeroSlider } from '@/components/market/HeroSlider';
import { ProductGrid } from '@/components/market/ProductCarousel';
import { ValuePropositions } from '@/components/market/ValuePropositions';
import { FlashDeals } from '@/components/market/FlashDeals';
import { DualBanner } from '@/components/market/DualBanner';
import { SeasonBanner } from '@/components/market/SeasonBanner';
import { BrandCampaigns } from '@/components/market/BrandCampaigns';
import { CategoryGrid } from '@/components/market/CategoryGrid';
import { ClosingBanner } from '@/components/market/ClosingBanner';
import { Skeleton } from '@/components/ui/skeleton';
import { ReorderBanner } from '@/components/market/ReorderBanner';

// Dynamic imports for below-fold components
const AllProductsList = dynamic(
    () => import('@/components/market/AllProductsList').then(mod => ({ default: mod.AllProductsList })),
    { ssr: false }
);

interface Brand {
    id: number;
    name: string;
    slug: string;
    logo?: string | null;
}

// Skeleton Components
function HeroSkeleton() {
    return <Skeleton className="w-full h-[400px] rounded-3xl" />;
}

function SectionSkeleton() {
    return (
        <div className="bg-white rounded-3xl p-8 border border-[var(--color-card-border)]">
            <div className="flex items-center gap-3 mb-6">
                <Skeleton className="w-11 h-11 rounded-xl" />
                <Skeleton className="h-7 w-48" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
                {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="space-y-3">
                        <Skeleton className="aspect-square rounded-[10px]" />
                        <Skeleton className="h-3 w-16" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-5 w-20" />
                    </div>
                ))}
            </div>
        </div>
    );
}

export function MarketHomeClient() {
    const [heroBanners, setHeroBanners] = useState<Banner[]>([]);
    const [bottomBanners, setBottomBanners] = useState<Banner[]>([]);
    const [sections, setSections] = useState<HomepageSection[]>([]);
    const [bestSellers, setBestSellers] = useState<any[]>([]);
    const [recommended, setRecommended] = useState<any[]>([]);
    const [categorySections, setCategorySections] = useState<CategorySection[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [response] = await Promise.all([
                    cmsApi.getHomepage(),
                    api.get<{ brands: Brand[] }>('/brands').catch(() => ({ data: null })),
                ]);

                if (response.data) {
                    if (response.data.banners?.hero?.length > 0) {
                        setHeroBanners(response.data.banners.hero);
                    }
                    if (response.data.banners?.bottom && response.data.banners.bottom.length > 0) {
                        setBottomBanners(response.data.banners.bottom);
                    }
                    if (response.data.sections?.length > 0) {
                        setSections(response.data.sections);
                    }
                    if (response.data.best_sellers && response.data.best_sellers.length > 0) {
                        setBestSellers(response.data.best_sellers);
                    }
                    if (response.data.recommended && response.data.recommended.length > 0) {
                        setRecommended(response.data.recommended);
                    }
                    if (response.data.category_sections && response.data.category_sections.length > 0) {
                        setCategorySections(response.data.category_sections);
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

    const getSection = (type: string) => sections.find(s => s.type === type);
    const bestSellersSection = getSection('best_sellers');
    const recommendedSection = getSection('recommended') || getSection('featured_products');

    const bestSellersProducts = bestSellersSection?.products || bestSellers;
    const recommendedProducts = recommendedSection?.products || recommended;
    const flashProducts = bestSellers.slice(0, 4);

    if (isLoading) {
        return (
            <div className="min-h-screen pb-20">
                <div className="max-w-[1300px] mx-auto px-7 space-y-4 pt-4">
                    <HeroSkeleton />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                        {[1, 2, 3].map(i => <Skeleton key={i} className="h-20 rounded-2xl" />)}
                    </div>
                    <SectionSkeleton />
                    <SectionSkeleton />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pb-20">
            {/* 1. Hero Carousel - Full width, no container */}
            <HeroSlider banners={heroBanners} />

            <div className="max-w-[1300px] mx-auto px-4 sm:px-7 space-y-4 pt-4">

                {/* Reorder banner (only renders for authenticated buyers with a prior order) */}
                <ReorderBanner />

                {/* 2. Value Propositions (3 cards) */}
                <ValuePropositions />

                {/* 4. Flaş Fırsatlar */}
                {flashProducts.length > 0 && (
                    <FlashDeals products={flashProducts} />
                )}

                {/* 4. İkili Banner */}
                <DualBanner />

                {/* 5. Çok Satanlar */}
                {bestSellersProducts.length > 0 && (
                    <ProductGrid
                        title="Çok Satanlar"
                        products={bestSellersProducts}
                        linkUrl="/market/cok-satanlar"
                        columns={2}
                        rows={4}
                        showRanking={true}
                    />
                )}

                {/* 6. Tam Genişlik Sezon Banner */}
                <SeasonBanner />

                {/* 7. Kategori Ürün Bölümleri (API'den dinamik) */}
                {categorySections.map((section, idx) => (
                    <React.Fragment key={section.category_id}>
                        {section.products.length > 0 && (
                            <ProductGrid
                                title={section.category_name}
                                products={section.products}
                                linkUrl={`/market/category/${section.category_slug}`}
                                columns={2}
                                rows={3}
                            />
                        )}
                        {/* Her 3 kategoriden sonra bir banner */}
                        {idx === 2 && <DualBanner />}
                    </React.Fragment>
                ))}

                {/* 8. Marka Kampanyaları */}
                <BrandCampaigns />

                {/* 9. Kategoriler */}
                <CategoryGrid />

                {/* 10. Tüm Ürünler */}
                <section>
                    <AllProductsList />
                </section>

                {/* 11. Sizin İçin Önerilen (API'den) */}
                {recommendedProducts.length > 0 && (
                    <ProductGrid
                        title="Sizin İçin Önerilen"
                        products={recommendedProducts}
                        linkUrl="/market/onerilen"
                        columns={2}
                        rows={4}
                    />
                )}

                {/* 12. Kapanış Banner'ı (Admin panelden yönetilen) */}
                <ClosingBanner banners={bottomBanners} />
            </div>
        </div>
    );
}
