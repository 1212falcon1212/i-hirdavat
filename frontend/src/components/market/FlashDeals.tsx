'use client';

import { useState, useEffect, useMemo } from 'react';
import { Zap } from 'lucide-react';
import { ProductCard } from './ProductCard';

interface FlashProduct {
    id: number;
    name: string;
    image?: string;
    image_url?: string;
    brand?: string;
    barcode?: string;
    sku?: string;
    lowest_price?: number;
    psf?: number | string | null;
    offers_count?: number;
    default_offer_id?: number;
    stock_status?: 'in_stock' | 'low_stock' | 'out_of_stock' | 'preorder';
    stock_qty?: number | null;
}

interface FlashDealsProps {
    products: FlashProduct[];
}

function getSecondsUntilMidnight(): number {
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);
    return Math.floor((midnight.getTime() - now.getTime()) / 1000);
}

function formatCountdown(totalSeconds: number): string {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function toNumber(value: number | string | null | undefined): number | undefined {
    if (value === null || value === undefined) return undefined;
    if (typeof value === 'number') return Number.isFinite(value) ? value : undefined;
    const normalized = value.includes(',') ? value.replace(/\./g, '').replace(',', '.') : value;
    const parsed = Number.parseFloat(normalized);
    return Number.isFinite(parsed) ? parsed : undefined;
}

export function FlashDeals({ products }: FlashDealsProps) {
    const [secondsLeft, setSecondsLeft] = useState<number>(getSecondsUntilMidnight());

    useEffect(() => {
        const interval = setInterval(() => {
            setSecondsLeft(getSecondsUntilMidnight());
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    // Discount % per product based on real PSF vs lowest offer price.
    const discountMap = useMemo(() => {
        const map = new Map<number, number>();
        products.forEach((p) => {
            const psf = toNumber(p.psf);
            const lowestPrice = toNumber(p.lowest_price);
            if (psf && lowestPrice && psf > lowestPrice) {
                map.set(p.id, Math.round(((psf - lowestPrice) / psf) * 100));
            }
        });
        return map;
    }, [products]);

    if (products.length === 0) return null;

    return (
        <section className="bg-white -mx-4 sm:-mx-7 px-4 sm:px-7 border-y border-neutral-200 py-8 sm:py-10">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
                <div>
                    <div className="flex items-center gap-2 sm:gap-3">
                        <div className="w-9 h-9 sm:w-[44px] sm:h-[44px] bg-accent-500 rounded-md flex items-center justify-center flex-shrink-0">
                            <Zap className="w-5 h-5 text-primary-900" strokeWidth={2.5} />
                        </div>
                        <span className="text-xl sm:text-[26px] font-black text-neutral-900">Flaş Fırsatlar</span>
                        <span className="bg-danger-bg text-danger text-[10px] font-bold px-2 py-0.5 rounded-sm animate-pulse-live">
                            CANLI
                        </span>
                    </div>
                    <p className="text-[12px] sm:text-[13px] text-neutral-600 mt-1 ml-11 sm:ml-[56px]">
                        Sınırlı süre, sınırlı stok
                    </p>
                </div>
                <div className="bg-neutral-900 text-accent-500 px-5 py-2.5 rounded-sm font-extrabold text-lg tracking-wider tabular-num self-start sm:self-auto">
                    {formatCountdown(secondsLeft)}
                </div>
            </div>

            {/* Grid — tüm site ile tutarlı ProductCard */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {products.map((product) => {
                    const discount = discountMap.get(product.id);
                    return (
                        <ProductCard
                            key={product.id}
                            product={product}
                            badge={discount ? `%${discount}` : undefined}
                        />
                    );
                })}
            </div>
        </section>
    );
}
