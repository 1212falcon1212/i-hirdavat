'use client';

import { useState, useEffect } from 'react';
import { MapPin, Award, Clock, Box, Truck, Shield, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { QuantitySelector } from './QuantitySelector';
import { AddToCartButton } from '@/components/cart/AddToCartButton';
import { cn, formatPrice } from '@/lib/utils';
import { Offer } from '@/lib/api';
import Link from 'next/link';

interface OfferTableProps {
    offers: Offer[];
    lowestPrice?: number | null;
    className?: string;
}

export function OfferTable({ offers, lowestPrice, className }: OfferTableProps) {
    const [quantities, setQuantities] = useState<Record<number, number>>(
        offers.reduce((acc, offer) => ({ ...acc, [offer.id]: 1 }), {})
    );
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleQuantityChange = (offerId: number, quantity: number) => {
        setQuantities((prev) => ({ ...prev, [offerId]: quantity }));
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('tr-TR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    };

    const getStockStatus = (stock: number) => {
        if (stock === 0) return { label: 'Tükendi', color: 'bg-red-50 text-red-700 border-red-200' };
        if (stock <= 5) return { label: `Son ${stock} adet`, color: 'bg-amber-50 text-amber-700 border-amber-200' };
        if (stock <= 20) return { label: 'Sınırlı Stok', color: 'bg-blue-50 text-blue-700 border-blue-200' };
        return { label: 'Stokta', color: 'bg-[#F0F4FA] text-[#0F1F35] border-[#D9E2EF]' };
    };

    const getExpiryStatus = (dateString: string) => {
        if (!mounted) return { color: 'text-slate-600', warning: null };
        const date = new Date(dateString);
        const now = new Date();
        const diffMonths = (date.getFullYear() - now.getFullYear()) * 12 + (date.getMonth() - now.getMonth());

        if (diffMonths <= 3) return { color: 'text-red-600', warning: 'Yakında sona erecek' };
        if (diffMonths <= 6) return { color: 'text-amber-600', warning: '6 ay içinde sona erecek' };
        return { color: 'text-slate-600', warning: null };
    };

    if (offers.length === 0) {
        return (
            <Card className={cn('border-slate-200', className)}>
                <CardContent className="py-16">
                    <div className="text-center">
                        <div className="w-20 h-20 mx-auto mb-6 bg-slate-100 rounded-full flex items-center justify-center">
                            <Box className="h-10 w-10 text-slate-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900 mb-2">Henüz teklif yok</h3>
                        <p className="text-slate-500 max-w-sm mx-auto">
                            Bu ürün için henüz bir satış teklifi bulunmuyor. Daha sonra tekrar kontrol edin.
                        </p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <TooltipProvider>
            <div className={cn('space-y-4', className)}>
                {/* Header Stats */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Badge variant="secondary" className="text-sm px-3 py-1">
                            {offers.length} teklif
                        </Badge>
                        {lowestPrice && (
                            <span className="text-sm text-slate-500">
                                <span className="font-medium text-[#1E3A5F]">{formatPrice(lowestPrice)}</span>'den başlayan fiyatlar
                            </span>
                        )}
                    </div>
                </div>

                {/* Offer Cards */}
                <div className="space-y-3">
                    {offers.map((offer, index) => {
                        const isBestOffer = index === 0;
                        const stockStatus = getStockStatus(offer.stock);
                        const expiryStatus = getExpiryStatus(offer.expiry_date);
                        const quantity = quantities[offer.id] || 1;
                        const totalPrice = offer.price * quantity;

                        return (
                            <Card
                                key={offer.id}
                                className={cn(
                                    'overflow-hidden transition-all duration-300 hover:shadow-lg',
                                    isBestOffer
                                        ? 'border-2 border-blue-400 bg-blue-50/80 ring-2 ring-blue-100'
                                        : 'border-slate-200 hover:border-slate-300'
                                )}
                            >
                                <CardContent className="p-0">
                                    <div className="flex flex-col lg:flex-row lg:items-center gap-4 p-4 lg:p-5">
                                        {/* Rank & Seller Info */}
                                        <div className="flex items-start gap-4 flex-1 min-w-0">
                                            {/* Rank Badge */}
                                            <div className="flex-shrink-0">
                                                {isBestOffer ? (
                                                    <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/25">
                                                        <Award className="h-6 w-6 text-white" />
                                                    </div>
                                                ) : index === 1 ? (
                                                    <div className="w-10 h-10 rounded-lg bg-slate-200 flex items-center justify-center font-bold text-slate-600">
                                                        2
                                                    </div>
                                                ) : index === 2 ? (
                                                    <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center font-bold text-amber-700">
                                                        3
                                                    </div>
                                                ) : (
                                                    <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center font-semibold text-slate-400">
                                                        {index + 1}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Seller Details */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    {offer.seller?.id ? (
                                                        <Link
                                                            href={`/market/satici/${offer.seller.id}`}
                                                            className={cn(
                                                                'font-semibold truncate hover:underline',
                                                                isBestOffer ? 'text-blue-700 hover:text-blue-800 text-lg' : 'text-slate-900 hover:text-[#1E3A5F]'
                                                            )}
                                                        >
                                                            {offer.seller.nickname || offer.seller.pharmacy_name || 'Bilinmeyen Satıcı'}
                                                        </Link>
                                                    ) : (
                                                        <h3 className={cn(
                                                            'font-semibold truncate',
                                                            isBestOffer ? 'text-blue-700 text-lg' : 'text-slate-900'
                                                        )}>
                                                            {offer.seller?.nickname || offer.seller?.pharmacy_name || 'Bilinmeyen Satıcı'}
                                                        </h3>
                                                    )}
                                                    {isBestOffer && (
                                                        <Badge className="bg-blue-600 hover:bg-blue-600 text-white text-xs">
                                                            En Uygun
                                                        </Badge>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-4 mt-1.5 text-sm text-slate-500">
                                                    {offer.seller?.city && (
                                                        <span className="flex items-center gap-1">
                                                            <MapPin className="h-3.5 w-3.5" />
                                                            {offer.seller.city}
                                                        </span>
                                                    )}
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <span className={cn('flex items-center gap-1 cursor-help', expiryStatus.color)}>
                                                                <Clock className="h-3.5 w-3.5" />
                                                                SKT: {formatDate(offer.expiry_date)}
                                                            </span>
                                                        </TooltipTrigger>
                                                        {expiryStatus.warning && (
                                                            <TooltipContent>
                                                                <p>{expiryStatus.warning}</p>
                                                            </TooltipContent>
                                                        )}
                                                    </Tooltip>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Stock Badge */}
                                        <div className="flex-shrink-0">
                                            <Badge
                                                variant="outline"
                                                className={cn('font-medium', stockStatus.color)}
                                            >
                                                {stockStatus.label}
                                                {offer.stock > 0 && offer.stock <= 20 && (
                                                    <span className="ml-1 text-xs opacity-75">({offer.stock})</span>
                                                )}
                                            </Badge>
                                        </div>

                                        {/* Price Section */}
                                        <div className="flex-shrink-0 text-right lg:text-center lg:min-w-[120px]">
                                            <p className="text-xs text-slate-500 mb-0.5">Birim Fiyat</p>
                                            <p className={cn(
                                                'font-bold',
                                                isBestOffer ? 'text-2xl text-blue-600' : 'text-xl text-slate-900'
                                            )}>
                                                {formatPrice(offer.price)}
                                            </p>
                                        </div>

                                        {/* Quantity & Add to Cart */}
                                        <div className="flex items-center gap-3 lg:gap-4 flex-shrink-0">
                                            <div className="flex flex-col items-center">
                                                <span className="text-xs text-slate-500 mb-1.5">Miktar</span>
                                                <QuantitySelector
                                                    value={quantity}
                                                    onChange={(val) => handleQuantityChange(offer.id, val)}
                                                    min={1}
                                                    max={offer.stock}
                                                    disabled={offer.stock === 0}
                                                    size="sm"
                                                />
                                            </div>

                                            <div className="flex flex-col items-center lg:items-end">
                                                <div className="text-xs text-slate-500 mb-1.5 text-center lg:text-right">
                                                    Toplam: <span className="font-semibold text-slate-900">{formatPrice(totalPrice)}</span>
                                                </div>
                                                <AddToCartButton
                                                    offerId={offer.id}
                                                    stock={offer.stock}
                                                    sellerId={offer.seller?.id}
                                                    quantity={quantity}
                                                    showConfetti={isBestOffer}
                                                    className={cn(
                                                        'min-w-[130px]',
                                                        isBestOffer && 'bg-blue-600 hover:bg-blue-700'
                                                    )}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Best Offer Footer */}
                                    {isBestOffer && (
                                        <div className="px-5 py-3 bg-blue-600 flex items-center justify-center gap-6 text-white text-sm">
                                            <span className="flex items-center gap-1.5">
                                                <Shield className="h-4 w-4" />
                                                Güvenli Alışveriş
                                            </span>
                                            <span className="flex items-center gap-1.5">
                                                <Truck className="h-4 w-4" />
                                                Hızlı Teslimat
                                            </span>
                                            <span className="flex items-center gap-1.5">
                                                <Star className="h-4 w-4" />
                                                En Uygun Fiyat Garantisi
                                            </span>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </div>
        </TooltipProvider>
    );
}
