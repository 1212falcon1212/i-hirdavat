'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
    offersApi,
    Offer,
    CreateOfferData,
    UpdateOfferData,
    productsApi,
    Product,
} from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Box,
    Plus,
    Search,
    Edit,
    CheckCircle2,
    XCircle,
    X,
    Loader2,
    Package,
    Tag,
    Hash,
    FileText,
    BarChart3,
    Download,
    Upload,
    MoreHorizontal,
    TrendingDown,
    Calendar,
    AlertTriangle,
    Trash2,
} from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// ===== Helpers =====

const OFFER_STATUS_MAP: Record<string, string> = {
    'aktif-ilanlar': 'active',
    'bekleyen-ilanlar': 'pending',
    'pasif-ilanlar': 'inactive',
    'reddedilen-ilanlar': 'rejected',
};

interface StatusPresentation {
    label: string;
    className: string;
}

/**
 * Stok + offer.status kombinasyonundan türetilmiş durum pill'i.
 * Kritik: stok <= 5 | Azaldı: stok <= 20 | Aktif/Pasif/Bekliyor/Red: offer.status
 */
function getPresentation(offer: Offer): StatusPresentation {
    if (offer.status === 'active') {
        if (offer.stock <= 5) {
            return { label: 'KRİTİK', className: 'bg-danger-bg text-danger' };
        }
        if (offer.stock <= 20) {
            return { label: 'AZALDI', className: 'bg-warning-bg text-warning' };
        }
        return { label: 'AKTİF', className: 'bg-success-bg text-success' };
    }
    if (offer.status === 'pending') {
        return { label: 'ONAY BEKLİYOR', className: 'bg-warning-bg text-warning' };
    }
    if (offer.status === 'rejected') {
        return { label: 'REDDEDİLDİ', className: 'bg-danger-bg text-danger' };
    }
    if (offer.status === 'sold_out') {
        return { label: 'TÜKENDİ', className: 'bg-danger-bg text-danger' };
    }
    return { label: 'PASİF', className: 'bg-neutral-100 text-neutral-600' };
}

const formatPrice = (price: number | string | null | undefined): string => {
    const n = typeof price === 'number' ? price : parseFloat(String(price ?? 0));
    if (!Number.isFinite(n)) return '—';
    return new Intl.NumberFormat('tr-TR', {
        style: 'currency',
        currency: 'TRY',
        minimumFractionDigits: 2,
    }).format(n);
};

// ===== Main Component =====

