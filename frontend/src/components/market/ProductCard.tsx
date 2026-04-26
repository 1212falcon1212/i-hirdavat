"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    Heart,
    Scale,
    Loader2,
    Package,
    AlertTriangle,
    PackageX,
    Truck,
    ChevronRight,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useCompareStore, MAX_COMPARE_ITEMS } from "@/stores/useCompareStore";
import { cn } from "@/lib/utils";
import { wishlistApi } from "@/lib/api";
import { toast } from "sonner";

export interface BulkDiscountTier {
    min_qty: number;
    discount_pct: number;
}

export interface ProductCardData {
    id: number;
    name: string;
    image?: string;
    image_url?: string;
    brand?: string;
    sku?: string;
    barcode?: string;
    lowest_price?: number;      // Bayi (KDV Hariç)
    psf?: number | string | null; // Liste fiyatı (üstü çizili)
    vat_rate?: number;           // default 20 (%)
    offers_count?: number;
    stock_status?: "in_stock" | "low_stock" | "out_of_stock" | "preorder";
    stock_qty?: number | null;
    default_offer_id?: number;
    bulk_discount_tiers?: BulkDiscountTier[];
    preorder_days?: number;
}

type Variant = "default" | "large" | "list";

interface ProductCardProps {
    product: ProductCardData;
    badge?: string;
    className?: string;
    variant?: Variant;
    onSelectToggle?: (id: number, selected: boolean) => void;
    selected?: boolean;
}

const LOW_STOCK_THRESHOLD = 20;
const CRITICAL_STOCK_THRESHOLD = 5;

const toNumber = (v: number | string | null | undefined): number | undefined => {
    if (v === null || v === undefined) return undefined;
    const n = typeof v === "number" ? v : parseFloat(v);
    return Number.isFinite(n) ? n : undefined;
};

const formatPrice = (price?: number) => {
    if (price === undefined) return "---";
    return new Intl.NumberFormat("tr-TR", {
        style: "currency",
        currency: "TRY",
        minimumFractionDigits: 2,
    }).format(price);
};

interface StockPresentation {
    key: "in_stock" | "low_stock" | "critical" | "out_of_stock" | "preorder";
    label: string;
    badgeClass: string;
    Icon: React.ComponentType<{ className?: string }>;
    ctaClass: string;
}

function derivePresentation(product: ProductCardData): StockPresentation {
    const qty = typeof product.stock_qty === "number" ? product.stock_qty : undefined;
    const offersCount = product.offers_count ?? 0;

    // Preorder flag wins over everything
    if (product.stock_status === "preorder") {
        return {
            key: "preorder",
            label: product.preorder_days
                ? `Ön Sipariş • ${product.preorder_days} iş günü`
                : "Ön Sipariş",
            badgeClass: "text-info bg-info-bg",
            Icon: Truck,
            ctaClass: "bg-primary-700 text-white hover:bg-primary-900",
        };
    }

    if (product.stock_status === "out_of_stock" || (qty === 0)) {
        return {
            key: "out_of_stock",
            label: "Tükendi",
            badgeClass: "text-danger bg-danger-bg",
            Icon: PackageX,
            ctaClass: "bg-white border border-neutral-200 text-neutral-800 hover:bg-neutral-50",
        };
    }

    if (qty !== undefined && qty <= CRITICAL_STOCK_THRESHOLD) {
        return {
            key: "critical",
            label: `Son ${qty} adet!`,
            badgeClass: "text-danger bg-danger-bg font-bold",
            Icon: AlertTriangle,
            ctaClass: "bg-accent-500 text-neutral-900 hover:bg-accent-400",
        };
    }

    if ((qty !== undefined && qty <= LOW_STOCK_THRESHOLD) || product.stock_status === "low_stock") {
        return {
            key: "low_stock",
            label: qty !== undefined ? `Son ${qty} adet` : "Az stokta",
            badgeClass: "text-warning bg-warning-bg",
            Icon: AlertTriangle,
            ctaClass: "bg-accent-500 text-neutral-900 hover:bg-accent-400",
        };
    }

    // Healthy stock
    const showCount = qty ?? (offersCount > 0 ? offersCount : undefined);
    return {
        key: "in_stock",
        label: showCount !== undefined ? `Stokta: ${showCount}` : "Stokta",
        badgeClass: "text-success bg-success-bg",
        Icon: Package,
        ctaClass: "bg-accent-500 text-neutral-900 hover:bg-accent-400",
    };
}

