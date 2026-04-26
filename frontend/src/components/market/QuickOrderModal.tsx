'use client';

import React, { useState } from 'react';
import { X, Zap, Loader2, Check, AlertTriangle, FileSpreadsheet } from 'lucide-react';
import { productsApi, cartApi, type Product, type Offer } from '@/lib/api';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface QuickOrderModalProps {
  open: boolean;
  onClose: () => void;
}

interface ParsedLine {
  rawSku: string;
  qty: number;
  line: number;
}

interface LineResult {
  rawSku: string;
  qty: number;
  status: 'pending' | 'resolving' | 'added' | 'not_found' | 'no_offer' | 'error';
  product?: Pick<Product, 'id' | 'name' | 'barcode' | 'brand'>;
  message?: string;
}

function parseInput(raw: string): ParsedLine[] {
  return raw
    .split('\n')
    .map((line, idx) => ({ text: line.trim(), line: idx + 1 }))
    .filter((item) => item.text.length > 0)
    .map(({ text, line }) => {
      // Split on tab or 2+ spaces; fallback to last whitespace-separated token as qty
      const parts = text.split(/\t|\s{2,}/).filter(Boolean);
      if (parts.length >= 2) {
        const sku = parts[0].trim();
        const qty = parseInt(parts[parts.length - 1], 10);
        return { rawSku: sku, qty: Number.isFinite(qty) && qty > 0 ? qty : 1, line };
      }
      const singleSplit = text.split(/\s+/);
      if (singleSplit.length >= 2) {
        const last = singleSplit[singleSplit.length - 1];
        const maybeQty = parseInt(last, 10);
        if (Number.isFinite(maybeQty) && maybeQty > 0) {
          return {
            rawSku: singleSplit.slice(0, -1).join(' ').trim(),
            qty: maybeQty,
            line,
          };
        }
      }
      return { rawSku: text, qty: 1, line };
    });
}

