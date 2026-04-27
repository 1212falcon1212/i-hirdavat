import type { MarketplaceProduct } from "./product";

export interface ListingSeller {
  id: number;
  seller_name?: string | null;
  pharmacy_name?: string | null;
  nickname?: string | null;
  city?: string | null;
  role?: "pharmacy" | "pharmacist" | "company" | string | null;
  seller_score?: number | null;
  seller_review_count?: number | null;
}

export interface ListingCampaign {
  id: number;
  name: string;
  type: string;
  discount_rate?: number | string | null;
  min_purchase_amount?: number | string | null;
  min_quantity?: number | null;
  starts_at?: string | null;
  ends_at?: string | null;
}

export interface ProductListing {
  id: number;
  product_id?: number;
  seller_id?: number;
  price: number;
  stock: number;
  expiry_date?: string | null;
  batch_number?: string | null;
  status?: "pending" | "active" | "inactive" | "sold_out" | "rejected" | string;
  seller?: ListingSeller;
  product?: MarketplaceProduct;
  campaigns?: ListingCampaign[];
}

export interface ProductListingsResponse {
  product: MarketplaceProduct;
  offers: ProductListing[];
  offers_count: number;
  lowest_price?: number | string | null;
  highest_price?: number | string | null;
}
