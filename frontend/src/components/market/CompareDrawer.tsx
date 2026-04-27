'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Scale, X, Trash2, Package } from 'lucide-react';
import { useCompareStore, MAX_COMPARE_ITEMS } from '@/stores/useCompareStore';
import { cn } from '@/lib/utils';

const toNumber = (value?: number | string | null) => {
  if (value === undefined || value === null || value === '') return null;
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  const normalized = value.replace(/\./g, '').replace(',', '.');
  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : null;
};

const formatPrice = (price?: number | string | null) => {
  if (price === undefined || price === null) return '---';
  const n = toNumber(price);
  if (n === null) return '---';
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 2,
  }).format(n);
};

const ProductThumb = ({ src, alt }: { src?: string; alt: string }) => {
  const [failed, setFailed] = React.useState(false);

  if (!src || failed) {
    return (
      <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-md border border-neutral-200 bg-neutral-50">
        <Package className="h-8 w-8 text-neutral-300" strokeWidth={1.5} />
      </div>
    );
  }

  return (
    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md border border-neutral-200 bg-white">
      <Image
        src={src}
        alt={alt}
        fill
        sizes="80px"
        className="object-contain p-2"
        onError={() => setFailed(true)}
      />
    </div>
  );
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
        className="fixed bottom-6 right-6 z-[60] bg-primary-700 hover:bg-primary-900 text-white h-12 pl-4 pr-5 rounded-full shadow-lg flex items-center gap-2.5 font-semibold transition-colors"
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
          'fixed inset-x-0 bottom-0 z-[70] bg-white border-t-2 border-primary-700 shadow-2xl transition-transform duration-200',
          open ? 'translate-y-0' : 'translate-y-full'
        )}
        role="dialog"
        aria-label="Ürün karşılaştırma"
      >
        <div className="mx-auto max-h-[82vh] max-w-[1400px] overflow-y-auto px-4 py-4 sm:px-7">
          {/* Header */}
          <div className="mb-4 flex items-center justify-between gap-4">
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
          <div className="overflow-x-auto rounded-md border border-neutral-200 bg-white">
            <div
              className="grid min-w-[680px]"
              style={{
                gridTemplateColumns: `minmax(132px, 160px) repeat(${items.length}, minmax(220px, 1fr))`,
              }}
            >
              <div className="border-b border-r border-neutral-200 bg-neutral-50 p-4 text-xs font-bold uppercase text-neutral-600">
                Ürün
              </div>

              {items.map((item) => (
                <div key={item.id} className="relative border-b border-r border-neutral-200 p-4 last:border-r-0">
                  <button
                    type="button"
                    onClick={() => remove(item.id)}
                    aria-label={`${item.name} kaldır`}
                    className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-sm border border-neutral-200 bg-white text-neutral-600 transition-colors hover:border-danger hover:bg-danger-bg hover:text-danger"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>

                  <div className="flex gap-3 pr-8">
                    <ProductThumb src={item.image_url || item.image} alt={item.name} />
                    <div className="min-w-0 flex-1">
                      {item.brand && (
                        <p className="mb-1 truncate font-mono text-[10px] font-bold uppercase text-primary-700">
                          {item.brand}
                        </p>
                      )}
                      <p className="line-clamp-2 text-sm font-bold leading-snug text-neutral-900">
                        {item.name}
                      </p>
                      <p className="mt-2 text-[11px] font-semibold uppercase text-neutral-500">
                        Bayi (+KDV)
                      </p>
                      <p className="text-xl font-black leading-tight text-primary-900 tabular-num">
                        {formatPrice(item.lowest_price)}
                      </p>
                    </div>
                  </div>

                  <Link
                    href={`/market/product/${item.id}`}
                    className="mt-3 inline-flex h-9 w-full items-center justify-center gap-2 rounded-sm bg-primary-700 px-3 text-xs font-bold text-white transition-colors hover:bg-primary-900"
                  >
                    Detayı Gör
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              ))}

              {[
                {
                  label: 'Marka',
                  value: (item: (typeof items)[number]) => item.brand || '---',
                },
                {
                  label: 'SKU / Barkod',
                  value: (item: (typeof items)[number]) => item.sku || item.barcode || '---',
                  mono: true,
                },
                {
                  label: 'Bayi fiyatı',
                  value: (item: (typeof items)[number]) => formatPrice(item.lowest_price),
                  strong: true,
                },
                {
                  label: 'PSF / Liste',
                  value: (item: (typeof items)[number]) => formatPrice(item.psf),
                },
                {
                  label: 'Fiyat avantajı',
                  value: (item: (typeof items)[number]) => {
                    const list = toNumber(item.psf);
                    const dealer = toNumber(item.lowest_price);
                    if (!list || !dealer || dealer >= list) return '---';
                    return `%${Math.round(((list - dealer) / list) * 100)}`;
                  },
                  strong: true,
                },
              ].map((row) => (
                <React.Fragment key={row.label}>
                  <div className="border-r border-t border-neutral-200 bg-neutral-50 px-4 py-3 text-xs font-bold text-neutral-700">
                    {row.label}
                  </div>
                  {items.map((item) => (
                    <div
                      key={`${row.label}-${item.id}`}
                      className={cn(
                        'border-r border-t border-neutral-200 px-4 py-3 text-sm text-neutral-800 last:border-r-0',
                        row.mono && 'font-mono text-xs tabular-num',
                        row.strong && 'font-black text-primary-900 tabular-num'
                      )}
                    >
                      {row.value(item)}
                    </div>
                  ))}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
