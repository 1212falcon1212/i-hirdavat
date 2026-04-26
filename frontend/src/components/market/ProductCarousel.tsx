"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";
import { ProductCard, type ProductCardData } from "./ProductCard";

/**
 * Site genelinde tek bir ProductCard stilini garanti eden bileşenler.
 * - ProductCarousel → yatay kaydırmalı carousel (3 görünür slide)
 * - ProductGrid     → 3-col statik grid (başlık + Tümünü Gör)
 * - FeaturedProducts → 3-col grid (büyük öne çıkan yok; hepsi aynı kart)
 * - ProductScrollList → mobil-first minik kaydırmalı liste (ProductCard default)
 */

interface ProductListProps {
    title: string;
    products: ProductCardData[];
    linkUrl?: string;
    /** Grid'de max kaç ürün render edilsin (default: 9 = 3 satır × 3 kolon) */
    limit?: number;
}

function SectionHeader({ title, linkUrl }: { title: string; linkUrl?: string }) {
    return (
        <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 tracking-tight">
                {title}
            </h2>
            {linkUrl && (
                <Link
                    href={linkUrl}
                    className="group inline-flex items-center gap-1.5 text-sm font-semibold border border-neutral-200 bg-white text-primary-700 hover:bg-primary-700 hover:text-white rounded-sm px-4 py-2 transition-colors"
                >
                    Tümünü Gör
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>
            )}
        </div>
    );
}

export function ProductCarousel({ title, products, linkUrl }: ProductListProps) {
    if (!products || products.length === 0) return null;

    return (
        <section className="py-4">
            <SectionHeader title={title} linkUrl={linkUrl} />

            <Carousel opts={{ align: "start", loop: false }} className="w-full relative group">
                <CarouselContent className="-ml-3">
                    {products.map((product) => (
                        <CarouselItem
                            key={product.id}
                            className="pl-3 basis-full sm:basis-1/2 lg:basis-1/3"
                        >
                            <ProductCard product={product} />
                        </CarouselItem>
                    ))}
                </CarouselContent>
                <CarouselPrevious className="left-0 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-white shadow-sm border-neutral-200" />
                <CarouselNext className="right-0 translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-white shadow-sm border-neutral-200" />
            </Carousel>
        </section>
    );
}

/**
 * Statik 3-col grid — tüm ana sayfa bölümlerinin varsayılan layout'u.
 * Farklı `columns` değerleri için geriye dönük uyumluluk: hepsi `lg:grid-cols-3`'e
 * normalize edildi. `rows` opsiyoneldir; gösterilecek ürün adedini sınırlar.
 */
export function ProductGrid({
    title,
    products,
    linkUrl,
    columns = 3,
    rows = 3,
    limit,
}: ProductListProps & {
    columns?: 2 | 3 | 4 | 5 | 6;
    rows?: 1 | 2 | 3 | 4 | 5;
    /** @deprecated — tasarım tutarlılığı için yoksayılır (hepsi ProductCard) */
    icon?: React.ReactNode;
    /** @deprecated — artık ranking overlay kullanılmıyor */
    showRanking?: boolean;
}) {
    if (!products || products.length === 0) return null;

    const max = limit ?? columns * rows;
    const displayProducts = products.slice(0, max);

    return (
        <section className="py-4">
            <div className="bg-white rounded-md border border-neutral-200 px-4 sm:px-7 py-6 sm:py-8">
                <SectionHeader title={title} linkUrl={linkUrl} />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
                    {displayProducts.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            </div>
        </section>
    );
}

export function ProductScrollList({ title, products, linkUrl }: ProductListProps) {
    if (!products || products.length === 0) return null;

    return (
        <section className="py-4">
            <SectionHeader title={title} linkUrl={linkUrl} />
            <div className="relative -mx-4 px-4">
                <div className="flex gap-3 overflow-x-auto pb-3 scrollbar-hide snap-x snap-mandatory">
                    {products.map((product) => (
                        <div key={product.id} className="flex-shrink-0 w-[280px] snap-start">
                            <ProductCard product={product} />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

/**
 * Legacy FeaturedProducts — artık featured+rest ayrımı yok.
 * Tamamen ProductGrid'e delegate eder (tasarım tutarlılığı).
 */
export function FeaturedProducts({
    title = "Öne Çıkan Ürünler",
    products,
    linkUrl,
}: ProductListProps) {
    return <ProductGrid title={title} products={products} linkUrl={linkUrl} rows={3} />;
}
