"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
    ArrowRight,
    ChevronLeft,
    ChevronRight,
    PackageCheck,
    Scale,
    Truck,
} from "lucide-react";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    type CarouselApi,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { Banner } from "@/lib/api";
import { cn } from "@/lib/utils";

const fallbackBanner: Banner = {
    id: 0,
    title: "Bayi fiyatlarıyla hırdavat tedariki",
    subtitle: "125.000+ ürün, güvenilir bayi ağı ve aynı gün kargo avantajıyla kurumsal satın alma sürecinizi hızlandırın.",
    badge_text: "B2B Hırdavat Pazaryeri",
    image_url: "/storage/banners/hero-bosch-spring.jpg",
    link_url: "/market/products",
    button_text: "Pazaryerine gir",
};

const proofPoints = [
    { icon: Scale, label: "Teklif karşılaştırma" },
    { icon: PackageCheck, label: "Stoklu satıcılar" },
    { icon: Truck, label: "Hızlı sevkiyat" },
] as const;

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
        Autoplay({ delay: 6500, stopOnInteraction: false, stopOnMouseEnter: true })
    );

    const displayBanners = banners?.length ? banners : [fallbackBanner];

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
        tabMap.forEach((tabBanners, name) => {
            result.push({ name, banners: tabBanners });
        });

        if (noTabBanners.length > 0) {
            if (result.length === 0) {
                result.push({ name: "", banners: noTabBanners });
            } else {
                result[0].banners = [...noTabBanners, ...result[0].banners];
            }
        }

        return result;
    }, [displayBanners]);

    const hasTabs = tabs.length > 1 || (tabs.length === 1 && tabs[0].name !== "");
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

    const scrollTo = useCallback((index: number) => {
        api?.scrollTo(index);
    }, [api]);

    const scrollPrev = useCallback(() => {
        api?.scrollPrev();
    }, [api]);

    const scrollNext = useCallback(() => {
        api?.scrollNext();
    }, [api]);

    return (
        <section
            className="relative overflow-hidden bg-[#eef1f4] border-b border-neutral-200"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="max-w-[1300px] mx-auto px-4 sm:px-7 pt-5 pb-4">
                {hasTabs && (
                    <div className="mb-3 flex items-center gap-2 overflow-x-auto no-scrollbar">
                        {tabs.map((tab, index) => (
                            <button
                                key={tab.name || index}
                                onClick={() => setActiveTabIndex(index)}
                                className={cn(
                                    "h-9 shrink-0 rounded-md border px-3 text-xs font-bold transition-colors",
                                    activeTabIndex === index
                                        ? "border-primary-700 bg-primary-700 text-white"
                                        : "border-neutral-200 bg-white text-neutral-700 hover:border-primary-500"
                                )}
                            >
                                {tab.name || "Öne çıkanlar"}
                            </button>
                        ))}
                    </div>
                )}

                <div className="relative">
                    <Carousel
                        key={activeTabIndex}
                        setApi={setApi}
                        plugins={[plugin.current]}
                        className="w-full"
                        opts={{ loop: activeBanners.length > 1, align: "start" }}
                    >
                        <CarouselContent>
                            {activeBanners.map((banner, index) => (
                                <CarouselItem key={banner.id || index}>
                                    <HeroSlide banner={banner} />
                                </CarouselItem>
                            ))}
                        </CarouselContent>
                    </Carousel>

                    {activeBanners.length > 1 && (
                        <>
                            <button
                                type="button"
                                onClick={scrollPrev}
                                aria-label="Önceki banner"
                                className={cn(
                                    "absolute left-3 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-md border border-white/70 bg-white/90 text-primary-900 shadow-sm backdrop-blur transition-all lg:flex",
                                    isHovered ? "opacity-100" : "opacity-0"
                                )}
                            >
                                <ChevronLeft className="h-5 w-5" />
                            </button>
                            <button
                                type="button"
                                onClick={scrollNext}
                                aria-label="Sonraki banner"
                                className={cn(
                                    "absolute right-3 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-md border border-white/70 bg-white/90 text-primary-900 shadow-sm backdrop-blur transition-all lg:flex",
                                    isHovered ? "opacity-100" : "opacity-0"
                                )}
                            >
                                <ChevronRight className="h-5 w-5" />
                            </button>
                        </>
                    )}
                </div>

                {activeBanners.length > 1 && (
                    <div className="mt-3 flex items-center justify-center gap-2">
                        {activeBanners.map((_, index) => (
                            <button
                                key={index}
                                type="button"
                                onClick={() => scrollTo(index)}
                                aria-label={`${index + 1}. bannera geç`}
                                className={cn(
                                    "h-2 rounded-full transition-all",
                                    current === index ? "w-9 bg-primary-700" : "w-2 bg-neutral-300 hover:bg-neutral-400"
                                )}
                            />
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}

function HeroSlide({ banner }: { banner: Banner }) {
    const title = banner.title || "Bayi fiyatlarıyla hırdavat tedariki";
    const subtitle = banner.subtitle || "Onaylı satıcılardan stok, fiyat ve teslimat seçeneklerini tek ekranda karşılaştırın.";
    const ctaLabel = banner.button_text || "Pazaryerine gir";
    const ctaHref = banner.link_url || "/market/products";

    return (
        <div className="grid min-h-[430px] overflow-hidden rounded-md border border-neutral-200 bg-white shadow-sm lg:grid-cols-[minmax(0,0.92fr)_minmax(520px,1.08fr)]">
            <div className="relative z-10 flex flex-col justify-center p-5 sm:p-7 lg:p-9">
                <div>
                    <div className="mb-4 inline-flex items-center gap-2 rounded-md border border-accent-500/35 bg-accent-bg px-3 py-1.5 text-xs font-bold text-primary-900">
                        <PackageCheck className="h-4 w-4 text-accent-600" />
                        {banner.badge_text || "B2B Hırdavat Pazaryeri"}
                    </div>

                    <h1 className="max-w-2xl text-3xl font-black leading-[1.05] text-neutral-900 sm:text-5xl lg:text-[56px]">
                        {title}
                    </h1>
                    <p className="mt-4 max-w-xl text-sm leading-6 text-neutral-600 sm:text-base">
                        {subtitle}
                    </p>
                </div>

                <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
                    <Link
                        href={ctaHref}
                        className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-accent-500 px-5 text-sm font-black text-primary-900 transition hover:bg-accent-400"
                    >
                        {ctaLabel}
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>

                <div className="mt-7 grid gap-2 sm:grid-cols-3">
                    {proofPoints.map((point) => {
                        const Icon = point.icon;
                        return (
                            <div
                                key={point.label}
                                className="flex items-center gap-2 rounded-sm border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs font-bold text-neutral-800"
                            >
                                <Icon className="h-4 w-4 text-primary-700" />
                                <span>{point.label}</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="relative min-h-[320px] overflow-hidden bg-primary-900 lg:min-h-full">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src={banner.image_url}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover"
                    fetchPriority="high"
                />
                <div className="absolute inset-y-0 left-0 hidden w-20 bg-gradient-to-r from-white/20 to-transparent lg:block" />
                <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-neutral-900/35 to-transparent" />
            </div>
        </div>
    );
}