export function QuickOrderModal({ open, onClose }: QuickOrderModalProps) {
  const [input, setInput] = useState('');
  const [results, setResults] = useState<LineResult[]>([]);
  const [processing, setProcessing] = useState(false);

  if (!open) return null;

  const handleProcess = async () => {
    const lines = parseInput(input);
    if (lines.length === 0) {
      toast.error('En az bir SKU + adet girmelisiniz.');
      return;
    }

    setProcessing(true);
    const working: LineResult[] = lines.map((l) => ({
      rawSku: l.rawSku,
      qty: l.qty,
      status: 'pending',
    }));
    setResults(working);

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      working[i] = { ...working[i], status: 'resolving' };
      setResults([...working]);

      try {
        const search = await productsApi.search(line.rawSku, 1);
        const products = search.data?.products || [];
        const match = products.find(
          (p: Product) =>
            p.barcode?.toLowerCase() === line.rawSku.toLowerCase() ||
            p.barcode?.toLowerCase().startsWith(line.rawSku.toLowerCase())
        ) || products[0];

        if (!match) {
          working[i] = {
            ...working[i],
            status: 'not_found',
            message: 'Ürün bulunamadı',
          };
          setResults([...working]);
          continue;
        }

        const offersRes = await productsApi.getOffers(match.id);
        const offers: Offer[] = offersRes.data?.offers || [];
        const activeOffer = offers
          .filter((o) => o.status === 'active' && o.stock >= line.qty)
          .sort((a, b) => a.price - b.price)[0];

        if (!activeOffer) {
          working[i] = {
            ...working[i],
            status: 'no_offer',
            product: match,
            message: 'Yeterli stoklu teklif yok',
          };
          setResults([...working]);
          continue;
        }

        await cartApi.addItem(activeOffer.id, line.qty);
        working[i] = {
          ...working[i],
          status: 'added',
          product: match,
        };
        setResults([...working]);
      } catch (err) {
        console.error('Quick order line failed:', err);
        working[i] = {
          ...working[i],
          status: 'error',
          message: 'Beklenmeyen hata',
        };
        setResults([...working]);
      }
    }

    setProcessing(false);
    const addedCount = working.filter((r) => r.status === 'added').length;
    if (addedCount > 0) {
      toast.success(`${addedCount} kalem sepete eklendi.`);
    }
    if (addedCount < lines.length) {
      toast.error(`${lines.length - addedCount} kalem eklenemedi — detayları kontrol edin.`);
    }
  };

  const handleExcelStub = () => {
    toast('Excel/CSV yükleme özelliği yakında aktif olacak.', {
      description: 'Dosyadan toplu içe aktarım için SKU + adet sütunu kullanacağız.',
    });
  };

  return (
    <div className="fixed inset-0 z-[60] bg-neutral-900/60 flex items-end sm:items-center justify-center p-0 sm:p-4" role="dialog" aria-modal="true">
      <div className="bg-white w-full sm:max-w-2xl max-h-[90vh] rounded-t-md sm:rounded-md shadow-lg flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-accent-500 rounded-sm flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary-900" strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-neutral-900">Hızlı Sipariş</h2>
              <p className="text-xs text-neutral-600">SKU / barkod listesini yapıştırın, toplu sepete ekleyin.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Kapat"
            className="w-9 h-9 rounded-md text-neutral-600 hover:bg-neutral-50 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-neutral-800 mb-1.5">
              SKU / Barkod Listesi
            </label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={processing}
              rows={8}
              placeholder={
                'BSH-GSB550-13-RE\t5\nM8X20-DIN933-Z\t100\nMKT-DHP485-18V\t2'
              }
              className="w-full font-mono text-[13px] tabular-num bg-primary-50 border border-primary-100 rounded-sm p-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
            />
            <p className="text-[11px] text-neutral-600 mt-1">
              Format: <span className="font-mono">SKU [tab veya boşluk] adet</span>, her ürün yeni satırda. Adet boş bırakılırsa 1 alınır.
            </p>
          </div>

          <button
            type="button"
            onClick={handleExcelStub}
            disabled={processing}
            className="inline-flex items-center gap-2 px-3 h-9 rounded-sm border border-neutral-200 text-sm font-semibold text-neutral-800 hover:bg-neutral-50 transition-colors disabled:opacity-50"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Excel / CSV'den İçe Aktar
          </button>

          {/* Results */}
          {results.length > 0 && (
            <div className="border border-neutral-200 rounded-sm overflow-hidden">
              <div className="bg-neutral-50 px-3 py-2 text-xs font-semibold text-neutral-800 flex items-center justify-between">
                <span>Sonuçlar ({results.length} satır)</span>
                <span className="tabular-num text-neutral-600">
                  ✓ {results.filter((r) => r.status === 'added').length} /
                  ✕ {results.filter((r) => ['not_found', 'no_offer', 'error'].includes(r.status)).length}
                </span>
              </div>
              <ul className="divide-y divide-neutral-100 max-h-60 overflow-y-auto">
                {results.map((r, idx) => {
                  const iconClass = 'w-4 h-4 flex-shrink-0';
                  const icon =
                    r.status === 'added' ? (
                      <Check className={cn(iconClass, 'text-success')} />
                    ) : r.status === 'resolving' || r.status === 'pending' ? (
                      <Loader2 className={cn(iconClass, 'text-neutral-400 animate-spin')} />
                    ) : (
                      <AlertTriangle className={cn(iconClass, 'text-danger')} />
                    );
                  return (
                    <li key={idx} className="px-3 py-2 flex items-center gap-2.5 text-xs">
                      {icon}
                      <span className="font-mono tabular-num text-neutral-800 truncate flex-1">
                        {r.rawSku}
                      </span>
                      <span className="font-mono tabular-num text-neutral-600">× {r.qty}</span>
                      <span
                        className={cn(
                          'text-[11px] font-semibold whitespace-nowrap',
                          r.status === 'added' && 'text-success',
                          (r.status === 'resolving' || r.status === 'pending') && 'text-neutral-600',
                          ['not_found', 'no_offer', 'error'].includes(r.status) && 'text-danger'
                        )}
                      >
                        {r.status === 'added' && 'Sepete eklendi'}
                        {r.status === 'resolving' && 'Aranıyor...'}
                        {r.status === 'pending' && 'Bekliyor'}
                        {r.status === 'not_found' && 'Bulunamadı'}
                        {r.status === 'no_offer' && 'Stok yok'}
                        {r.status === 'error' && 'Hata'}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-neutral-200 px-5 py-3 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={processing}
            className="px-4 h-10 rounded-sm text-sm font-semibold text-neutral-800 hover:bg-neutral-50 transition-colors disabled:opacity-50"
          >
            İptal
          </button>
          <button
            type="button"
            onClick={handleProcess}
            disabled={processing || input.trim().length === 0}
            className="inline-flex items-center gap-2 px-5 h-10 rounded-sm bg-accent-500 hover:bg-accent-400 text-primary-900 font-bold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {processing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                İşleniyor...
              </>
            ) : (
              <>
                Sepete Ekle
                <Zap className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
