import type { Category } from "@/lib/api";

export interface ProductSpec {
  label: string;
  value: string;
  sort_order: number;
}

export interface ProductImage {
  url: string;
  is_primary: boolean;
  sort_order: number;
}

export interface ProductBrandInfo {
  id: number;
  name: string;
  slug: string;
  logo_url?: string | null;
}

export interface MarketplaceProduct {
  id: number;
  barcode: string;
  sku?: string | null;
  slug?: string | null;
  name: string;
  brand?: string | null;
  manufacturer?: string | null;
  description?: string | null;
  image?: string | null;
  image_url?: string | null;
  category?: Category | { id: number; name: string; slug: string } | null;
  psf?: number | string | null;
  lowest_price?: number | string | null;
  highest_price?: number | string | null;
  offers_count?: number;
  specs?: ProductSpec[];
  images?: ProductImage[];
  brand_info?: ProductBrandInfo | null;
  /** Backend opsiyonel rozetleri — yoksa render edilmez. */
  is_bestseller?: boolean | null;
  is_new?: boolean | null;
  average_rating?: number | string | null;
  review_count?: number | null;
}

export interface ProductRailItem {
  id: number;
  name: string;
  barcode?: string;
  brand?: string | null;
  image?: string | null;
  image_url?: string | null;
  category?: string | null;
  category_slug?: string | null;
  psf?: number | string | null;
  lowest_price?: number | string | null;
  offers_count?: number;
}