export function ListingsContent({ subNav }: { subNav: string }) {
    const [offers, setOffers] = useState<Offer[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
    const [actionMenuId, setActionMenuId] = useState<number | null>(null);

    // Dialog state
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<Product[]>([]);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [isSearching, setIsSearching] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingOffer, setEditingOffer] = useState<Offer | null>(null);
    const [formData, setFormData] = useState({
        price: '',
        stock: '',
        batch_number: '',
        notes: '',
    });

    // Bulk update modal state
    const [bulkPriceOpen, setBulkPriceOpen] = useState(false);
    const [bulkStockOpen, setBulkStockOpen] = useState(false);
    const [bulkSubmitting, setBulkSubmitting] = useState(false);
    const [bulkPriceMode, setBulkPriceMode] = useState<'percent_up' | 'percent_down' | 'fixed'>('percent_up');
    const [bulkPriceValue, setBulkPriceValue] = useState('');
    const [bulkStockMode, setBulkStockMode] = useState<'set' | 'add' | 'subtract'>('set');
    const [bulkStockValue, setBulkStockValue] = useState('');

    const selectedCount = selectedIds.size;
    const allSelected = offers.length > 0 && selectedCount === offers.length;

    // Listing load
    useEffect(() => {
        loadOffers();
    }, [subNav]);

    const loadOffers = async () => {
        setLoading(true);
        try {
            const status = OFFER_STATUS_MAP[subNav];
            const response = await offersApi.getMyOffers({ status });
            if (response.data) {
                setOffers(response.data.offers);
                setSelectedIds(new Set());
            }
        } catch {
            toast.error('İlanlar yüklenirken hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    // Selection helpers
    const toggleSelect = (id: number) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const toggleSelectAll = () => {
        if (allSelected) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(offers.map((o) => o.id)));
        }
    };

    const clearSelection = () => setSelectedIds(new Set());

    // Search for new offer creation
    const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
    const handleProductSearch = useCallback((query: string) => {
        setSearchQuery(query);
        if (searchTimeout.current) clearTimeout(searchTimeout.current);
        if (query.length < 2) {
            setSearchResults([]);
            setIsSearching(false);
            return;
        }
        setIsSearching(true);
        searchTimeout.current = setTimeout(async () => {
            try {
                const response = await productsApi.search(query);
                if (response.data) setSearchResults(response.data.products);
            } finally {
                setIsSearching(false);
            }
        }, 300);
    }, []);

    // Create / Edit / Delete
    const handleEditOffer = (offer: Offer) => {
        setEditingOffer(offer);
        setFormData({
            price: String(offer.price),
            stock: String(offer.stock),
            batch_number: offer.batch_number || '',
            notes: offer.notes || '',
        });
        setSelectedProduct(offer.product || null);
        setIsDialogOpen(true);
        setActionMenuId(null);
    };

    const handleSubmit = async () => {
        if (!editingOffer && !selectedProduct) {
            toast.error('Lütfen bir ürün seçin');
            return;
        }
        if (!formData.price || !formData.stock) {
            toast.error('Lütfen fiyat ve stok bilgilerini doldurun');
            return;
        }

        setIsSubmitting(true);
        try {
            if (editingOffer) {
                const data: UpdateOfferData = {
                    price: parseFloat(formData.price),
                    stock: parseInt(formData.stock),
                    batch_number: formData.batch_number || undefined,
                    notes: formData.notes || undefined,
                };
                const res = await offersApi.update(editingOffer.id, data);
                if (res.data) {
                    toast.success('İlan güncellendi');
                    setIsDialogOpen(false);
                    resetForm();
                    loadOffers();
                } else if (res.error) {
                    toast.error(res.error);
                }
            } else {
                const data: CreateOfferData = {
                    product_id: selectedProduct!.id,
                    price: parseFloat(formData.price),
                    stock: parseInt(formData.stock),
                    batch_number: formData.batch_number || undefined,
                    notes: formData.notes || undefined,
                };
                const res = await offersApi.create(data);
                if (res.data) {
                    toast.success('İlan oluşturuldu ve yayınlandı');
                    setIsDialogOpen(false);
                    resetForm();
                    loadOffers();
                } else if (res.error) {
                    toast.error(res.error);
                }
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleToggleStatus = async (id: number) => {
        try {
            const res = await offersApi.toggleStatus(id);
            if (res.data) {
                toast.success(res.data.message);
                loadOffers();
            }
        } catch {
            toast.error('Durum değiştirilemedi');
        }
        setActionMenuId(null);
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Bu ilanı silmek istediğinize emin misiniz?')) return;
        try {
            await offersApi.delete(id);
            toast.success('İlan silindi');
            loadOffers();
        } catch {
            toast.error('İlan silinirken hata oluştu');
        }
        setActionMenuId(null);
    };

    const resetForm = () => {
        setEditingOffer(null);
        setSelectedProduct(null);
        setSearchQuery('');
        setSearchResults([]);
        setFormData({ price: '', stock: '', batch_number: '', notes: '' });
    };

    // ===== Bulk operations =====

    const selectedOffers = useMemo(
        () => offers.filter((o) => selectedIds.has(o.id)),
        [offers, selectedIds]
    );

    const applyBulkPrice = async () => {
        const value = parseFloat(bulkPriceValue);
        if (!Number.isFinite(value) || value < 0) {
            toast.error('Geçerli bir değer girin');
            return;
        }
        setBulkSubmitting(true);
        let success = 0;
        let fail = 0;
        for (const offer of selectedOffers) {
            let newPrice = offer.price;
            if (bulkPriceMode === 'percent_up') {
                newPrice = Math.round(offer.price * (1 + value / 100) * 100) / 100;
            } else if (bulkPriceMode === 'percent_down') {
                newPrice = Math.max(0.01, Math.round(offer.price * (1 - value / 100) * 100) / 100);
            } else {
                newPrice = value;
            }
            try {
                const res = await offersApi.update(offer.id, { price: newPrice });
                if (res.data) success++;
                else fail++;
            } catch {
                fail++;
            }
        }
        setBulkSubmitting(false);
        setBulkPriceOpen(false);
        setBulkPriceValue('');
        if (success > 0) toast.success(`${success} ilan fiyatı güncellendi`);
        if (fail > 0) toast.error(`${fail} ilan güncellenemedi`);
        loadOffers();
    };

    const applyBulkStock = async () => {
        const value = parseInt(bulkStockValue);
        if (!Number.isFinite(value) || value < 0) {
            toast.error('Geçerli bir adet girin');
            return;
        }
        setBulkSubmitting(true);
        let success = 0;
        let fail = 0;
        for (const offer of selectedOffers) {
            let newStock = offer.stock;
            if (bulkStockMode === 'set') newStock = value;
            else if (bulkStockMode === 'add') newStock = offer.stock + value;
            else if (bulkStockMode === 'subtract') newStock = Math.max(0, offer.stock - value);
            try {
                const res = await offersApi.update(offer.id, { stock: newStock });
                if (res.data) success++;
                else fail++;
            } catch {
                fail++;
            }
        }
        setBulkSubmitting(false);
        setBulkStockOpen(false);
        setBulkStockValue('');
        if (success > 0) toast.success(`${success} ilan stoğu güncellendi`);
        if (fail > 0) toast.error(`${fail} ilan güncellenemedi`);
        loadOffers();
    };

    const handleBulkDelete = async () => {
        if (selectedCount === 0) return;
        if (!confirm(`${selectedCount} ilanı silmek istediğinize emin misiniz?`)) return;
        setBulkSubmitting(true);
        let success = 0;
        let fail = 0;
        for (const id of selectedIds) {
            try {
                await offersApi.delete(id);
                success++;
            } catch {
                fail++;
            }
        }
        setBulkSubmitting(false);
        if (success > 0) toast.success(`${success} ilan silindi`);
        if (fail > 0) toast.error(`${fail} ilan silinemedi`);
        loadOffers();
    };

    const totalLabel = loading ? '—' : `${offers.length.toLocaleString('tr-TR')} ilan`;

    return (
        <div className="space-y-4">
            {/* Header: title + action buttons */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h3 className="text-lg font-black text-neutral-900">İlanlarım</h3>
                    <p className="text-sm text-neutral-600 tabular-num">{totalLabel}</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        className="gap-2 rounded-sm border-neutral-200 text-neutral-800 hover:bg-neutral-50"
                        onClick={() => toast('Excel dışa aktarım yakında aktif olacak')}
                    >
                        <Download className="w-4 h-4" />
                        Excel İndir
                    </Button>
                    <Button
                        className="gap-2 rounded-sm bg-accent-500 hover:bg-accent-400 text-primary-900 font-bold"
                        onClick={() => toast('Toplu yükleme (Excel/CSV) yakında aktif olacak')}
                    >
                        <Upload className="w-4 h-4" />
                        Toplu Yükle
                    </Button>
                    <Button
                        className="gap-2 rounded-sm bg-primary-900 hover:bg-primary-700 text-white font-bold"
                        onClick={() => {
                            resetForm();
                            setIsDialogOpen(true);
                        }}
                    >
                        <Plus className="w-4 h-4" />
                        Yeni İlan
                    </Button>
                </div>
            </div>

            {/* Bulk action bar — only when selected */}
            {selectedCount > 0 && (
                <div className="bg-primary-900 text-white rounded-sm px-4 py-3 flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-2 text-sm font-semibold">
                        <CheckCircle2 className="w-4 h-4 text-accent-500" />
                        <span className="tabular-num">{selectedCount}</span> ilan seçili
                        <button
                            type="button"
                            onClick={clearSelection}
                            className="ml-2 text-white/60 hover:text-white transition-colors"
                            title="Seçimi temizle"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                        <button
                            type="button"
                            onClick={() => setBulkPriceOpen(true)}
                            className="inline-flex items-center gap-1.5 px-3 h-9 text-xs font-semibold rounded-sm bg-white/10 hover:bg-white/20 transition-colors"
                        >
                            <Tag className="w-3.5 h-3.5" />
                            Fiyat Güncelle
                        </button>
                        <button
                            type="button"
                            onClick={() => setBulkStockOpen(true)}
                            className="inline-flex items-center gap-1.5 px-3 h-9 text-xs font-semibold rounded-sm bg-white/10 hover:bg-white/20 transition-colors"
                        >
                            <Package className="w-3.5 h-3.5" />
                            Stok Güncelle
                        </button>
                        <button
                            type="button"
                            onClick={handleBulkDelete}
                            disabled={bulkSubmitting}
                            className="inline-flex items-center gap-1.5 px-3 h-9 text-xs font-semibold rounded-sm text-danger hover:bg-white/10 transition-colors disabled:opacity-50"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                            Seçilenleri Sil
                        </button>
                    </div>
                </div>
            )}

            {/* Table */}
            <div className="border border-neutral-200 rounded-sm overflow-hidden bg-white">
                {loading ? (
                    <div className="p-6 space-y-3">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <Skeleton key={i} className="h-16 w-full rounded-sm" />
                        ))}
                    </div>
                ) : offers.length === 0 ? (
                    <div className="text-center py-16 px-4">
                        <Box className="w-12 h-12 mx-auto text-neutral-300 mb-3" />
                        <p className="text-sm text-neutral-600 mb-4">İlanınız bulunmuyor.</p>
                        <Button
                            onClick={() => {
                                resetForm();
                                setIsDialogOpen(true);
                            }}
                            className="bg-primary-900 hover:bg-primary-700 text-white rounded-sm gap-2"
                        >
                            <Plus className="w-4 h-4" />
                            İlk İlanınızı Oluşturun
                        </Button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-neutral-50 border-b border-neutral-200 text-[11px] font-bold uppercase tracking-[1px] text-neutral-600">
                                    <th className="p-3 w-10">
                                        <input
                                            type="checkbox"
                                            checked={allSelected}
                                            onChange={toggleSelectAll}
                                            className="w-4 h-4 accent-primary-700 cursor-pointer"
                                            aria-label="Tümünü seç"
                                        />
                                    </th>
                                    <th className="p-3 text-left">İlan</th>
                                    <th className="p-3 text-right">Bayi Fiyatı</th>
                                    <th className="p-3 text-right">Stok</th>
                                    <th className="p-3 text-center">Durum</th>
                                    <th className="p-3 text-right w-16">Aksiyon</th>
                                </tr>
                            </thead>
                            <tbody>
                                {offers.map((offer) => {
                                    const pres = getPresentation(offer);
                                    const isSelected = selectedIds.has(offer.id);
                                    const isCritical = offer.status === 'active' && offer.stock <= 5;
                                    return (
                                        <tr
                                            key={offer.id}
                                            className={cn(
                                                'border-b border-neutral-100 last:border-0 transition-colors',
                                                isSelected
                                                    ? 'bg-primary-50/40'
                                                    : isCritical
                                                    ? 'bg-danger-bg/40'
                                                    : 'hover:bg-neutral-50'
                                            )}
                                        >
                                            <td className="p-3 align-middle">
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => toggleSelect(offer.id)}
                                                    className="w-4 h-4 accent-primary-700 cursor-pointer"
                                                    aria-label="İlanı seç"
                                                />
                                            </td>
                                            <td className="p-3 align-middle">
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <div className="w-10 h-10 rounded-sm bg-neutral-50 border border-neutral-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                                                        {offer.product?.image_url || offer.product?.image ? (
                                                            <Image
                                                                src={(offer.product.image_url || offer.product.image) as string}
                                                                alt={offer.product.name}
                                                                width={40}
                                                                height={40}
                                                                className="object-contain"
                                                            />
                                                        ) : (
                                                            <Package className="w-4 h-4 text-neutral-300" />
                                                        )}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="font-semibold text-neutral-900 truncate">
                                                            {offer.product?.name ?? '—'}
                                                        </p>
                                                        <p className="font-mono text-[11px] text-neutral-600 tabular-num">
                                                            SKU: {offer.product?.barcode ?? '—'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-3 text-right align-middle font-semibold text-neutral-900 tabular-num">
                                                {formatPrice(offer.price)}
                                            </td>
                                            <td
                                                className={cn(
                                                    'p-3 text-right align-middle tabular-num font-semibold',
                                                    isCritical
                                                        ? 'text-danger'
                                                        : offer.stock <= 20
                                                        ? 'text-warning'
                                                        : 'text-success'
                                                )}
                                            >
                                                {offer.stock}
                                            </td>
                                            <td className="p-3 text-center align-middle">
                                                <span
                                                    className={cn(
                                                        'inline-flex items-center px-2.5 py-1 rounded-sm text-[11px] font-bold tracking-wide',
                                                        pres.className
                                                    )}
                                                >
                                                    {pres.label}
                                                </span>
                                            </td>
                                            <td className="p-3 text-right align-middle relative">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setActionMenuId(actionMenuId === offer.id ? null : offer.id)
                                                    }
                                                    className="w-8 h-8 rounded-sm text-neutral-600 hover:bg-neutral-100 inline-flex items-center justify-center transition-colors"
                                                    aria-label="Aksiyonlar"
                                                >
                                                    <MoreHorizontal className="w-4 h-4" />
                                                </button>
                                                {actionMenuId === offer.id && (
                                                    <>
                                                        <div
                                                            className="fixed inset-0 z-40"
                                                            onClick={() => setActionMenuId(null)}
                                                        />
                                                        <div className="absolute right-3 top-10 z-50 bg-white border border-neutral-200 rounded-sm shadow-md py-1 min-w-[180px]">
                                                            <button
                                                                type="button"
                                                                onClick={() => handleEditOffer(offer)}
                                                                className="w-full px-3 py-2 text-left text-sm text-neutral-800 hover:bg-neutral-50 flex items-center gap-2"
                                                            >
                                                                <Edit className="w-4 h-4" />
                                                                Düzenle
                                                            </button>
                                                            {(offer.status === 'active' || offer.status === 'inactive') && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleToggleStatus(offer.id)}
                                                                    className="w-full px-3 py-2 text-left text-sm text-neutral-800 hover:bg-neutral-50 flex items-center gap-2"
                                                                >
                                                                    {offer.status === 'active' ? (
                                                                        <>
                                                                            <XCircle className="w-4 h-4" />
                                                                            Pasife Al
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <CheckCircle2 className="w-4 h-4" />
                                                                            Aktife Al
                                                                        </>
                                                                    )}
                                                                </button>
                                                            )}
                                                            <Link
                                                                href={`/market/product/${offer.product_id}`}
                                                                className="w-full px-3 py-2 text-left text-sm text-neutral-800 hover:bg-neutral-50 flex items-center gap-2"
                                                            >
                                                                <Box className="w-4 h-4" />
                                                                Ürünü Gör
                                                            </Link>
                                                            <div className="border-t border-neutral-100 my-1" />
                                                            <button
                                                                type="button"
                                                                onClick={() => handleDelete(offer.id)}
                                                                className="w-full px-3 py-2 text-left text-sm text-danger hover:bg-danger-bg flex items-center gap-2"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                                Sil
                                                            </button>
                                                        </div>
                                                    </>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* ===== Create / Edit Dialog ===== */}
            <Dialog
                open={isDialogOpen}
                onOpenChange={(open) => {
                    setIsDialogOpen(open);
                    if (!open) resetForm();
                }}
            >
                <DialogContent className="sm:max-w-[540px] max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden rounded-sm border-neutral-200">
                    <div className="px-5 pt-5 pb-3 border-b border-neutral-200 bg-white flex-shrink-0">
                        <DialogHeader>
                            <DialogTitle className="text-lg font-black text-neutral-900 flex items-center gap-2">
                                {editingOffer ? (
                                    <>
                                        <Edit className="w-4 h-4 text-primary-700" />
                                        İlanı Düzenle
                                    </>
                                ) : (
                                    <>
                                        <Plus className="w-4 h-4 text-primary-700" />
                                        Yeni İlan Oluştur
                                    </>
                                )}
                            </DialogTitle>
                            <DialogDescription className="text-xs text-neutral-600">
                                {editingOffer
                                    ? 'Fiyat, stok ve diğer bilgileri güncelleyin.'
                                    : 'Ürün seçin, fiyat ve stok bilgilerini girin.'}
                            </DialogDescription>
                        </DialogHeader>
                    </div>

                    <div className="px-5 py-4 overflow-y-auto flex-1 space-y-4">
                        {!selectedProduct ? (
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-neutral-900 flex items-center gap-1.5">
                                    <Search className="w-3.5 h-3.5" /> Ürün Ara
                                </Label>
                                <div className="relative">
                                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                                    <Input
                                        placeholder="Ürün adı veya barkod ile arayın..."
                                        value={searchQuery}
                                        onChange={(e) => handleProductSearch(e.target.value)}
                                        className="pl-9 h-10 bg-primary-50 border-primary-100 rounded-sm focus:bg-white focus:border-primary-500"
                                        autoFocus
                                    />
                                    {isSearching && (
                                        <Loader2 className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-primary-700" />
                                    )}
                                </div>
                                {searchResults.length > 0 && (
                                    <div className="border border-neutral-200 rounded-sm overflow-hidden">
                                        <div className="max-h-[260px] overflow-y-auto">
                                            {searchResults.map((product, idx) => (
                                                <button
                                                    key={product.id}
                                                    type="button"
                                                    onClick={() => {
                                                        setSelectedProduct(product);
                                                        setSearchQuery('');
                                                        setSearchResults([]);
                                                    }}
                                                    className={cn(
                                                        'w-full p-2.5 text-left hover:bg-neutral-50 flex items-center gap-3 transition-colors',
                                                        idx !== searchResults.length - 1 && 'border-b border-neutral-100'
                                                    )}
                                                >
                                                    <div className="w-10 h-10 bg-neutral-50 rounded-sm flex items-center justify-center flex-shrink-0 border border-neutral-100 overflow-hidden">
                                                        {product.image_url || product.image ? (
                                                            <Image
                                                                src={(product.image_url || product.image) as string}
                                                                alt=""
                                                                width={40}
                                                                height={40}
                                                                className="object-contain"
                                                            />
                                                        ) : (
                                                            <Package className="w-4 h-4 text-neutral-400" />
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-semibold text-sm text-neutral-900 truncate">
                                                            {product.name}
                                                        </p>
                                                        <div className="flex items-center gap-2 mt-0.5">
                                                            <span className="text-[11px] text-neutral-600 font-mono tabular-num">
                                                                {product.barcode}
                                                            </span>
                                                            {product.brand && (
                                                                <span className="text-[10px] text-primary-700 uppercase font-bold">
                                                                    {product.brand}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="text-right flex-shrink-0">
                                                        {product.lowest_price ? (
                                                            <>
                                                                <p className="text-xs font-bold text-primary-700 tabular-num">
                                                                    {formatPrice(product.lowest_price)}
                                                                </p>
                                                                <p className="text-[10px] text-neutral-600 tabular-num">
                                                                    {product.offers_count || 0} ilan
                                                                </p>
                                                            </>
                                                        ) : (
                                                            <span className="text-[10px] bg-warning-bg text-warning px-1.5 py-0.5 rounded-sm font-medium">
                                                                İlan Yok
                                                            </span>
                                                        )}
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {searchQuery.length >= 2 && !isSearching && searchResults.length === 0 && (
                                    <div className="text-center py-6 text-neutral-500 text-sm">
                                        <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                        <p>Ürün bulunamadı</p>
                                    </div>
                                )}
                                {searchQuery.length < 2 && (
                                    <div className="text-center py-8 text-neutral-500">
                                        <Search className="w-10 h-10 mx-auto mb-2 opacity-30" />
                                        <p className="text-sm">İlan oluşturmak için ürün arayın</p>
                                        <p className="text-[11px] mt-1">En az 2 karakter girin</p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <>
                                {/* Selected product summary */}
                                <div className="rounded-sm border border-neutral-200 bg-neutral-50 overflow-hidden">
                                    <div className="p-3 flex items-center gap-3">
                                        <div className="w-12 h-12 bg-white rounded-sm border border-neutral-100 flex items-center justify-center overflow-hidden">
                                            {selectedProduct.image_url || selectedProduct.image ? (
                                                <Image
                                                    src={(selectedProduct.image_url || selectedProduct.image) as string}
                                                    alt=""
                                                    width={48}
                                                    height={48}
                                                    className="object-contain"
                                                />
                                            ) : (
                                                <Package className="w-5 h-5 text-neutral-400" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-sm text-neutral-900 truncate">
                                                {selectedProduct.name}
                                            </p>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span className="text-[11px] text-neutral-600 font-mono tabular-num">
                                                    {selectedProduct.barcode}
                                                </span>
                                                {selectedProduct.brand && (
                                                    <span className="text-[10px] text-primary-700 uppercase font-bold">
                                                        {selectedProduct.brand}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        {!editingOffer && (
                                            <button
                                                type="button"
                                                onClick={() => setSelectedProduct(null)}
                                                className="p-1.5 rounded-sm hover:bg-white text-neutral-600 hover:text-neutral-900 transition-colors"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                    {selectedProduct.lowest_price != null && selectedProduct.lowest_price > 0 && (
                                        <div className="px-3 py-2 border-t border-neutral-100 bg-white flex items-center gap-2">
                                            <TrendingDown className="w-3.5 h-3.5 text-primary-700 flex-shrink-0" />
                                            <p className="text-xs text-neutral-600">
                                                En düşük fiyat:{' '}
                                                <span className="font-bold text-primary-700 tabular-num">
                                                    {formatPrice(selectedProduct.lowest_price)}
                                                </span>
                                                <span className="text-neutral-600 ml-1 tabular-num">
                                                    ({selectedProduct.offers_count || 0} aktif ilan)
                                                </span>
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-3">
                                    <Label className="text-sm font-medium text-neutral-900 flex items-center gap-1.5">
                                        <Tag className="w-3.5 h-3.5" /> Fiyat ve Stok
                                    </Label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1">
                                            <Label htmlFor="price" className="text-[11px] text-neutral-600">
                                                PSF Fiyat *
                                            </Label>
                                            <div className="relative">
                                                <Input
                                                    id="price"
                                                    type="number"
                                                    step="0.01"
                                                    min="0.01"
                                                    placeholder="0.00"
                                                    value={formData.price}
                                                    onChange={(e) =>
                                                        setFormData({ ...formData, price: e.target.value })
                                                    }
                                                    className="h-10 pr-9 border-neutral-200 rounded-sm focus:border-primary-500 tabular-num"
                                                />
                                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-neutral-600 font-medium">
                                                    TL
                                                </span>
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <Label htmlFor="stock" className="text-[11px] text-neutral-600">
                                                Stok Adedi *
                                            </Label>
                                            <div className="relative">
                                                <Input
                                                    id="stock"
                                                    type="number"
                                                    min="1"
                                                    placeholder="0"
                                                    value={formData.stock}
                                                    onChange={(e) =>
                                                        setFormData({ ...formData, stock: e.target.value })
                                                    }
                                                    className="h-10 pr-12 border-neutral-200 rounded-sm focus:border-primary-500 tabular-num"
                                                />
                                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-neutral-600 font-medium">
                                                    adet
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <Label className="text-sm font-medium text-neutral-900 flex items-center gap-1.5">
                                        <BarChart3 className="w-3.5 h-3.5" /> Ek Bilgiler
                                    </Label>
                                    <div className="space-y-1">
                                        <Label htmlFor="batch_number" className="text-[11px] text-neutral-600 flex items-center gap-1">
                                            <Hash className="w-3 h-3" /> Parti / Seri No (opsiyonel)
                                        </Label>
                                        <Input
                                            id="batch_number"
                                            placeholder="Örn: B2026-001"
                                            value={formData.batch_number}
                                            onChange={(e) =>
                                                setFormData({ ...formData, batch_number: e.target.value })
                                            }
                                            className="h-10 border-neutral-200 rounded-sm focus:border-primary-500"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label htmlFor="notes" className="text-[11px] text-neutral-600 flex items-center gap-1">
                                            <FileText className="w-3 h-3" /> Not (opsiyonel)
                                        </Label>
                                        <Input
                                            id="notes"
                                            placeholder="Alıcılar için not..."
                                            value={formData.notes}
                                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                            className="h-10 border-neutral-200 rounded-sm focus:border-primary-500"
                                        />
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    <div className="px-5 py-3 border-t border-neutral-200 bg-neutral-50 flex items-center justify-end gap-2 flex-shrink-0">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsDialogOpen(false)}
                            className="border-neutral-200 hover:bg-white rounded-sm"
                        >
                            İptal
                        </Button>
                        <Button
                            size="sm"
                            onClick={handleSubmit}
                            disabled={
                                !selectedProduct || isSubmitting || !formData.price || !formData.stock
                            }
                            className="bg-primary-900 hover:bg-primary-700 text-white rounded-sm font-semibold min-w-[120px]"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    {editingOffer ? 'Kaydediliyor...' : 'Oluşturuluyor...'}
                                </>
                            ) : editingOffer ? (
                                'Değişiklikleri Kaydet'
                            ) : (
                                'İlan Oluştur'
                            )}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* ===== Bulk Price Dialog ===== */}
            <Dialog open={bulkPriceOpen} onOpenChange={setBulkPriceOpen}>
                <DialogContent className="sm:max-w-[440px] rounded-sm border-neutral-200">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-black text-neutral-900 flex items-center gap-2">
                            <Tag className="w-4 h-4 text-primary-700" />
                            Toplu Fiyat Güncelleme
                        </DialogTitle>
                        <DialogDescription className="text-xs text-neutral-600">
                            Seçili <span className="font-bold text-neutral-900 tabular-num">{selectedCount}</span> ilan için fiyatı güncelleyin.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 pt-2">
                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-neutral-900">Yöntem</Label>
                            <div className="grid grid-cols-3 gap-2">
                                {[
                                    { value: 'percent_up', label: '+ %', desc: 'Zam' },
                                    { value: 'percent_down', label: '− %', desc: 'İndirim' },
                                    { value: 'fixed', label: 'Sabit', desc: 'Tüm ilanlara' },
                                ].map((opt) => (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        onClick={() => setBulkPriceMode(opt.value as typeof bulkPriceMode)}
                                        className={cn(
                                            'px-3 py-2 rounded-sm text-xs font-semibold border transition-colors',
                                            bulkPriceMode === opt.value
                                                ? 'border-primary-700 bg-primary-50 text-primary-700'
                                                : 'border-neutral-200 text-neutral-800 hover:bg-neutral-50'
                                        )}
                                    >
                                        <div className="font-bold">{opt.label}</div>
                                        <div className="text-[10px] text-neutral-600">{opt.desc}</div>
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-1">
                            <Label className="text-sm font-medium text-neutral-900">
                                {bulkPriceMode === 'fixed' ? 'Yeni fiyat (₺)' : 'Oran (%)'}
                            </Label>
                            <Input
                                type="number"
                                step="0.01"
                                min="0"
                                value={bulkPriceValue}
                                onChange={(e) => setBulkPriceValue(e.target.value)}
                                placeholder={bulkPriceMode === 'fixed' ? '0.00' : '10'}
                                className="h-10 border-neutral-200 rounded-sm focus:border-primary-500 tabular-num"
                            />
                        </div>
                        <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setBulkPriceOpen(false)}
                                className="border-neutral-200 rounded-sm"
                            >
                                İptal
                            </Button>
                            <Button
                                size="sm"
                                onClick={applyBulkPrice}
                                disabled={bulkSubmitting || !bulkPriceValue}
                                className="bg-primary-900 hover:bg-primary-700 text-white rounded-sm min-w-[120px]"
                            >
                                {bulkSubmitting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Uygulanıyor...
                                    </>
                                ) : (
                                    'Fiyatları Güncelle'
                                )}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* ===== Bulk Stock Dialog ===== */}
            <Dialog open={bulkStockOpen} onOpenChange={setBulkStockOpen}>
                <DialogContent className="sm:max-w-[440px] rounded-sm border-neutral-200">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-black text-neutral-900 flex items-center gap-2">
                            <Package className="w-4 h-4 text-primary-700" />
                            Toplu Stok Güncelleme
                        </DialogTitle>
                        <DialogDescription className="text-xs text-neutral-600">
                            Seçili <span className="font-bold text-neutral-900 tabular-num">{selectedCount}</span> ilanın stoğunu güncelleyin.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 pt-2">
                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-neutral-900">Yöntem</Label>
                            <div className="grid grid-cols-3 gap-2">
                                {[
                                    { value: 'set', label: 'Ayarla', desc: 'Sabit değer' },
                                    { value: 'add', label: '+ Ekle', desc: 'Mevcut + X' },
                                    { value: 'subtract', label: '− Çıkar', desc: 'Mevcut − X' },
                                ].map((opt) => (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        onClick={() => setBulkStockMode(opt.value as typeof bulkStockMode)}
                                        className={cn(
                                            'px-3 py-2 rounded-sm text-xs font-semibold border transition-colors',
                                            bulkStockMode === opt.value
                                                ? 'border-primary-700 bg-primary-50 text-primary-700'
                                                : 'border-neutral-200 text-neutral-800 hover:bg-neutral-50'
                                        )}
                                    >
                                        <div className="font-bold">{opt.label}</div>
                                        <div className="text-[10px] text-neutral-600">{opt.desc}</div>
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-1">
                            <Label className="text-sm font-medium text-neutral-900">Adet</Label>
                            <Input
                                type="number"
                                min="0"
                                value={bulkStockValue}
                                onChange={(e) => setBulkStockValue(e.target.value)}
                                placeholder="0"
                                className="h-10 border-neutral-200 rounded-sm focus:border-primary-500 tabular-num"
                            />
                        </div>
                        <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setBulkStockOpen(false)}
                                className="border-neutral-200 rounded-sm"
                            >
                                İptal
                            </Button>
                            <Button
                                size="sm"
                                onClick={applyBulkStock}
                                disabled={bulkSubmitting || !bulkStockValue}
                                className="bg-primary-900 hover:bg-primary-700 text-white rounded-sm min-w-[120px]"
                            >
                                {bulkSubmitting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Uygulanıyor...
                                    </>
                                ) : (
                                    'Stoğu Güncelle'
                                )}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