export const ProductCard = React.memo(function ProductCard({
    product,
    badge,
    className,
    variant = "default",
    onSelectToggle,
    selected = false,
}: ProductCardProps) {
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [isTogglingWishlist, setIsTogglingWishlist] = useState(false);
    const [imgError, setImgError] = useState(false);

    const { user } = useAuth();
    const router = useRouter();
    const toggleCompare = useCompareStore((s) => s.toggle);
    const isCompared = useCompareStore((s) => s.has(product.id));
    const compareCount = useCompareStore((s) => s.items.length);

    const presentation = derivePresentation(product);

    const dealerPrice = toNumber(product.lowest_price);
    const listPrice = toNumber(product.psf);
    const hasDiscount = listPrice !== undefined && dealerPrice !== undefined && listPrice > dealerPrice;
    const discountPct = hasDiscount && listPrice > 0
        ? Math.round(((listPrice - dealerPrice!) / listPrice) * 100)
        : null;

    const sku = product.sku ?? product.barcode;

    const handleWishlist = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!user) {
            toast.error("Favorilere eklemek için giriş yapmalısınız.");
            router.push("/login");
            return;
        }
        if (isTogglingWishlist) return;
        setIsTogglingWishlist(true);
        try {
            const response = await wishlistApi.toggle(product.id);
            if (response.data) {
                setIsWishlisted(response.data.in_wishlist);
                toast.success(response.data.in_wishlist ? "Favorilere eklendi" : "Favorilerden çıkarıldı");
            }
        } catch (error) {
            console.error("Failed to toggle wishlist:", error);
            toast.error("Bir hata oluştu.");
        } finally {
            setIsTogglingWishlist(false);
        }
    };

    const handleCompare = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isCompared && compareCount >= MAX_COMPARE_ITEMS) {
            toast.error(`En fazla ${MAX_COMPARE_ITEMS} ürün karşılaştırılabilir.`);
            return;
        }
        toggleCompare({
            id: product.id,
            name: product.name,
            brand: product.brand,
            image_url: product.image_url,
            image: product.image,
            sku: product.sku,
            barcode: product.barcode,
            lowest_price: dealerPrice,
            psf: product.psf,
        });
        toast.success(isCompared ? "Karşılaştırmadan çıkarıldı" : "Karşılaştırmaya eklendi");
    };

    const handleSelectToggle = (e: React.MouseEvent | React.ChangeEvent) => {
        e.stopPropagation();
        onSelectToggle?.(product.id, !selected);
    };

    const StockIcon = presentation.Icon;
    const isList = variant === "list";
    const isLarge = variant === "large";

    return (
        <div
            className={cn(
                "group relative bg-white border border-neutral-200 rounded-md",
                "hover:border-primary-500 hover:shadow-md transition-all duration-150 overflow-hidden",
                selected && "ring-2 ring-primary-500 border-primary-500",
                className
            )}
        >
            <Link
                href={`/market/product/${product.id}`}
                className={cn("flex h-full", isList ? "flex-row" : "flex-col", isLarge && "lg:flex-row lg:min-h-[280px]")}
            >
                {/* Optional selection checkbox (list mode / quick-add mode) */}
                {onSelectToggle && (
                    <div className="absolute top-3 left-3 z-20" onClick={(e) => e.stopPropagation()}>
                        <input
                            type="checkbox"
                            checked={selected}
                            onChange={handleSelectToggle}
                            className="w-4 h-4 accent-primary-700 rounded cursor-pointer"
                            aria-label="Ürünü seç"
                        />
                    </div>
                )}

                {/* === Image === */}
                <div
                    className={cn(
                        "relative bg-neutral-50 flex items-center justify-center flex-shrink-0",
                        isList && "w-[140px] sm:w-[180px]",
                        !isList && !isLarge && "aspect-[4/3] w-full",
                        isLarge && "aspect-square w-full lg:w-[45%]"
                    )}
                >
                    {(product.image_url || product.image) && !imgError ? (
                        <Image
                            src={product.image_url || product.image || ""}
                            alt={product.name}
                            fill
                            sizes={isList ? "180px" : "(min-width: 1024px) 300px, 50vw"}
                            className="object-contain p-4 group-hover:scale-105 transition-transform duration-200"
                            onError={() => setImgError(true)}
                        />
                    ) : (
                        <Package className="w-12 h-12 text-neutral-200" strokeWidth={1.5} />
                    )}

                    {badge && (
                        <span className="absolute top-3 left-3 px-2 py-0.5 bg-accent-500 text-neutral-900 text-[10px] uppercase font-bold tracking-wider rounded-sm">
                            {badge}
                        </span>
                    )}

                    {hasDiscount && discountPct !== null && discountPct > 0 && (
                        <span className="absolute bottom-3 left-3 px-2 py-0.5 bg-danger text-white text-[11px] font-bold rounded-sm tabular-num">
                            -%{discountPct}
                        </span>
                    )}

                    {/* Top-right icon stack */}
                    <div className="absolute top-3 right-3 z-20 flex flex-col gap-1.5">
                        <button
                            type="button"
                            onClick={handleWishlist}
                            disabled={isTogglingWishlist}
                            aria-label={isWishlisted ? "Favoriden çıkar" : "Favoriye ekle"}
                            className={cn(
                                "w-8 h-8 rounded-sm flex items-center justify-center transition-colors border",
                                isWishlisted
                                    ? "bg-danger text-white border-danger"
                                    : "bg-white/90 text-neutral-600 hover:text-danger hover:bg-white border-neutral-200"
                            )}
                        >
                            {isTogglingWishlist ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Heart className={cn("w-4 h-4", isWishlisted && "fill-current")} />
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={handleCompare}
                            aria-label={isCompared ? "Karşılaştırmadan çıkar" : "Karşılaştırmaya ekle"}
                            title="Karşılaştır"
                            className={cn(
                                "w-8 h-8 rounded-sm flex items-center justify-center transition-colors border",
                                isCompared
                                    ? "bg-primary-700 text-white border-primary-700"
                                    : "bg-white/90 text-neutral-600 hover:text-primary-700 hover:bg-white border-neutral-200"
                            )}
                        >
                            <Scale className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* === Info === */}
                <div className={cn("flex-1 p-3 sm:p-4 flex flex-col gap-2 min-w-0", isLarge && "lg:p-6 lg:gap-3")}>
                    {/* Top row: Brand + Stock */}
                    <div className="flex items-start justify-between gap-2">
                        {product.brand ? (
                            <p className="font-mono text-[11px] font-bold text-primary-700 uppercase tracking-[0.5px] truncate">
                                {product.brand}
                            </p>
                        ) : (
                            <span />
                        )}
                        <div
                            className={cn(
                                "inline-flex items-center gap-1 px-2 py-0.5 rounded-sm text-[11px] font-semibold whitespace-nowrap tabular-num",
                                presentation.badgeClass
                            )}
                        >
                            <StockIcon className="w-3 h-3" />
                            {presentation.label}
                        </div>
                    </div>

                    {/* Name */}
                    <p
                        className={cn(
                            "font-semibold text-neutral-900 line-clamp-2 leading-snug group-hover:text-primary-700 transition-colors",
                            isLarge ? "text-lg sm:text-xl" : "text-[14px] sm:text-[15px]"
                        )}
                    >
                        {product.name}
                    </p>

                    {/* SKU */}
                    {sku && (
                        <p className="font-mono text-[11px] text-neutral-600 tabular-num truncate">
                            SKU: {sku}
                        </p>
                    )}

                    <div className="border-t border-neutral-100 my-1" />

                    {/* Price block — PSF (KDV Dahil) */}
                    <div className="flex items-baseline gap-2">
                        <span className="text-[11px] font-semibold text-neutral-600 uppercase tracking-wide">
                            PSF
                        </span>
                        <span
                            className={cn(
                                "font-black text-primary-900 tabular-num",
                                isLarge ? "text-2xl sm:text-3xl" : "text-xl sm:text-2xl"
                            )}
                        >
                            {formatPrice(dealerPrice)}
                        </span>
                    </div>

                    {/* Bulk discount tiers */}
                    {product.bulk_discount_tiers && product.bulk_discount_tiers.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-semibold mt-1">
                            <span className="text-neutral-600">💼 Toplu:</span>
                            {product.bulk_discount_tiers.slice(0, 3).map((tier) => (
                                <span
                                    key={tier.min_qty}
                                    className="px-1.5 py-0.5 rounded-sm bg-accent-bg text-accent-600 tabular-num"
                                >
                                    {tier.min_qty}+ %{tier.discount_pct}
                                </span>
                            ))}
                        </div>
                    )}

                    {/* Action — single CTA; parent Link handles navigation */}
                    <div className="mt-auto pt-2">
                        <div
                            className={cn(
                                "w-full flex items-center justify-center gap-1.5 px-4 h-11 rounded-sm text-sm font-bold transition-colors",
                                presentation.ctaClass
                            )}
                        >
                            <span className="truncate">
                                {product.offers_count && product.offers_count > 0
                                    ? `İlanları İncele (${product.offers_count})`
                                    : "İlanları İncele"}
                            </span>
                            <ChevronRight className="w-4 h-4" />
                        </div>
                    </div>
                </div>
            </Link>
        </div>
    );
});
