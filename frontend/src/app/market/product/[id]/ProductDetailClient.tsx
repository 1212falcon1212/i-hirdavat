'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { productsApi, wishlistApi, reviewsApi, companyLinkApi, Product, Offer, Review, ReviewableItem, CreateReviewData } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
// AddToCartButton artik kullanilmiyor, custom quantity selector kullaniliyor
import {
    Heart,
    Box,
    ChevronRight,
    Truck,
    Star,
    AlertCircle,
    ChevronDown,
    ChevronUp,
    Minus,
    Plus,
    ShoppingCart,
    Loader2,
    Check,
    MessageSquare,
    User,
    ThumbsUp,
    PenLine,
    Send,
    Gift
} from 'lucide-react';
import { ProductJsonLd } from '@/components/seo/ProductJsonLd';
import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd';
import { SellerTypeBadge } from '@/components/ui/SellerTypeBadge';
import { SellerScoreBadge } from '@/components/ui/SellerScoreBadge';
import { useCartStore } from '@/stores/useCartStore';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export function ProductDetailClient() {
    const params = useParams();
    const productId = Number(params.id);

    const [product, setProduct] = useState<Product | null>(null);
    const [offers, setOffers] = useState<Offer[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isFavorite, setIsFavorite] = useState(false);
    const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);
    const [sortBy, setSortBy] = useState<'price_asc' | 'price_desc' | 'stock_desc' | 'stock_asc' | 'expiry_desc' | 'expiry_asc'>('price_asc');
    const [minStock, setMinStock] = useState<number>(0);
    const [quantities, setQuantities] = useState<Record<number, number>>({});
    const [addingToCart, setAddingToCart] = useState<number | null>(null);
    const [addedToCart, setAddedToCart] = useState<number | null>(null);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [reviewsLoading, setReviewsLoading] = useState(false);
    const [reviewSummary, setReviewSummary] = useState<{
        averageRating: number;
        totalCount: number;
        distribution: Record<number, number>;
    }>({ averageRating: 0, totalCount: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } });

    // Review form state
    const [reviewableItems, setReviewableItems] = useState<ReviewableItem[]>([]);
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [selectedOrderItem, setSelectedOrderItem] = useState<ReviewableItem | null>(null);
    const [reviewForm, setReviewForm] = useState({
        rating: 0,
        deliveryRating: 0,
        qualityRating: 0,
        communicationRating: 0,
        comment: ''
    });
    const [submittingReview, setSubmittingReview] = useState(false);

    const { addItem, setOpen } = useCartStore();
    const { user } = useAuth();
    const router = useRouter();
    const [approvedSellerIds, setApprovedSellerIds] = useState<number[]>([]);
    const [expandedCampaigns, setExpandedCampaigns] = useState<Record<number, boolean>>({});

    const isCompany = user?.role === 'company';

    const canBuyFromSeller = (sellerId: number): boolean => {
        if (!user) return true; // Guest can see buttons, will be redirected on action
        if (user.id === sellerId) return false; // Can't buy own listings
        if (!isCompany) return true; // Pharmacies can buy from anyone
        return approvedSellerIds.includes(sellerId); // Companies need approved link
    };

    useEffect(() => {
        loadProductDetails();
        loadProductReviews();
    }, [productId]);

    useEffect(() => {
        if (user && isCompany) {
            loadApprovedSellers();
        }
    }, [user]);

    useEffect(() => {
        if (user) {
            loadReviewableItems();
        }
    }, [user, productId]);

    const loadApprovedSellers = async () => {
        try {
            const response = await companyLinkApi.approvedSellerIds();
            if (response.data) {
                setApprovedSellerIds(response.data.seller_ids);
            }
        } catch (error) {
            console.error('Failed to load approved sellers:', error);
        }
    };

    const loadReviewableItems = async () => {
        try {
            const response = await reviewsApi.getReviewableItems();
            if (response.data) {
                // Filter items for this product
                const itemsForProduct = response.data.items.filter(
                    (item: ReviewableItem) => item.product_id === productId
                );
                setReviewableItems(itemsForProduct);
            }
        } catch (error) {
            console.error('Failed to load reviewable items:', error);
        }
    };

    const handleSubmitReview = async () => {
        if (!selectedOrderItem || reviewForm.rating === 0) {
            toast.error('Lütfen bir puan seçin');
            return;
        }

        setSubmittingReview(true);
        try {
            const data: CreateReviewData = {
                order_item_id: selectedOrderItem.id,
                rating: reviewForm.rating,
                delivery_rating: reviewForm.deliveryRating || undefined,
                quality_rating: reviewForm.qualityRating || undefined,
                communication_rating: reviewForm.communicationRating || undefined,
                comment: reviewForm.comment || undefined
            };

            const response = await reviewsApi.create(data);
            if (response.data) {
                toast.success('Yorumunuz başarıyla gönderildi. Onaylandıktan sonra yayınlanacaktır.');
                setShowReviewForm(false);
                setSelectedOrderItem(null);
                setReviewForm({ rating: 0, deliveryRating: 0, qualityRating: 0, communicationRating: 0, comment: '' });
                // Remove the reviewed item from reviewable list
                setReviewableItems(prev => prev.filter(item => item.id !== selectedOrderItem.id));
                // Reload reviews
                loadProductReviews();
            }
        } catch (error) {
            const err = error as { response?: { data?: { message?: string } } };
            toast.error(err.response?.data?.message || 'Yorum gönderilemedi');
        } finally {
            setSubmittingReview(false);
        }
    };

    const StarRating = ({ value, onChange, size = 'md' }: { value: number; onChange: (v: number) => void; size?: 'sm' | 'md' }) => {
        const [hovered, setHovered] = useState(0);
        const sizeClass = size === 'sm' ? 'w-5 h-5' : 'w-7 h-7';
        return (
            <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        type="button"
                        onMouseEnter={() => setHovered(star)}
                        onMouseLeave={() => setHovered(0)}
                        onClick={() => onChange(star)}
                        className="focus:outline-none transition-transform hover:scale-110"
                    >
                        <Star
                            className={cn(
                                sizeClass,
                                "transition-colors",
                                (hovered || value) >= star
                                    ? "fill-amber-400 text-amber-400"
                                    : "text-slate-300"
                            )}
                        />
                    </button>
                ))}
            </div>
        );
    };

    const loadProductReviews = async () => {
        setReviewsLoading(true);
        try {
            const response = await reviewsApi.getProductReviews(productId);
            if (response.data) {
                const reviewsData = response.data.reviews || [];
                setReviews(reviewsData);

                // Calculate summary
                if (reviewsData.length > 0) {
                    const totalRating = reviewsData.reduce((sum: number, r: Review) => sum + r.rating, 0);
                    const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
                    reviewsData.forEach((r: Review) => {
                        distribution[r.rating] = (distribution[r.rating] || 0) + 1;
                    });
                    setReviewSummary({
                        averageRating: totalRating / reviewsData.length,
                        totalCount: reviewsData.length,
                        distribution
                    });
                }
            }
        } catch (error) {
            console.error('Failed to load reviews:', error);
        } finally {
            setReviewsLoading(false);
        }
    };

    const loadProductDetails = async () => {
        setIsLoading(true);
        const offersRes = await productsApi.getOffers(productId);
        if (offersRes.data) {
            setProduct(offersRes.data.product);
            const loadedOffers = offersRes.data.offers || [];
            setOffers(loadedOffers);
            // Initialize quantities for each offer
            const initialQuantities: Record<number, number> = {};
            loadedOffers.forEach((offer: Offer) => {
                initialQuantities[offer.id] = 1;
            });
            setQuantities(initialQuantities);
        }
        setIsLoading(false);
    };

    const handleToggleFavorite = async () => {
        // Check if user is logged in
        if (!user) {
            toast.error('Favorilere eklemek için giriş yapmalısınız.');
            router.push('/login');
            return;
        }

        if (isTogglingFavorite || !product) return;

        setIsTogglingFavorite(true);
        try {
            const response = await wishlistApi.toggle(product.id);
            if (response.data) {
                setIsFavorite(response.data.in_wishlist);
                toast.success(response.data.in_wishlist ? 'Favorilere eklendi' : 'Favorilerden çıkarıldı');
            }
        } catch (error) {
            console.error('Failed to toggle wishlist:', error);
            toast.error('Bir hata oluştu.');
        } finally {
            setIsTogglingFavorite(false);
        }
    };

    const handleQuantityChange = (offerId: number, delta: number, maxStock: number) => {
        setQuantities(prev => ({
            ...prev,
            [offerId]: Math.max(1, Math.min(maxStock, (prev[offerId] || 1) + delta))
        }));
    };

    const handleAddToCart = async (offerId: number, stock: number, sellerId?: number) => {
        if (stock <= 0) return;
        if (sellerId && !canBuyFromSeller(sellerId)) return;

        const quantity = quantities[offerId] || 1;
        setAddingToCart(offerId);

        try {
            await addItem(offerId, quantity);
            setAddedToCart(offerId);
            toast.success(
                <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-[#1E3A5F]" />
                    <span>{quantity > 1 ? `${quantity} adet ürün` : 'Ürün'} sepetinize eklendi!</span>
                </div>,
                {
                    action: {
                        label: 'Sepeti Gör',
                        onClick: () => setOpen(true),
                    },
                }
            );
            setTimeout(() => {
                setAddedToCart(null);
                // Reset quantity after successful add
                setQuantities(prev => ({ ...prev, [offerId]: 1 }));
            }, 2000);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Ürün eklenemedi.');
        } finally {
            setAddingToCart(null);
        }
    };

    // Filtered and sorted offers
    const filteredOffers = useMemo(() => {
        let result = [...offers];

        // Filter by minimum stock
        if (minStock > 0) {
            result = result.filter(o => o.stock >= minStock);
        }

        // Sort
        switch (sortBy) {
            case 'price_asc':
                result.sort((a, b) => a.price - b.price);
                break;
            case 'price_desc':
                result.sort((a, b) => b.price - a.price);
                break;
            case 'stock_desc':
                result.sort((a, b) => b.stock - a.stock);
                break;
            case 'stock_asc':
                result.sort((a, b) => a.stock - b.stock);
                break;
            case 'expiry_desc':
                result.sort((a, b) => {
                    const dateA = a.expiry_date ? new Date(a.expiry_date).getTime() : 0;
                    const dateB = b.expiry_date ? new Date(b.expiry_date).getTime() : 0;
                    return dateB - dateA;
                });
                break;
            case 'expiry_asc':
                result.sort((a, b) => {
                    const dateA = a.expiry_date ? new Date(a.expiry_date).getTime() : Infinity;
                    const dateB = b.expiry_date ? new Date(b.expiry_date).getTime() : Infinity;
                    return dateA - dateB;
                });
                break;
        }

        return result;
    }, [offers, sortBy, minStock]);

    const formatPrice = (price: number | string | undefined | null) => {
        const numPrice = Number(price) || 0;
        const [whole, decimal] = numPrice.toFixed(2).split('.');
        return { whole, decimal };
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('tr-TR', { weekday: 'long' });
    };

    if (isLoading) {
        return (
            <div className="min-h-screen">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <Skeleton className="h-6 w-96 mb-6" />
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        <div className="lg:col-span-4">
                            <Skeleton className="h-[500px] rounded-xl" />
                        </div>
                        <div className="lg:col-span-8 space-y-4">
                            <Skeleton className="h-12 w-full" />
                            <Skeleton className="h-32 w-full" />
                            <Skeleton className="h-32 w-full" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
                        <Box className="w-16 h-16 mx-auto text-slate-300 mb-4" />
                        <h3 className="text-lg font-bold text-slate-900 mb-2">Ürün bulunamadı</h3>
                        <p className="text-slate-500 mb-6">İstediğiniz ürün mevcut değil.</p>
                        <Link href="/market">
                            <Button className="bg-[#1E3A5F] hover:bg-[#1E3A5F] text-white">
                                Pazaryerine Dön
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    const breadcrumbJsonLdItems = [
        { name: 'Anasayfa', url: 'https://i-depo.com/market' },
        ...(product.category
            ? [{ name: product.category.name, url: `https://i-depo.com/market/category/${product.category.slug}` }]
            : []),
        { name: product.name, url: `https://i-depo.com/market/product/${product.id}` },
    ];

    return (
        <div className="min-h-screen">
            <ProductJsonLd
                name={product.name}
                description={product.description}
                image={product.image_url || product.image}
                brand={product.brand}
                barcode={product.barcode}
                lowestPrice={product.lowest_price}
                highestPrice={product.highest_price}
                offersCount={offers.length}
                inStock={offers.length > 0}
                reviewCount={reviewSummary.totalCount}
                averageRating={reviewSummary.averageRating}
            />
            <BreadcrumbJsonLd items={breadcrumbJsonLdItems} />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-sm mb-4 overflow-x-auto whitespace-nowrap pb-2">
                    <Link href="/market" className="text-slate-500 hover:text-[#1E3A5F]">Anasayfa</Link>
                    <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    {product.category && (
                        <>
                            <Link href={`/market/category/${product.category.slug}`} className="text-slate-500 hover:text-[#1E3A5F]">
                                {product.category.name}
                            </Link>
                            <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
                        </>
                    )}
                    <span className="text-slate-700 font-medium truncate">{product.name}</span>
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
                    {/* Left Side - Product Info */}
                    <div className="lg:col-span-4">
                        <div className="bg-white rounded-xl border border-slate-200 p-5 sticky top-4">
                            {/* Product Name */}
                            <h1 className="text-xl font-bold text-slate-900 leading-tight mb-2">
                                {product.name}
                            </h1>

                            {/* Brand */}
                            {product.brand && (
                                <Link href={`/market/marka/${product.brand.toLowerCase().replace(/\s+/g, '-')}`} className="text-purple-600 hover:text-purple-700 font-medium text-sm">
                                    {product.brand}
                                </Link>
                            )}

                            {/* Product Image */}
                            <div className="relative mt-4">
                                <button
                                    onClick={handleToggleFavorite}
                                    disabled={isTogglingFavorite}
                                    className={cn(
                                        "absolute top-2 left-2 z-10 w-9 h-9 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-slate-50 transition-colors",
                                        isTogglingFavorite && "opacity-50 cursor-not-allowed"
                                    )}
                                >
                                    {isTogglingFavorite ? (
                                        <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
                                    ) : (
                                        <Heart className={cn(
                                            "w-5 h-5 transition-colors",
                                            isFavorite ? "fill-red-500 text-red-500" : "text-slate-400"
                                        )} />
                                    )}
                                </button>
                                <div className="aspect-square bg-white rounded-lg flex items-center justify-center overflow-hidden border border-slate-100">
                                    {(product.image_url || product.image) ? (
                                        <img
                                            src={product.image_url || product.image}
                                            alt={product.name}
                                            className="w-full h-full object-contain p-6"
                                        />
                                    ) : (
                                        <Box className="h-24 w-24 text-slate-300" />
                                    )}
                                </div>
                            </div>

                            {/* PSF Price */}
                            {product?.psf != null && Number(product.psf) > 0 && (
                                <div className="mt-4 pt-4 border-t border-slate-100">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-slate-500">PSF:</span>
                                        <span className="text-lg font-semibold text-slate-700">
                                            {formatPrice(Number(product.psf)).whole},{formatPrice(Number(product.psf)).decimal} TL
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* Report Error */}
                            <button className="mt-3 text-sm text-[#1E3A5F] hover:text-[#0F1F35] flex items-center gap-1">
                                <AlertCircle className="w-4 h-4" />
                                Hata Bildir
                            </button>
                        </div>
                    </div>

                    {/* Right Side - Offers */}
                    <div className="lg:col-span-8">
                        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                            {/* Header */}
                            <div className="p-4 border-b border-slate-200">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                    <h2 className="text-lg font-bold text-slate-900">
                                        Ürünün Tüm İlanları
                                    </h2>
                                    <div className="flex items-center gap-3">
                                        {/* Min Stock Filter */}
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-slate-500">Minimum Stok:</span>
                                            <select
                                                value={minStock}
                                                onChange={(e) => setMinStock(Number(e.target.value))}
                                                className="h-9 px-3 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/20 focus:border-[#1E3A5F]"
                                            >
                                                <option value={0}>--</option>
                                                <option value={5}>5+</option>
                                                <option value={10}>10+</option>
                                                <option value={50}>50+</option>
                                                <option value={100}>100+</option>
                                            </select>
                                        </div>

                                        {/* Sort */}
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-slate-500">Sirala:</span>
                                            <select
                                                value={sortBy}
                                                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                                                className="h-9 px-3 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/20 focus:border-[#1E3A5F]"
                                            >
                                                <option value="price_asc">Fiyat (Artan)</option>
                                                <option value="price_desc">Fiyat (Azalan)</option>
                                                <option value="stock_desc">Stok (Azalan)</option>
                                                <option value="stock_asc">Stok (Artan)</option>
                                                <option value="expiry_desc">SKT (En Uzun)</option>
                                                <option value="expiry_asc">SKT (En Kisa)</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Results count tab */}
                                <div className="mt-4">
                                    <span className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-lg text-sm font-medium text-slate-700">
                                        Tüm İlanlar
                                        <span className="bg-slate-200 text-slate-600 px-2 py-0.5 rounded-md text-xs font-bold">
                                            {filteredOffers.length}
                                        </span>
                                    </span>
                                </div>
                            </div>

                            {/* Offers List */}
                            <div className="divide-y divide-slate-100">
                                {filteredOffers.length === 0 ? (
                                    <div className="text-center py-12">
                                        <Box className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                                        <p className="text-slate-500">İlan bulunamadı</p>
                                    </div>
                                ) : (
                                    filteredOffers.map((offer, index) => (
                                        <div key={offer.id} className={cn(
                                            "p-4 md:p-5 hover:bg-slate-50/50 transition-colors",
                                            index === 0 && offers.length > 1 && "bg-gradient-to-r from-[#F0F4FA]/50 to-transparent"
                                        )}>
                                            {/* Desktop Layout */}
                                            <div className="hidden lg:flex items-center gap-3">
                                                {/* Seller Info */}
                                                <div className="flex items-center gap-2 min-w-[160px] max-w-[180px]">
                                                    <div className="w-9 h-9 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0 border border-slate-200">
                                                        {offer.seller?.role ? (
                                                            <SellerTypeBadge role={offer.seller.role} size="lg" />
                                                        ) : (
                                                            <span className="text-sm font-bold text-slate-400">
                                                                {(offer.seller?.nickname || offer.seller?.pharmacy_name)?.[0] || 'E'}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex items-center gap-1">
                                                            <SellerScoreBadge score={offer.seller?.seller_score} size="sm" />
                                                            {offer.seller?.id ? (
                                                                <Link
                                                                    href={`/market/satici/${offer.seller.id}`}
                                                                    className="font-semibold text-slate-900 text-xs truncate hover:text-[#1E3A5F] hover:underline transition-colors"
                                                                >
                                                                    {offer.seller.nickname || offer.seller.pharmacy_name}
                                                                </Link>
                                                            ) : (
                                                                <span className="font-semibold text-slate-900 text-xs truncate">
                                                                    {offer.seller?.nickname || offer.seller?.pharmacy_name}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-1 mt-0.5">
                                                            {offer.seller?.role && (
                                                                <span className="text-[9px] text-slate-500 bg-slate-100 px-1 py-0.5 rounded">
                                                                    {offer.seller.role === 'company' ? 'Firma' : 'Bayi'}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Info Columns */}
                                                <div className="flex items-center gap-2 flex-1 justify-center">
                                                    <div className="text-center px-2">
                                                        <div className="text-[9px] text-slate-400 uppercase">Teslimat</div>
                                                        <div className="text-xs font-medium text-slate-700">
                                                            {(() => {
                                                                const d = new Date();
                                                                d.setDate(d.getDate() + 2);
                                                                return d.toLocaleDateString('tr-TR', { weekday: 'short' });
                                                            })()}
                                                        </div>
                                                    </div>
                                                    <div className="text-center px-2 border-x border-slate-100">
                                                        <div className="text-[9px] text-slate-400 uppercase">SKT</div>
                                                        {offer.expiry_date ? (
                                                            (() => {
                                                                const expiryDate = new Date(offer.expiry_date);
                                                                const now = new Date();
                                                                const monthsUntilExpiry = (expiryDate.getFullYear() - now.getFullYear()) * 12 + (expiryDate.getMonth() - now.getMonth());
                                                                let colorClass = "text-[#1E3A5F]";
                                                                if (monthsUntilExpiry <= 3) colorClass = "text-red-600";
                                                                else if (monthsUntilExpiry <= 6) colorClass = "text-amber-600";
                                                                return <div className={cn("text-xs font-medium", colorClass)}>{expiryDate.toLocaleDateString('tr-TR', { month: '2-digit', year: '2-digit' })}</div>;
                                                            })()
                                                        ) : (
                                                            <div className="text-xs font-medium text-slate-500">-</div>
                                                        )}
                                                    </div>
                                                    <div className="text-center px-2">
                                                        <div className="text-[9px] text-slate-400 uppercase">Stok</div>
                                                        <div className={cn("text-xs font-semibold", offer.stock < 10 ? "text-red-600" : offer.stock < 50 ? "text-amber-600" : "text-[#1E3A5F]")}>
                                                            {offer.stock}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Price */}
                                                <div className="text-right min-w-[90px]">
                                                    {index === 0 && offers.length > 1 && (
                                                        <div className="text-[9px] text-[#1E3A5F] font-semibold">EN UYGUN</div>
                                                    )}
                                                    <div className="flex items-baseline justify-end">
                                                        <span className="text-xl font-bold text-slate-900">{formatPrice(offer.price).whole}</span>
                                                        <span className="text-xs text-slate-500">,{formatPrice(offer.price).decimal} TL</span>
                                                    </div>
                                                    {(quantities[offer.id] || 1) > 1 && (
                                                        <div className="text-[10px] text-slate-500">
                                                            = <span className="font-semibold">{(offer.price * (quantities[offer.id] || 1)).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL</span>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Quantity & Cart */}
                                                {offer.stock > 0 && canBuyFromSeller(offer.seller?.id || 0) ? (
                                                    <div className="flex items-center gap-2 flex-shrink-0">
                                                        {/* Quantity Selector */}
                                                        <div className="flex items-center bg-white rounded border border-slate-200">
                                                            <button
                                                                onClick={() => handleQuantityChange(offer.id, -1, offer.stock)}
                                                                disabled={(quantities[offer.id] || 1) <= 1}
                                                                className="w-7 h-8 flex items-center justify-center text-slate-500 hover:bg-slate-50 disabled:opacity-30"
                                                            >
                                                                <Minus className="w-3 h-3" />
                                                            </button>
                                                            <span className="w-8 text-center text-xs font-bold text-slate-800 border-x border-slate-200">
                                                                {quantities[offer.id] || 1}
                                                            </span>
                                                            <button
                                                                onClick={() => handleQuantityChange(offer.id, 1, offer.stock)}
                                                                disabled={(quantities[offer.id] || 1) >= offer.stock}
                                                                className="w-7 h-8 flex items-center justify-center text-slate-500 hover:bg-slate-50 disabled:opacity-30"
                                                            >
                                                                <Plus className="w-3 h-3" />
                                                            </button>
                                                        </div>

                                                        {/* Add to Cart Button */}
                                                        {addedToCart === offer.id ? (
                                                            <Button
                                                                size="sm"
                                                                className="h-8 bg-[#1E3A5F] hover:bg-[#0F1F35] text-white font-medium px-3 gap-1.5 text-xs"
                                                                onClick={() => setOpen(true)}
                                                            >
                                                                <Check className="w-3.5 h-3.5" />
                                                                Eklendi
                                                            </Button>
                                                        ) : (
                                                            <Button
                                                                size="sm"
                                                                onClick={() => handleAddToCart(offer.id, offer.stock, offer.seller?.id)}
                                                                disabled={addingToCart === offer.id}
                                                                className="h-8 bg-[#1E3A5F] hover:bg-[#1E3A5F] text-white font-medium px-3 gap-1.5 text-xs"
                                                            >
                                                                {addingToCart === offer.id ? (
                                                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                                ) : (
                                                                    <ShoppingCart className="w-3.5 h-3.5" />
                                                                )}
                                                                Ekle
                                                            </Button>
                                                        )}
                                                    </div>
                                                ) : offer.stock <= 0 ? (
                                                    <Button size="sm" disabled className="h-8 bg-slate-100 text-slate-400 px-3 text-xs">
                                                        Stokta Yok
                                                    </Button>
                                                ) : null}
                                            </div>

                                            {/* Mobile & Tablet Layout */}
                                            <div className="lg:hidden space-y-3">
                                                {/* Top Row: Seller + Price */}
                                                <div className="flex items-start justify-between gap-3">
                                                    {/* Seller */}
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0 border border-slate-200">
                                                            {offer.seller?.role ? (
                                                                <SellerTypeBadge role={offer.seller.role} size="lg" />
                                                            ) : (
                                                                <span className="text-base font-bold text-slate-400">
                                                                    {(offer.seller?.nickname || offer.seller?.pharmacy_name)?.[0] || 'E'}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center gap-1.5">
                                                                <SellerScoreBadge score={offer.seller?.seller_score} size="md" />
                                                                {offer.seller?.id ? (
                                                                    <Link
                                                                        href={`/market/satici/${offer.seller.id}`}
                                                                        className="font-semibold text-slate-900 text-sm hover:text-[#1E3A5F] hover:underline transition-colors"
                                                                    >
                                                                        {offer.seller.nickname || offer.seller.pharmacy_name}
                                                                    </Link>
                                                                ) : (
                                                                    <span className="font-semibold text-slate-900 text-sm">
                                                                        {offer.seller?.nickname || offer.seller?.pharmacy_name}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div className="flex items-center gap-1.5 mt-0.5">
                                                                {offer.seller?.role && (
                                                                    <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded font-medium">
                                                                        {offer.seller.role === 'company' ? 'Firma' : 'Bayi'}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {/* Price */}
                                                    <div className="text-right">
                                                        {index === 0 && offers.length > 1 && (
                                                            <div className="text-[10px] text-[#1E3A5F] font-semibold mb-0.5">EN UYGUN</div>
                                                        )}
                                                        <div className="flex items-baseline justify-end">
                                                            <span className="text-xl font-bold text-slate-900">{formatPrice(offer.price).whole}</span>
                                                            <span className="text-xs font-medium text-slate-500">,{formatPrice(offer.price).decimal} TL</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Middle Row: Info Pills */}
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 rounded-lg text-xs">
                                                        <Truck className="w-3.5 h-3.5 text-slate-400" />
                                                        <span className="text-slate-600">
                                                            {(() => {
                                                                const d = new Date();
                                                                d.setDate(d.getDate() + 2);
                                                                return d.toLocaleDateString('tr-TR', { weekday: 'short' });
                                                            })()}
                                                        </span>
                                                    </div>
                                                    {offer.expiry_date && (
                                                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 rounded-lg text-xs">
                                                            <span className="text-slate-500">SKT:</span>
                                                            {(() => {
                                                                const expiryDate = new Date(offer.expiry_date);
                                                                const now = new Date();
                                                                const monthsUntilExpiry = (expiryDate.getFullYear() - now.getFullYear()) * 12 + (expiryDate.getMonth() - now.getMonth());
                                                                let colorClass = "text-[#1E3A5F]";
                                                                if (monthsUntilExpiry <= 3) colorClass = "text-red-600";
                                                                else if (monthsUntilExpiry <= 6) colorClass = "text-amber-600";
                                                                return <span className={cn("font-medium", colorClass)}>{expiryDate.toLocaleDateString('tr-TR', { month: '2-digit', year: 'numeric' })}</span>;
                                                            })()}
                                                        </div>
                                                    )}
                                                    <div className={cn(
                                                        "inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium",
                                                        offer.stock < 10 ? "bg-red-50 text-red-600" : offer.stock < 50 ? "bg-amber-50 text-amber-600" : "bg-[#F0F4FA] text-[#1E3A5F]"
                                                    )}>
                                                        <Box className="w-3.5 h-3.5" />
                                                        {offer.stock} adet
                                                    </div>
                                                </div>

                                                {/* Bottom Row: Quantity + Cart */}
                                                {offer.stock > 0 && canBuyFromSeller(offer.seller?.id || 0) ? (
                                                    <div className="flex items-center gap-3">
                                                        {/* Quantity Selector */}
                                                        <div className="flex items-center bg-white rounded-lg border border-slate-200 overflow-hidden">
                                                            <button
                                                                onClick={() => handleQuantityChange(offer.id, -1, offer.stock)}
                                                                disabled={(quantities[offer.id] || 1) <= 1}
                                                                className="w-10 h-11 flex items-center justify-center text-slate-500 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed"
                                                            >
                                                                <Minus className="w-4 h-4" />
                                                            </button>
                                                            <span className="w-12 text-center text-sm font-bold text-slate-800 border-x border-slate-200">
                                                                {quantities[offer.id] || 1}
                                                            </span>
                                                            <button
                                                                onClick={() => handleQuantityChange(offer.id, 1, offer.stock)}
                                                                disabled={(quantities[offer.id] || 1) >= offer.stock}
                                                                className="w-10 h-11 flex items-center justify-center text-slate-500 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed"
                                                            >
                                                                <Plus className="w-4 h-4" />
                                                            </button>
                                                        </div>

                                                        {/* Add to Cart Button */}
                                                        {addedToCart === offer.id ? (
                                                            <Button
                                                                className="flex-1 h-11 bg-[#1E3A5F] hover:bg-[#0F1F35] text-white font-semibold gap-2 rounded-lg"
                                                                onClick={() => setOpen(true)}
                                                            >
                                                                <Check className="w-4 h-4" />
                                                                Sepette
                                                            </Button>
                                                        ) : (
                                                            <Button
                                                                onClick={() => handleAddToCart(offer.id, offer.stock, offer.seller?.id)}
                                                                disabled={addingToCart === offer.id}
                                                                className="flex-1 h-11 bg-[#1E3A5F] hover:bg-[#1E3A5F] text-white font-semibold gap-2 rounded-lg shadow-sm shadow-[#1E3A5F]/20"
                                                            >
                                                                {addingToCart === offer.id ? (
                                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                                ) : (
                                                                    <ShoppingCart className="w-4 h-4" />
                                                                )}
                                                                Sepete Ekle
                                                            </Button>
                                                        )}
                                                    </div>
                                                ) : offer.stock <= 0 ? (
                                                    <Button disabled className="w-full h-11 bg-slate-100 text-slate-400 cursor-not-allowed rounded-lg">
                                                        Stokta Yok
                                                    </Button>
                                                ) : null}

                                                {/* Total Price on Mobile */}
                                                {(quantities[offer.id] || 1) > 1 && canBuyFromSeller(offer.seller?.id || 0) && (
                                                    <div className="text-center text-sm text-slate-500 pt-1 border-t border-slate-100">
                                                        Toplam: <span className="font-semibold text-slate-800">
                                                            {(offer.price * (quantities[offer.id] || 1)).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL
                                                        </span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Campaign Tags - Both Desktop & Mobile */}
                                            {offer.campaigns && offer.campaigns.length > 0 && (() => {
                                                const campaignBadges = offer.campaigns.map((campaign) => {
                                                    if (campaign.type === 'store_discount' || campaign.type === 'product_discount' || campaign.type === 'brand_discount') {
                                                        return (
                                                            <span key={campaign.id} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-purple-600 text-white text-[11px] font-medium rounded-md shadow-sm">
                                                                <Star className="w-3 h-3" />
                                                                %{campaign.discount_rate} indirim
                                                            </span>
                                                        );
                                                    }
                                                    if (campaign.type === 'gift_product') {
                                                        return (
                                                            <span key={campaign.id} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#1E3A5F] text-white text-[11px] font-medium rounded-md shadow-sm">
                                                                <Gift className="w-3 h-3" />
                                                                {campaign.name}
                                                            </span>
                                                        );
                                                    }
                                                    if (campaign.min_purchase_amount) {
                                                        return (
                                                            <span key={campaign.id} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#F0F4FA] text-white text-[11px] font-medium rounded-md shadow-sm">
                                                                <Truck className="w-3 h-3" />
                                                                {campaign.min_purchase_amount.toLocaleString('tr-TR')} TL üstü kargo bedava
                                                            </span>
                                                        );
                                                    }
                                                    return (
                                                        <span key={campaign.id} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-600 text-white text-[11px] font-medium rounded-md shadow-sm">
                                                            <Star className="w-3 h-3" />
                                                            {campaign.name}
                                                        </span>
                                                    );
                                                });

                                                const isExpanded = expandedCampaigns[offer.id] || false;
                                                const visibleBadges = isExpanded ? campaignBadges : campaignBadges.slice(0, 2);
                                                const hiddenCount = campaignBadges.length - 2;

                                                return (
                                                    <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2">
                                                        {visibleBadges}
                                                        {hiddenCount > 0 && (
                                                            <button
                                                                onClick={() => setExpandedCampaigns(prev => ({ ...prev, [offer.id]: !prev[offer.id] }))}
                                                                className="text-[11px] text-slate-600 hover:text-slate-800 font-semibold flex items-center gap-0.5 ml-auto"
                                                            >
                                                                {isExpanded ? (
                                                                    <>
                                                                        Gizle
                                                                        <ChevronUp className="w-3 h-3" />
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        +{hiddenCount} Kampanya
                                                                        <ChevronDown className="w-3 h-3" />
                                                                    </>
                                                                )}
                                                            </button>
                                                        )}
                                                    </div>
                                                );
                                            })()}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Açıklama + Teknik Özellikler Tab'ı (ilanların alt kısmı) */}
                {(() => {
                    const specs = product.specs ?? [];
                    const hasDescription = !!(product.description && product.description.trim().length > 0);
                    const hasSpecs = specs.length > 0;
                    if (!hasDescription && !hasSpecs) {
                        return null;
                    }
                    const defaultTab = hasDescription ? 'description' : 'specs';
                    return (
                        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden mb-6">
                            <Tabs defaultValue={defaultTab} className="w-full">
                                <div className="px-4 md:px-5 pt-4">
                                    <TabsList className="bg-slate-100">
                                        {hasDescription && (
                                            <TabsTrigger value="description">Açıklama</TabsTrigger>
                                        )}
                                        {hasSpecs && (
                                            <TabsTrigger value="specs">
                                                Teknik Özellikler
                                                <Badge variant="secondary" className="ml-2 bg-[#1E3A5F]/10 text-[#1E3A5F] border-0">
                                                    {specs.length}
                                                </Badge>
                                            </TabsTrigger>
                                        )}
                                    </TabsList>
                                </div>

                                {hasDescription && (
                                    <TabsContent value="description" className="px-4 md:px-5 pb-5 pt-3">
                                        <div className="prose prose-sm max-w-none text-slate-700 whitespace-pre-line leading-relaxed">
                                            {product.description}
                                        </div>
                                    </TabsContent>
                                )}

                                {hasSpecs && (
                                    <TabsContent value="specs" className="px-4 md:px-5 pb-5 pt-3">
                                        <div className="overflow-hidden border border-slate-200 rounded-lg">
                                            <table className="w-full text-sm">
                                                <tbody>
                                                    {specs.map((spec, idx) => (
                                                        <tr
                                                            key={`${spec.label}-${idx}`}
                                                            className={cn(
                                                                'border-b border-slate-100 last:border-b-0',
                                                                idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'
                                                            )}
                                                        >
                                                            <td className="px-4 py-2.5 text-slate-600 font-medium w-1/3 align-top">
                                                                {spec.label}
                                                            </td>
                                                            <td className="px-4 py-2.5 text-slate-900 tabular-nums">
                                                                {spec.value}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </TabsContent>
                                )}
                            </Tabs>
                        </div>
                    );
                })()}

                {/* Reviews Section */}
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                    {/* Reviews Header */}
                    <div className="p-4 md:p-5 border-b border-slate-200">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                <MessageSquare className="w-5 h-5 text-[#1E3A5F]" />
                                Ürün Yorumları
                            </h2>
                            <div className="flex items-center gap-3">
                                <span className="text-sm text-slate-500">
                                    {reviewSummary.totalCount} yorum
                                </span>
                                {reviewableItems.length > 0 && !showReviewForm && (
                                    <Button
                                        onClick={() => {
                                            setSelectedOrderItem(reviewableItems[0]);
                                            setShowReviewForm(true);
                                        }}
                                        className="bg-[#1E3A5F] hover:bg-[#1E3A5F] text-white gap-2"
                                        size="sm"
                                    >
                                        <PenLine className="w-4 h-4" />
                                        Yorum Yaz
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Review Form */}
                    {showReviewForm && selectedOrderItem && (
                        <div className="p-4 md:p-5 bg-[#F0F4FA]/50 border-b border-[#D9E2EF]">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-semibold text-slate-900">Yorum Yaz</h3>
                                    <button
                                        onClick={() => {
                                            setShowReviewForm(false);
                                            setSelectedOrderItem(null);
                                        }}
                                        className="text-slate-400 hover:text-slate-600 text-sm"
                                    >
                                        Vazgeç
                                    </button>
                                </div>

                                {/* Order Info */}
                                <div className="text-sm text-slate-600 bg-white rounded-lg p-3 border border-slate-200">
                                    <span className="text-slate-400">Sipariş:</span>{' '}
                                    <span className="font-medium">{selectedOrderItem.order.order_number}</span>
                                    <span className="mx-2 text-slate-300">|</span>
                                    <span className="text-slate-400">Satıcı:</span>{' '}
                                    <span className="font-medium">{selectedOrderItem.seller.nickname || selectedOrderItem.seller.pharmacy_name}</span>
                                </div>

                                {/* Select Order Item if multiple */}
                                {reviewableItems.length > 1 && (
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Sipariş Seçin
                                        </label>
                                        <select
                                            value={selectedOrderItem.id}
                                            onChange={(e) => {
                                                const item = reviewableItems.find(i => i.id === Number(e.target.value));
                                                if (item) setSelectedOrderItem(item);
                                            }}
                                            className="w-full h-10 px-3 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/20 focus:border-[#1E3A5F]"
                                        >
                                            {reviewableItems.map((item) => (
                                                <option key={item.id} value={item.id}>
                                                    {item.order.order_number} - {item.seller.nickname || item.seller.pharmacy_name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                {/* Overall Rating */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Genel Puan <span className="text-red-500">*</span>
                                    </label>
                                    <StarRating
                                        value={reviewForm.rating}
                                        onChange={(v) => setReviewForm(prev => ({ ...prev, rating: v }))}
                                    />
                                </div>

                                {/* Sub Ratings */}
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-slate-600 mb-1.5">
                                            Teslimat
                                        </label>
                                        <StarRating
                                            value={reviewForm.deliveryRating}
                                            onChange={(v) => setReviewForm(prev => ({ ...prev, deliveryRating: v }))}
                                            size="sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-600 mb-1.5">
                                            Ürün Kalitesi
                                        </label>
                                        <StarRating
                                            value={reviewForm.qualityRating}
                                            onChange={(v) => setReviewForm(prev => ({ ...prev, qualityRating: v }))}
                                            size="sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-600 mb-1.5">
                                            İletişim
                                        </label>
                                        <StarRating
                                            value={reviewForm.communicationRating}
                                            onChange={(v) => setReviewForm(prev => ({ ...prev, communicationRating: v }))}
                                            size="sm"
                                        />
                                    </div>
                                </div>

                                {/* Comment */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Yorumunuz
                                    </label>
                                    <textarea
                                        value={reviewForm.comment}
                                        onChange={(e) => setReviewForm(prev => ({ ...prev, comment: e.target.value }))}
                                        placeholder="Deneyiminizi paylaşın..."
                                        rows={3}
                                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/20 focus:border-[#1E3A5F] resize-none"
                                    />
                                </div>

                                {/* Submit Button */}
                                <div className="flex justify-end">
                                    <Button
                                        onClick={handleSubmitReview}
                                        disabled={submittingReview || reviewForm.rating === 0}
                                        className="bg-[#1E3A5F] hover:bg-[#1E3A5F] text-white gap-2"
                                    >
                                        {submittingReview ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <Send className="w-4 h-4" />
                                        )}
                                        Yorumu Gönder
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Reviews Content */}
                    {reviewsLoading ? (
                        <div className="p-6">
                            <div className="space-y-4">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="animate-pulse">
                                        <div className="flex items-start gap-4">
                                            <Skeleton className="w-10 h-10 rounded-full" />
                                            <div className="flex-1 space-y-2">
                                                <Skeleton className="h-4 w-32" />
                                                <Skeleton className="h-3 w-24" />
                                                <Skeleton className="h-16 w-full" />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : reviews.length === 0 && !showReviewForm ? (
                        <div className="text-center py-12 px-4">
                            <MessageSquare className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                            <h3 className="text-lg font-semibold text-slate-900 mb-1">Henüz yorum yapılmamış</h3>
                            <p className="text-slate-500 text-sm mb-4">Bu ürün için henüz yorum bulunmuyor.</p>
                            {reviewableItems.length > 0 ? (
                                <Button
                                    onClick={() => {
                                        setSelectedOrderItem(reviewableItems[0]);
                                        setShowReviewForm(true);
                                    }}
                                    className="bg-[#1E3A5F] hover:bg-[#1E3A5F] text-white gap-2"
                                >
                                    <PenLine className="w-4 h-4" />
                                    İlk Yorumu Siz Yapın
                                </Button>
                            ) : !user ? (
                                <p className="text-sm text-slate-400">
                                    Yorum yapmak için{' '}
                                    <Link href="/login" className="text-[#1E3A5F] hover:underline">
                                        giriş yapın
                                    </Link>
                                </p>
                            ) : (
                                <p className="text-sm text-slate-400">
                                    Yorum yapmak için bu ürünü satın alıp teslim almanız gerekiyor.
                                </p>
                            )}
                        </div>
                    ) : reviews.length === 0 && showReviewForm ? (
                        null
                    ) : (
                        <div>
                            {/* Rating Summary */}
                            <div className="p-4 md:p-5 bg-slate-50/50 border-b border-slate-100">
                                <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8">
                                    {/* Average Rating */}
                                    <div className="text-center sm:text-left">
                                        <div className="flex items-baseline gap-1 justify-center sm:justify-start">
                                            <span className="text-4xl font-bold text-slate-900">
                                                {reviewSummary.averageRating.toFixed(1)}
                                            </span>
                                            <span className="text-lg text-slate-400">/5</span>
                                        </div>
                                        <div className="flex items-center justify-center sm:justify-start gap-0.5 mt-1">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <Star
                                                    key={star}
                                                    className={cn(
                                                        "w-4 h-4",
                                                        star <= Math.round(reviewSummary.averageRating)
                                                            ? "fill-amber-400 text-amber-400"
                                                            : "text-slate-300"
                                                    )}
                                                />
                                            ))}
                                        </div>
                                        <p className="text-xs text-slate-500 mt-1">
                                            {reviewSummary.totalCount} degerlendirme
                                        </p>
                                    </div>

                                    {/* Rating Distribution */}
                                    <div className="flex-1 space-y-1.5">
                                        {[5, 4, 3, 2, 1].map((rating) => {
                                            const count = reviewSummary.distribution[rating] || 0;
                                            const percentage = reviewSummary.totalCount > 0
                                                ? (count / reviewSummary.totalCount) * 100
                                                : 0;
                                            return (
                                                <div key={rating} className="flex items-center gap-2">
                                                    <span className="text-xs text-slate-500 w-3">{rating}</span>
                                                    <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                                                    <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-amber-400 rounded-full transition-all"
                                                            style={{ width: `${percentage}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-xs text-slate-400 w-6">{count}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            {/* Reviews List */}
                            <div className="divide-y divide-slate-100">
                                {reviews.map((review) => (
                                    <div key={review.id} className="p-4 md:p-5">
                                        <div className="flex items-start gap-3">
                                            {/* Avatar */}
                                            <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center flex-shrink-0">
                                                <User className="w-5 h-5 text-slate-400" />
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                {/* Header */}
                                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-2">
                                                    <div>
                                                        <span className="font-semibold text-slate-900 text-sm">
                                                            {review.buyer?.nickname || review.buyer?.pharmacy_name || 'Anonim'}
                                                        </span>
                                                        <span className="text-xs text-slate-400 ml-2">
                                                            {new Date(review.created_at).toLocaleDateString('tr-TR', {
                                                                year: 'numeric',
                                                                month: 'long',
                                                                day: 'numeric'
                                                            })}
                                                        </span>
                                                    </div>
                                                    {/* Rating Stars */}
                                                    <div className="flex items-center gap-0.5">
                                                        {[1, 2, 3, 4, 5].map((star) => (
                                                            <Star
                                                                key={star}
                                                                className={cn(
                                                                    "w-3.5 h-3.5",
                                                                    star <= review.rating
                                                                        ? "fill-amber-400 text-amber-400"
                                                                        : "text-slate-300"
                                                                )}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Sub Ratings */}
                                                {(review.delivery_rating || review.quality_rating || review.communication_rating) && (
                                                    <div className="flex flex-wrap gap-2 mb-2">
                                                        {review.delivery_rating && (
                                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-medium rounded">
                                                                Teslimat: {review.delivery_rating}/5
                                                            </span>
                                                        )}
                                                        {review.quality_rating && (
                                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#F0F4FA] text-[#1E3A5F] text-[10px] font-medium rounded">
                                                                Kalite: {review.quality_rating}/5
                                                            </span>
                                                        )}
                                                        {review.communication_rating && (
                                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-50 text-purple-700 text-[10px] font-medium rounded">
                                                                Iletisim: {review.communication_rating}/5
                                                            </span>
                                                        )}
                                                    </div>
                                                )}

                                                {/* Comment */}
                                                {review.comment && (
                                                    <p className="text-sm text-slate-600 leading-relaxed">
                                                        {review.comment}
                                                    </p>
                                                )}

                                                {/* Seller Reply */}
                                                {review.seller_reply && (
                                                    <div className="mt-3 p-3 bg-slate-50 rounded-lg border-l-2 border-[#D9E2EF]">
                                                        <div className="flex items-center gap-1.5 mb-1">
                                                            <ThumbsUp className="w-3 h-3 text-[#1E3A5F]" />
                                                            <span className="text-xs font-semibold text-[#1E3A5F]">
                                                                Satıcı Yanıtı
                                                            </span>
                                                            {review.seller_replied_at && (
                                                                <span className="text-[10px] text-slate-400">
                                                                    - {new Date(review.seller_replied_at).toLocaleDateString('tr-TR')}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-sm text-slate-600">
                                                            {review.seller_reply}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
