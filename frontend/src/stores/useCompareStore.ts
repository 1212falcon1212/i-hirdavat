import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// CLAUDE.md §5 — Karşılaştırma drawer, max 4 ürün, persist
export interface CompareProduct {
  id: number;
  name: string;
  brand?: string;
  image_url?: string;
  image?: string;
  sku?: string;
  barcode?: string;
  lowest_price?: number;
  psf?: number | string | null;
}

interface CompareState {
  items: CompareProduct[];
  open: boolean;
  add: (product: CompareProduct) => void;
  remove: (id: number) => void;
  clear: () => void;
  toggle: (product: CompareProduct) => void;
  has: (id: number) => boolean;
  setOpen: (open: boolean) => void;
}

const MAX_COMPARE = 4;

export const useCompareStore = create<CompareState>()(
  persist(
    (set, get) => ({
      items: [],
      open: false,
      add: (product) => {
        const items = get().items;
        if (items.some((p) => p.id === product.id)) return;
        if (items.length >= MAX_COMPARE) return;
        set({ items: [...items, product] });
      },
      remove: (id) => set({ items: get().items.filter((p) => p.id !== id) }),
      clear: () => set({ items: [] }),
      toggle: (product) => {
        const { items, add, remove } = get();
        if (items.some((p) => p.id === product.id)) {
          remove(product.id);
        } else {
          add(product);
        }
      },
      has: (id) => get().items.some((p) => p.id === id),
      setOpen: (open) => set({ open }),
    }),
    { name: 'compare-store' }
  )
);

export const MAX_COMPARE_ITEMS = MAX_COMPARE;
