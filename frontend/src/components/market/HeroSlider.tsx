"use client";

import { useRef, useCallback, useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight, Zap } from "lucide-react";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    type CarouselApi,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { Banner } from "@/lib/api";
import { cn } from "@/lib/utils";

/**
 * CMS banner yokken gösterilen statik Industrial Pro hero.
 * CLAUDE.md §3.1 + kullanıcının verdiği tasarım örneği ile uyumlu.
 */
function HeroFallback() {
    return (
        <section className="relative bg-primary-900 overflow-hidden">
            <div className="max-w-[1300px] mx-auto px-4 sm:px-7 py-10 sm:py-14 lg:py-16">
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 items-center">
                    {/* Left: copy */}
                    <div>
                        <p className="text-accent-500 font-bold text-xs sm:text-[13px] tracking-[2.5px] uppercase mb-4">
                            Bosch Professional · Sezon Kampanyası
                        </p>
                        <h1 className="text-3xl sm:text-5xl lg:text-[52px] font-black text-white leading-[1.05] tracking-tight">
                            Elektrikli El Aletlerinde
                            <br />
                            <span className="text-accent-500">%20 Bayi İndirimi</span>
                        </h1>
                        <p className="mt-5 text-white/70 text-[15px] sm:text-base">
                            Binlerce SKU · Aynı gün sevkiyat · Kademeli toplu alım iskontosu
                        </p>

                        <div className="mt-7 flex flex-wrap items-center gap-5">
                            <Link
                                href="/market/marka/bosch"
                                className="inline-flex items-center gap-2 h-12 px-6 rounded-sm bg-accent-500 hover:bg-accent-400 text-primary-900 font-bold text-[15px] transition-colors"
                            >
                                Kampanyayı İncele
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                            <p className="text-white/70 text-sm tabular-num">
                                <span className="text-white font-semibold">06 gün : 12 saat</span> kaldı
                            </p>
                        </div>
                    </div>

                    {/* Right: decorative glass card with lightning */}
                    <div className="hidden lg:flex justify-end">
                        <div className="relative w-[300px] h-[300px] rounded-md bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden backdrop-blur-sm">
                            {/* Diagonal accent shimmer */}
                            <span className="absolute -inset-8 bg-gradient-to-tr from-transparent via-white/5 to-transparent rotate-12 pointer-events-none" />
                            <Zap className="w-32 h-32 text-accent-500" strokeWidth={2} fill="currentColor" />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

interface HeroSliderProps {
    banners: Banner[];
}

interface BannerTab {
    name: string;
    banners: Banner[];
}

export function HeroSlider({ banners }: HeroSliderProps) {
    const [api, setApi] = useState<CarouselApi>();
    const [current, setCurrent] = useState(0);
    const [isHovered, setIsHovered] = useState(false);
    const [activeTabIndex, setActiveTabIndex] = useState(0);

    const plugin = useRef(
        Autoplay({ delay: 5500, stopOnInteraction: false, stopOnMouseEnter: true })
    );

    const displayBanners = banners || [];

    // Group banners by tab_name
    const tabs: BannerTab[] = useMemo(() => {
        const tabMap = new Map<string, Banner[]>();
        const noTabBanners: Banner[] = [];

        displayBanners.forEach((banner) => {
            if (banner.tab_name) {
                const existing = tabMap.get(banner.tab_name) || [];
                existing.push(banner);
                tabMap.set(banner.tab_name, existing);
            } else {
                noTabBanners.push(banner);
            }
        });

        const result: BannerTab[] = [];
        tabMap.forEach((banners, name) => {
            result.push({ name, banners });
        });

        if (noTabBanners.length > 0) {
            if (result.length === 0) {
                result.push({ name: '', banners: noTabBanners });
            } else {
                result[0].banners = [...noTabBanners, ...result[0].banners];
            }
        }

        return result;
    }, [displayBanners]);

    const hasTabs = tabs.length > 1 || (tabs.length === 1 && tabs[0].name !== '');
    const activeTab = tabs[activeTabIndex] || tabs[0];
    const activeBanners = activeTab?.banners || [];

    useEffect(() => {
        if (!api) return;

        setCurrent(api.selectedScrollSnap());

        api.on("select", () => {
            setCurrent(api.selectedScrollSnap());
        });
    }, [api]);

    useEffect(() => {
        setCurrent(0);
        api?.scrollTo(0);
    }, [activeTabIndex, api]);

    const scrollTo = useCallback(
        (index: number) => {
            api?.scrollTo(index);
        },
        [api]
    );

    const scrollPrev = useCallback(() => {
        api?.scrollPrev();
    }, [api]);

    const scrollNext = useCallback(() => {
        api?.scrollNext();
    }, [api]);

    if (displayBanners.length === 0) {
        return <HeroFallback />;
    }

    return (
        <div
            className="relative w-full"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Banner - Full width, image only */}
            <div className="relative overflow-hidden">
                <Carousel
                    key={activeTabIndex}
                    setApi={setApi}
                    plugins={[plugin.current]}
                    className="w-full"
                    opts={{
                        loop: activeBanners.length > 1,
                        align: "start",
                    }}
                >
                    <CarouselContent>
                        {activeBanners.map((banner, index) => (
                            <CarouselItem key={banner.id}>
                                {banner.link_url ? (
                                    <Link href={banner.link_url} className="block">
                                        <BannerImage banner={banner} index={index} activeTabIndex={activeTabIndex} />
                                    </Link>
                                ) : (
                                    <BannerImage banner={banner} index={index} activeTabIndex={activeTabIndex} />
                                )}
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                </Carousel>

                {/* Navigation Arrows */}
                {activeBanners.length > 1 && (
                    <>
                        <button
                            onClick={scrollPrev}
                            className={cn(
                                "absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/80 backdrop-blur-sm shadow-lg flex items-center justify-center text-[#1a1a1a] hover:bg-white transition-all duration-200 z-20",
                                isHovered ? "opacity-100 scale-100" : "opacity-0 scale-90"
                            )}
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                            onClick={scrollNext}
                            className={cn(
                                "absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/80 backdrop-blur-sm shadow-lg flex items-center justify-center text-[#1a1a1a] hover:bg-white transition-all duration-200 z-20",
                                isHovered ? "opacity-100 scale-100" : "opacity-0 scale-90"
                            )}
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </>
                )}

                {/* Navigation Dots */}
                {activeBanners.length > 1 && (
                    <div className="absolute bottom-4 sm:bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
                        {activeBanners.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => scrollTo(index)}
                                className={cn(
                                    "rounded-full transition-all duration-300",
                                    current === index
                                        ? "w-8 h-2.5 bg-[#1E3A5F] shadow-md"
                                        : "w-2.5 h-2.5 bg-[#1a1a1a]/30 hover:bg-[#1a1a1a]/50"
                                )}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

function BannerImage({ banner, index, activeTabIndex }: { banner: Banner; index: number; activeTabIndex: number }) {
    return (
        <div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
                src={banner.image_url}
                alt={banner.title || ''}
                className="w-full h-auto block"
                {...(index === 0 && activeTabIndex === 0
                    ? { fetchPriority: "high" as const }
                    : { loading: "lazy" as const })}
            />
        </div>
    );
}
