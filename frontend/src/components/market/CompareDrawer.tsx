'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Scale, X, Trash2, Package } from 'lucide-react';
import { useCompareStore, MAX_COMPARE_ITEMS } from '@/stores/useCompareStore';
import { cn } from '@/lib/utils';

const formatPrice = (price?: number) => {
  if (price === undefined || price === null) return '---';
  const n = typeof price === 'number' ? price : parseFloat(price as unknown as string);
  if (!Number.isFinite(n)) return '---';
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 2,
  }).format(n);
};

export function CompareDrawer() {
  const items = useCompareStore((s) => s.items);
  const open = useCompareStore((s) => s.open);
  const setOpen = useCompareStore((s) => s.setOpen);
  const remove = useCompareStore((s) => s.remove);
  const clear = useCompareStore((s) => s.clear);

  if (items.length === 0) return null;

  return (
    <>
      {/* Floating toggle pill (bottom-right) */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-40 bg-primary-700 hover:bg-primary-900 text-white h-12 pl-4 pr-5 rounded-full shadow-lg flex items-center gap-2.5 font-semibold transition-colors"
        aria-label="Karşılaştırmayı aç"
      >
        <Scale className="w-5 h-5" />
        <span>Karşılaştır</span>
        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-accent-500 text-primary-900 text-xs font-bold tabular-num">
          {items.length}
        </span>
      </button>

      {/* Drawer panel */}
      <div
        className={cn(
          'fixed inset-x-0 bottom-0 z-50 bg-white border-t-2 border-primary-700 shadow-lg transition-transform duration-200',
          open ? 'translate-y-0' : 'translate-y-full'
        )}
        role="dialog"
        aria-label="Ürün karşılaştırma"
      >
        <div className="max-w-[1400px] mx-auto px-4 sm:px-7 py-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <Scale className="w-5 h-5 text-primary-700" />
              <h3 className="text-lg font-bold text-neutral-900">
                Karşılaştırma{' '}
                <span className="text-sm font-medium text-neutral-600 tabular-num">
                  ({items.length}/{MAX_COMPARE_ITEMS})
                </span>
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={clear}
                className="inline-flex items-center gap-1.5 px-3 h-9 rounded-md text-sm font-semibold text-danger hover:bg-danger-bg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Temizle
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Kapat"
                className="inline-flex items-center justify-center w-9 h-9 rounded-md text-neutral-600 hover:bg-neutral-50 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Comparison table */}
          <div className="overflow-x-auto">
            <div className="grid gap-3 min-w-max" style={{ gridTemplateColumns: `repeat(${items.length}, minmax(220px, 1fr))` }}>
              {items.map((item) => {
                const sku = item.sku ?? item.barcode;
                return (
                  <div
                    key={item.id}
                    className="relative border border-neutral-200 rounded-md p-3 flex flex-col gap-2"
                  >
                    <button
                      type="button"
                      onClick={() => remove(item.id)}
                      aria-label={`${item.name} kaldır`}
                      className="absolute top-2 right-2 w-7 h-7 rounded-sm bg-white border border-neutral-200 hover:bg-danger-bg hover:text-danger hover:border-danger text-neutral-600 flex items-center justify-center transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>

                    <div className="relative aspect-square bg-neutral-50 rounded-sm flex items-center justify-center overflow-hidden">
                      {item.image_url || item.image ? (
                        <Image
                          src={item.image_url || item.image || ''}
                          alt={item.name}
                          fill
                          sizes="200px"
                          className="object-contain p-2"
                        />
                      ) : (
                        <Package className="w-10 h-10 text-neutral-200" strokeWidth={1.5} />
                      )}
                    </div>

                    {item.brand && (
                      <p className="font-mono text-[10px] font-bold text-primary-700 uppercase tracking-[0.5px] truncate">
                        {item.brand}
                      </p>
                    )}

                    <p className="text-sm font-semibold text-neutral-900 line-clamp-2 leading-snug">
                      {item.name}
                    </p>

                    {sku && (
                      <p className="font-mono text-[10px] text-neutral-600 tabular-num truncate">
                        SKU: {sku}
                      </p>
                    )}

                    <div className="mt-auto pt-2 border-t border-neutral-100">
                      <p className="text-[9px] font-semibold text-neutral-600 uppercase tracking-wide">
                        Bayi (+KDV)
                      </p>
                      <p className="text-lg font-black text-primary-900 tabular-num leading-tight">
                        {formatPrice(item.lowest_price)}
                      </p>
                    </div>

                    <Link
                      href={`/market/product/${item.id}`}
                      className="text-center text-xs font-bold px-2 h-8 rounded-sm bg-primary-700 text-white hover:bg-primary-900 transition-colors flex items-center justify-center"
                    >
                      Detayı Gör
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
