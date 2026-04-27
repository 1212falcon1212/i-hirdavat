"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { productsApi, wishlistApi } from "@/lib/api";
import type { ProductListing, ProductListingsResponse } from "@/types/listing";
import type { MarketplaceProduct, ProductImage } from "@/types/product";
import { useAuth } from "@/contexts/AuthContext";
import { useCartStore } from "@/stores/useCartStore";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductJsonLd } from "@/components/seo/ProductJsonLd";
import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";
import { ChromeIcon } from "@/components/chrome/Icon";

type SortKey = "price_asc" | "price_desc" | "stock_desc" | "seller_score";
type TabKey = "specs" | "description" | "reviews" | "qa";

function formatPrice(value: number | string | null | undefined) {
  return Number(value || 0).toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function sellerName(offer: ProductListing) {
  return offer.seller?.nickname || offer.seller?.seller_name || offer.seller?.pharmacy_name || "Bayi";
}

function productImages(product: MarketplaceProduct): ProductImage[] {
  const images = product.images?.length ? product.images : [];
  if (images.length) return images;
  const url = product.image_url || product.image;
  return url ? [{ url, is_primary: true, sort_order: 0 }] : [];
}

function StockBadge({ stock }: { stock: number }) {
  const low = stock > 0 && stock < 10;
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ${low ? "bg-[#FEF3E2] text-[#D97706]" : "bg-[#E8F6EE] text-[#16A34A]"}`}>
      {low ? "Az Kaldı" : "Stokta"} · {stock}
    </span>
  );
}

function Gallery({ product, onFavorite, isFavorite, busy }: { product: MarketplaceProduct; onFavorite: () => void; isFavorite: boolean; busy: boolean }) {
  const images = productImages(product);
  const [active, setActive] = useState(0);
  const current = images[active]?.url || product.image_url || product.image;

  return (
    <aside className="ih-card p-5 lg:sticky lg:top-[150px]">
      <div className="mb-3 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold leading-tight tracking-[-0.01em] text-[#0A1F44]">{product.name}</h1>
          {product.brand && <Link href={`/market/marka/${product.brand.toLowerCase().replace(/\s+/g, "-")}`} className="mt-1 inline-block text-sm font-semibold text-[#1F4ED8]">{product.brand}</Link>}
        </div>
        <button
          type="button"
          onClick={onFavorite}
          disabled={busy}
          className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-[#E6E8EE] ${isFavorite ? "bg-[#FEECEC] text-[#DC2626]" : "bg-white text-[#5B6679]"}`}
          aria-label="Favori"
        >
          <ChromeIcon name={isFavorite ? "heart-fill" : "heart"} size={18} className={isFavorite ? "fill-current" : undefined} />
        </button>
      </div>

      <div className="relative aspect-square overflow-hidden rounded-lg border border-[#EFF1F5] bg-white">
        {current ? (
          <Image src={current} alt={product.name} fill sizes="420px" className="object-contain p-6" />
        ) : (
          <div className="grid h-full place-items-center bg-[repeating-linear-gradient(45deg,#EEF1F5_0_8px,#F6F8FB_8px_16px)] text-xs font-mono text-[#7E8898]">product shot</div>
        )}
        {images.length > 1 && <span className="absolute bottom-3 right-3 rounded-md bg-[#0B1220]/70 px-2.5 py-1 text-[11px] font-semibold text-white">{active + 1} / {images.length}</span>}
      </div>

      {images.length > 1 && (
        <div className="mt-3 grid grid-cols-5 gap-2">
          {images.slice(0, 5).map((image, index) => (
            <button
              key={`${image.url}-${index}`}
              type="button"
              onClick={() => setActive(index)}
              className={`relative aspect-square overflow-hidden rounded-lg border bg-white ${active === index ? "border-2 border-[#1F4ED8]" : "border-[#E6E8EE]"}`}
            >
              <Image src={image.url} alt="" fill sizes="80px" className="object-contain p-2" />
            </button>
          ))}
        </div>
      )}

      {product.psf != null && Number(product.psf) > 0 && (
        <div className="mt-4 border-t border-[#EFF1F5] pt-4">
          <div className="flex items-baseline justify-between">
            <span className="text-[11px] font-bold uppercase tracking-[.06em] text-[#7E8898]">PSF (Piyasa Satış Fiyatı)</span>
            <strong className="ih-price text-2xl font-black">{formatPrice(product.psf)} <span className="text-sm font-semibold text-[#5B6679]">TL</span></strong>
          </div>
          <p className="mt-1 text-[11px] text-[#5B6679]">Bayi fiyatları için aşağıdaki ilanları inceleyin.</p>
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-3 text-[11px] text-[#5B6679]">
        <span className="inline-flex items-center gap-1"><ChromeIcon name="info" size={12} /> Hata Bildir</span>
        {product.sku && <span>SKU: {product.sku}</span>}
        {product.barcode && <span>Barkod: {product.barcode}</span>}
      </div>
    </aside>
  );
}

function ListingsTable({
  offers,
  quantities,
  adding,
  onQuantity,
  onAdd,
}: {
  offers: ProductListing[];
  quantities: Record<number, number>;
  adding: number | null;
  onQuantity: (offer: ProductListing, next: number) => void;
  onAdd: (offer: ProductListing) => void;
}) {
  return (
    <div className="ih-card overflow-hidden">
      <div className="grid grid-cols-[1.25fr_.75fr_.7fr_.8fr_.7fr_.9fr] gap-4 border-b border-[#E6E8EE] bg-[#FAFBFD] px-5 py-3 text-[11px] font-extrabold uppercase tracking-[.06em] text-[#5B6679] max-lg:hidden">
        <span>Bayi</span><span>Fiyat</span><span>Stok</span><span>Kargo</span><span>Vade</span><span className="text-right">Aksiyon</span>
      </div>
      {offers.length === 0 ? (
        <div className="grid place-items-center px-5 py-12 text-center">
          <ChromeIcon name="box" size={42} className="text-[#A9B1BD]" />
          <p className="mt-3 text-sm text-[#5B6679]">Bu ürün için aktif bayi ilanı bulunamadı.</p>
        </div>
      ) : offers.map((offer, index) => {
        const qty = quantities[offer.id] || 1;
        const score = Number(offer.seller?.seller_score || 0);
        return (
          <div key={offer.id} className={`grid gap-4 border-t border-[#EFF1F5] px-5 py-4 first:border-t-0 lg:grid-cols-[1.25fr_.75fr_.7fr_.8fr_.7fr_.9fr] lg:items-center ${index === 0 ? "bg-gradient-to-r from-[#FFFCEF] to-white" : "bg-white"}`}>
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-[#EEF1F5] text-sm font-black text-[#0A1F44]">{sellerName(offer).slice(0, 1)}</div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  {index === 0 && <span className="rounded-full bg-gradient-to-b from-[#FFD854] to-[#FFC72C] px-2 py-1 text-[10px] font-black text-[#0A1F44]">EN UYGUN</span>}
                  {offer.seller?.id ? <Link href={`/market/satici/${offer.seller.id}`} className="truncate text-sm font-extrabold text-[#0A1F44] hover:text-[#1F4ED8]">{sellerName(offer)}</Link> : <span className="truncate text-sm font-extrabold text-[#0A1F44]">{sellerName(offer)}</span>}
                </div>
                <div className="mt-1 flex items-center gap-2 text-xs text-[#5B6679]">
                  <span className="inline-flex items-center gap-1 text-[#F59E0B]"><ChromeIcon name="star" size={12} className="fill-current" /> {score ? score.toFixed(1) : "4.6"}</span>
                  <span>({offer.seller?.seller_review_count || 0})</span>
                  {offer.seller?.city && <span>· {offer.seller.city}</span>}
                </div>
              </div>
            </div>

            <div>
              <div className="ih-price text-xl font-black">{formatPrice(offer.price)} <span className="text-xs font-semibold text-[#5B6679]">TL</span></div>
              <div className="text-[10px] text-[#7E8898]">KDV Hariç</div>
            </div>
            <div><StockBadge stock={offer.stock} /></div>
            <div className="text-xs text-[#2A3447]"><strong className="block">Aynı gün</strong><span className="text-[#16A34A]">Ücretsiz kargo</span></div>
            <div className="text-xs text-[#2A3447]"><strong className="block">30/60 gün</strong><span className="text-[#5B6679]">Vadeli</span></div>
            <div className="flex items-center justify-end gap-2">
              <div className="inline-flex h-9 overflow-hidden rounded-md border border-[#E6E8EE] bg-white">
                <button type="button" onClick={() => onQuantity(offer, qty - 1)} className="grid w-8 place-items-center hover:bg-[#F6F7FA]"><ChromeIcon name="minus" size={14} /></button>
                <input value={qty} onChange={(event) => onQuantity(offer, Number(event.target.value) || 1)} className="w-10 border-x border-[#E6E8EE] text-center text-sm font-bold outline-none" />
                <button type="button" onClick={() => onQuantity(offer, qty + 1)} className="grid w-8 place-items-center hover:bg-[#F6F7FA]"><ChromeIcon name="plus" size={14} /></button>
              </div>
              <button
                type="button"
                onClick={() => onAdd(offer)}
                disabled={adding === offer.id || offer.stock <= 0}
                className="inline-flex h-9 items-center gap-2 rounded-md bg-[#FFC72C] px-4 text-xs font-extrabold text-[#0A1F44] hover:bg-[#E5B026] disabled:opacity-60"
              >
                <ChromeIcon name={adding === offer.id ? "clock" : "cart"} size={14} />
                Sepete Ekle
              </button>
            </div>
          </div>
        );
      })}
      <div className="flex flex-col justify-between gap-2 border-t border-[#E6E8EE] bg-[#FAFBFD] px-5 py-3 text-xs text-[#5B6679] sm:flex-row">
        <span className="inline-flex items-center gap-1"><ChromeIcon name="info" size={12} /> Daha düşük fiyat almak için çoklu adet seçin; kademeli fiyat satıcı bazında uygulanır.</span>
        <span className="font-bold text-[#1F4ED8]">{offers.length} bayi ilanı listeleniyor</span>
      </div>
    </div>
  );
}

function DetailTabs({ product }: { product: MarketplaceProduct }) {
  const [tab, setTab] = useState<TabKey>("specs");
  const specs = product.specs || [];
  return (
    <div className="ih-card overflow-hidden">
      <div className="flex overflow-x-auto border-b border-[#E6E8EE] px-5">
        {[
          ["specs", `Teknik Özellikler (${specs.length})`],
          ["description", "Açıklama"],
          ["reviews", "Yorumlar"],
          ["qa", "Soru & Cevap"],
        ].map(([key, label]) => (
          <button key={key} type="button" onClick={() => setTab(key as TabKey)} className={`shrink-0 border-b-2 px-4 py-3 text-sm font-bold ${tab === key ? "border-[#FFC72C] text-[#0A1F44]" : "border-transparent text-[#5B6679]"}`}>
            {label}
          </button>
        ))}
      </div>
      {tab === "specs" && (
        <div className="p-5">
          {specs.length ? (
            <div className="grid overflow-hidden rounded-lg border border-[#E6E8EE]">
              {specs.map((spec, index) => (
                <div key={`${spec.label}-${index}`} className={`grid gap-2 px-4 py-3 text-sm sm:grid-cols-[260px_1fr] ${index % 2 === 0 ? "bg-[#FAFBFD]" : "bg-white"}`}>
                  <span className="text-[#5B6679]">{spec.label}</span>
                  <strong className="font-semibold text-[#0B1220]">{spec.value}</strong>
                </div>
              ))}
            </div>
          ) : <p className="text-sm text-[#5B6679]">Teknik özellik bilgisi henüz eklenmemiş.</p>}
        </div>
      )}
      {tab === "description" && <div className="prose prose-sm max-w-none p-5 text-[#2A3447]"><p>{product.description || "Ürün açıklaması henüz eklenmemiş."}</p></div>}
      {tab === "reviews" && <div className="grid place-items-center p-10 text-center text-sm text-[#5B6679]"><ChromeIcon name="chat" size={32} /><strong className="mt-3 text-[#2A3447]">Henüz yorum yapılmamış</strong></div>}
      {tab === "qa" && <div className="p-5 text-sm text-[#5B6679]">Bu ürün için soru-cevap içeriği yakında burada gösterilecek.</div>}
    </div>
  );
}

export function ProductDetailClient() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const addItem = useCartStore((state) => state.addItem);
  const setCartOpen = useCartStore((state) => state.setOpen);
  const productId = Number(params.id);

  const [product, setProduct] = useState<MarketplaceProduct | null>(null);
  const [offers, setOffers] = useState<ProductListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [favorite, setFavorite] = useState(false);
  const [favoriteBusy, setFavoriteBusy] = useState(false);
  const [sort, setSort] = useState<SortKey>("price_asc");
  const [minStock, setMinStock] = useState(0);
  const [quantities, setQuantities] = useState<Record<number, number>>({});
  const [adding, setAdding] = useState<number | null>(null);

  useEffect(() => {
    setLoading(true);
    productsApi.getOffers(productId).then((res) => {
      const data = res.data as unknown as ProductListingsResponse | undefined;
      setProduct(data?.product || null);
      const nextOffers = data?.offers || [];
      setOffers(nextOffers);
      setQuantities(Object.fromEntries(nextOffers.map((offer) => [offer.id, 1])));
    }).finally(() => setLoading(false));
  }, [productId]);

  const filteredOffers = useMemo(() => {
    const list = offers.filter((offer) => offer.stock >= minStock);
    return [...list].sort((a, b) => {
      if (sort === "price_desc") return b.price - a.price;
      if (sort === "stock_desc") return b.stock - a.stock;
      if (sort === "seller_score") return Number(b.seller?.seller_score || 0) - Number(a.seller?.seller_score || 0);
      return a.price - b.price;
    });
  }, [offers, minStock, sort]);

  const onFavorite = async () => {
    if (!user) {
      router.push("/login");
      return;
    }
    if (!product || favoriteBusy) return;
    setFavoriteBusy(true);
    try {
      const response = await wishlistApi.toggle(product.id);
      setFavorite(Boolean(response.data?.in_wishlist));
      toast.success(response.data?.in_wishlist ? "Favorilere eklendi" : "Favorilerden çıkarıldı");
    } finally {
      setFavoriteBusy(false);
    }
  };

  const onQuantity = (offer: ProductListing, next: number) => {
    setQuantities((current) => ({ ...current, [offer.id]: Math.max(1, Math.min(offer.stock, next)) }));
  };

  const onAdd = async (offer: ProductListing) => {
    if (!user) {
      router.push(`/login?redirect=${encodeURIComponent(`/market/product/${productId}`)}`);
      return;
    }
    setAdding(offer.id);
    try {
      await addItem(offer.id, quantities[offer.id] || 1);
      toast.success("Ürün sepetinize eklendi", { action: { label: "Sepeti Gör", onClick: () => setCartOpen(true) } });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Ürün sepete eklenemedi");
    } finally {
      setAdding(null);
    }
  };

  if (loading) {
    return <div className="mx-auto max-w-[1320px] px-4 py-6 sm:px-7"><Skeleton className="h-[520px] rounded-xl" /></div>;
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-[1320px] px-4 py-12 sm:px-7">
        <div className="ih-card grid place-items-center px-5 py-16 text-center">
          <ChromeIcon name="box" size={52} className="text-[#A9B1BD]" />
          <h2 className="mt-4 text-lg font-black text-[#0A1F44]">Ürün bulunamadı</h2>
          <Link href="/market" className="mt-5 rounded-md bg-[#0A1F44] px-5 py-2.5 text-sm font-bold text-white">Pazaryerine Dön</Link>
        </div>
      </div>
    );
  }

  const breadcrumbItems = [
    { name: "Anasayfa", url: "https://i-hirdavat.com/market" },
    ...(product.category ? [{ name: product.category.name, url: `https://i-hirdavat.com/market/category/${product.category.slug}` }] : []),
    { name: product.name, url: `https://i-hirdavat.com/market/product/${product.id}` },
  ];

  return (
    <div className="pb-10">
      <ProductJsonLd
        name={product.name}
        description={product.description || undefined}
        image={product.image_url || product.image || undefined}
        brand={product.brand || undefined}
        barcode={product.barcode}
        lowestPrice={Number(product.lowest_price || filteredOffers[0]?.price || 0)}
        highestPrice={Number(product.highest_price || 0)}
        offersCount={offers.length}
        inStock={offers.length > 0}
      />
      <BreadcrumbJsonLd items={breadcrumbItems} />

      <div className="mx-auto max-w-[1320px] px-4 py-4 sm:px-7">
        <div className="mb-4 flex items-center gap-2 overflow-x-auto whitespace-nowrap text-sm">
          <Link href="/market" className="text-[#5B6679] hover:text-[#1F4ED8]">Anasayfa</Link>
          <ChromeIcon name="chevron-right" size={14} className="text-[#A9B1BD]" />
          {product.category && <><Link href={`/market/category/${product.category.slug}`} className="text-[#5B6679] hover:text-[#1F4ED8]">{product.category.name}</Link><ChromeIcon name="chevron-right" size={14} className="text-[#A9B1BD]" /></>}
          <span className="truncate font-semibold text-[#0B1220]">{product.name}</span>
        </div>

        <div className="grid gap-5 lg:grid-cols-[380px_1fr]">
          <Gallery product={product} onFavorite={onFavorite} isFavorite={favorite} busy={favoriteBusy} />
          <div className="flex flex-col gap-4">
            <div className="ih-card p-5">
              <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                <div>
                  <h2 className="text-lg font-black text-[#0A1F44]">Ürünün Tüm İlanları</h2>
                  <p className="mt-1 text-sm text-[#5B6679]">Varsayılan sıralama en düşük bayi fiyatıdır.</p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <label className="text-xs font-semibold text-[#5B6679]">Min. stok
                    <select value={minStock} onChange={(event) => setMinStock(Number(event.target.value))} className="ml-2 h-9 rounded-md border border-[#E6E8EE] bg-white px-3 text-sm text-[#0B1220]">
                      <option value={0}>--</option><option value={5}>5+</option><option value={10}>10+</option><option value={50}>50+</option>
                    </select>
                  </label>
                  <label className="text-xs font-semibold text-[#5B6679]">Sırala
                    <select value={sort} onChange={(event) => setSort(event.target.value as SortKey)} className="ml-2 h-9 rounded-md border border-[#E6E8EE] bg-white px-3 text-sm text-[#0B1220]">
                      <option value="price_asc">Fiyat (Artan)</option>
                      <option value="price_desc">Fiyat (Azalan)</option>
                      <option value="stock_desc">Stok</option>
                      <option value="seller_score">Bayi Puanı</option>
                    </select>
                  </label>
                </div>
              </div>
            </div>
            <ListingsTable offers={filteredOffers} quantities={quantities} adding={adding} onQuantity={onQuantity} onAdd={onAdd} />
            <DetailTabs product={product} />
          </div>
        </div>
      </div>
    </div>
  );
}
