"use client";

import { useEffect, useMemo, useState } from "react";
import type { MouseEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { cmsApi, blogApi, wishlistApi, type Banner, type BlogPost, type CategoryItem } from "@/lib/api";
import type { ProductRailItem } from "@/types/product";
import { Skeleton } from "@/components/ui/skeleton";
import { ChromeIcon } from "@/components/chrome/Icon";
import { useAuth } from "@/contexts/AuthContext";
import { useCompareStore, MAX_COMPARE_ITEMS } from "@/stores/useCompareStore";
import { toast } from "sonner";

type CategorySection = {
  category_id: number;
  category_name: string;
  category_slug: string;
  products: ProductRailItem[];
};

type HomeData = {
  banners?: Record<string, Banner[]>;
  categories?: CategoryItem[];
  best_sellers?: ProductRailItem[];
  recommended?: ProductRailItem[];
  category_sections?: CategorySection[];
};

const fallbackHero: Banner = {
  id: 1,
  title: "Sezonun Yıldızı Profesyonel Hırdavat",
  subtitle: "Bosch, Makita, DeWalt — 22-30 Nisan'a özel %20'ye varan bayi indirimi",
  badge_text: "Kampanyalar",
  image_url: "",
  link_url: "/market/products",
  button_text: "Alışverişe Başla",
  tab_name: "Kampanyalar",
};

function price(value: number | string | null | undefined) {
  const number = Number(value || 0);
  return number.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function Ph({ label, className = "" }: { label: string; className?: string }) {
  return (
    <div
      className={`grid place-items-center bg-[repeating-linear-gradient(45deg,#EEF1F5_0_8px,#F6F8FB_8px_16px)] font-mono text-[11px] text-[#A9B1BD] ${className}`}
    >
      {label}
    </div>
  );
}

function Hero({ banners, categories }: { banners: Banner[]; categories: CategoryItem[] }) {
  const [active, setActive] = useState(0);
  const safeActive = Math.min(active, Math.max(0, banners.length - 1));
  const hero = banners[safeActive] ?? banners[0] ?? fallbackHero;
  const tiles = categories.slice(0, 9);
  const colors = ["#16A34A", "#1F4ED8", "#B45309", "#DC2626", "#7C3AED", "#FFC72C", "#0EA5E9", "#EC4899", "#475569"];

  return (
    <section className="px-4 pt-6 sm:px-7">
      <div className="mx-auto max-w-[1320px]">
        {banners.length > 1 && (
          <div className="mb-4 flex justify-center gap-2 overflow-x-auto pb-1">
            {banners.map((banner, index) => {
              const label = banner.tab_name?.trim() || banner.title || `Kampanya ${index + 1}`;
              return (
                <button
                  key={banner.id ?? index}
                  type="button"
                  onClick={() => setActive(index)}
                  className={`shrink-0 rounded-full border px-5 py-2.5 text-[13px] font-bold shadow-sm transition ${safeActive === index ? "border-transparent bg-[#FF4B18] text-white" : "border-[#E6E8EE] bg-white text-[#2A3447] hover:border-[#1F4ED8] hover:text-[#1F4ED8]"}`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        )}

        <div className="ih-card grid min-h-[320px] overflow-hidden lg:grid-cols-[380px_1fr]">
          <div className="flex flex-col justify-center bg-white p-8 lg:p-10">
            <h1 className="text-3xl font-black leading-[1.12] tracking-[-0.02em] text-[#0A1F44] lg:text-[36px]">{hero.title}</h1>
            {hero.subtitle && <p className="mt-5 max-w-[290px] text-sm leading-6 text-[#5B6679]">{hero.subtitle}</p>}
            <Link href={hero.link_url || "/market/products"} className="mt-7 inline-flex w-fit rounded-md bg-[#FF4B18] px-7 py-3.5 text-sm font-extrabold uppercase text-white hover:bg-[#E04413]">
              {hero.button_text || "Alışverişe Başla"}
            </Link>
          </div>
          <Link
            href={hero.link_url || "/market/products"}
            className="relative block min-h-[320px] overflow-hidden bg-[#4FA4BD]"
            aria-label={hero.title || "Banner"}
          >
            {hero.image_url ? (
              <Image src={hero.image_url} alt={hero.title || "hero"} fill sizes="(min-width: 1024px) 60vw, 100vw" priority className="object-cover" />
            ) : (
              <Ph label={hero.title || "banner"} className="h-full w-full" />
            )}
          </Link>
        </div>

        {tiles.length > 0 && (
          <div className="mt-4 flex items-center justify-center gap-2 overflow-x-auto pb-1">
            <button className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#FF5B18] text-white"><ChromeIcon name="chevron-left" size={15} /></button>
            {tiles.map((cat, index) => (
              <Link
                key={cat.id}
                href={`/market/category/${cat.slug}`}
                className="shrink-0 rounded-lg px-4 py-2.5 text-[12px] font-black shadow-sm"
                style={{ background: colors[index % colors.length], color: index === 5 ? "#0A1F44" : "#fff" }}
              >
                {cat.name}
              </Link>
            ))}
            <button className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#FF5B18] text-white"><ChromeIcon name="chevron-right" size={15} /></button>
          </div>
        )}
      </div>
    </section>
  );
}

function categoryImageFromLink(link: string | null | undefined, categories: CategoryItem[]): string | null {
  if (!link) return null;
  const match = link.match(/\/market\/category\/([^/?#]+)/);
  if (!match) return null;
  const slug = match[1];
  const cat = categories.find((c) => c.slug === slug);
  return cat?.image_url || null;
}

function AttentionBanners({ banners, categories }: { banners: Banner[]; categories: CategoryItem[] }) {
  const left = banners[0];
  const right = banners[1];
  if (!left && !right) return null;

  const cardClass = "flex min-h-[150px] items-stretch gap-5 overflow-hidden rounded-xl p-5 transition hover:-translate-y-0.5 hover:shadow-ih";

  const renderCard = (banner: Banner, theme: "warm" | "hot") => {
    // Promo kartlarında kategori temsil ürünü öncelikli; admin override sadece kategori eşleşmesi yoksa devreye girer.
    const productImage = categoryImageFromLink(banner.link_url, categories) || banner.image_url;
    const titleColor = theme === "warm" ? "text-[#9A3412]" : "text-white";
    const subtitleColor = theme === "warm" ? "text-[#7C2D12]" : "text-white/90";
    const bgClass = theme === "warm"
      ? "bg-gradient-to-r from-[#FFE9C4] to-[#FFF7E0]"
      : "bg-gradient-to-r from-[#FF6B1A] to-[#C2410C] text-white";
    const imageBg = theme === "warm" ? "bg-white" : "bg-white/15";

    return (
      <Link href={banner.link_url || "/market/kampanyalar"} className={`${cardClass} ${bgClass}`}>
        <div className="flex min-w-0 flex-1 flex-col justify-center">
          <h2 className={`text-2xl font-black tracking-[-0.02em] ${titleColor}`}>{banner.title}</h2>
          {banner.subtitle && <p className={`mt-1 text-sm ${subtitleColor}`}>{banner.subtitle}</p>}
        </div>
        <div className={`relative aspect-square h-[120px] w-[120px] shrink-0 overflow-hidden rounded-lg ${imageBg}`}>
          {productImage ? (
            <Image src={productImage} alt={banner.title || "ürün"} fill sizes="120px" className="object-contain p-2" />
          ) : (
            <div className="grid h-full w-full place-items-center text-[#0A1F44]/30">
              <ChromeIcon name="package" size={32} />
            </div>
          )}
        </div>
      </Link>
    );
  };

  return (
    <section className="px-4 pt-7 sm:px-7">
      <div className="mx-auto grid max-w-[1320px] gap-4 lg:grid-cols-2">
        {left && renderCard(left, "warm")}
        {right && renderCard(right, "hot")}
      </div>
    </section>
  );
}

function ZoneBanners({ banners }: { banners: Banner[] }) {
  const slots = banners.slice(0, 3);
  if (slots.length === 0) return null;

  const themes = [
    { bg: "linear-gradient(135deg,#FCE7F3,#F5D0FE)", color: "#7C3AED", buttonBg: "#7C3AED", buttonText: "#FFFFFF" },
    { bg: "linear-gradient(120deg,#0F172A,#1E293B)", color: "#FFFFFF", buttonBg: "#FFC72C", buttonText: "#0A1F44" },
    { bg: "linear-gradient(135deg,#FFFFFF,#FFF7E0)", color: "#0A1F44", buttonBg: "#0A1F44", buttonText: "#FFFFFF" },
  ];

  return (
    <section className="px-4 pt-4 sm:px-7">
      <div className="mx-auto grid max-w-[1320px] gap-3 lg:grid-cols-[1fr_1.4fr_1fr]">
        {slots.map((banner, index) => {
          const theme = themes[index] ?? themes[0];
          return (
            <Link
              key={banner.id}
              href={banner.link_url || "/market/kampanyalar"}
              className="flex min-h-[180px] flex-col justify-between rounded-xl border border-[#E6E8EE] p-6 transition hover:-translate-y-0.5 hover:shadow-ih"
              style={{ background: theme.bg, color: theme.color }}
            >
              <div>
                {banner.badge_text && (
                  <div className="text-[11px] font-black uppercase tracking-[.12em]" style={{ color: theme.buttonBg }}>
                    {banner.badge_text}
                  </div>
                )}
                <h3 className="mt-1 text-2xl font-black leading-tight tracking-[-0.02em]">{banner.title}</h3>
                {banner.subtitle && <p className="mt-2 text-sm opacity-80">{banner.subtitle}</p>}
              </div>
              {banner.button_text && (
                <span
                  className="mt-4 inline-flex w-fit rounded-md px-4 py-2 text-xs font-black"
                  style={{ background: theme.buttonBg, color: theme.buttonText }}
                >
                  {banner.button_text}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </section>
  );
}

function MiniCategoryCards({ sections }: { sections: CategorySection[] }) {
  const items = sections.slice(0, 4).map((section) => ({
    section,
    product: section.products?.[0],
  })).filter((item) => item.product);

  if (items.length === 0) return null;

  return (
    <section className="px-4 pt-6 sm:px-7">
      <div className="mx-auto grid max-w-[1320px] gap-4 md:grid-cols-2 lg:grid-cols-4">
        {items.map(({ section, product }) => {
          if (!product) return null;
          const image = product.image_url || product.image;
          return (
            <Link href={`/market/category/${section.category_slug}`} key={section.category_id} className="ih-card p-4 transition hover:-translate-y-0.5 hover:shadow-ih">
              <div className="mb-3 flex items-center justify-between gap-3">
                <h3 className="text-sm font-black leading-tight text-[#0A1F44]">{section.category_name}</h3>
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#FF5B18] text-white"><ChromeIcon name="chevron-right" size={15} /></span>
              </div>
              <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-white">
                {image ? (
                  <Image src={image} alt={product.name} fill sizes="(min-width: 1024px) 25vw, 50vw" className="object-contain p-3" />
                ) : (
                  <Ph label={section.category_name} className="h-full w-full" />
                )}
                <span className="absolute left-2 top-2 rounded-full bg-[#DC2626] px-3 py-1 text-[10px] font-black uppercase tracking-[.06em] text-white">Bayi Fırsatı</span>
                <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between gap-3 bg-white/95 px-3 py-2">
                  <span className="line-clamp-1 text-[11px] font-bold leading-tight text-[#2A3447]">
                    {product.brand && <b className="text-[#0A1F44]">{product.brand} </b>}
                    {product.name}
                  </span>
                  <strong className="shrink-0 text-sm text-[#0A1F44]">{price(product.psf || product.lowest_price)} TL</strong>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

function ProductCard({ product, badge = "Çok Satan" }: { product: ProductRailItem; badge?: string }) {
  const image = product.image_url || product.image;
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [wishlistBusy, setWishlistBusy] = useState(false);
  const { user } = useAuth();
  const router = useRouter();
  const toggleCompare = useCompareStore((s) => s.toggle);
  const isCompared = useCompareStore((s) => s.has(product.id));
  const compareCount = useCompareStore((s) => s.items.length);

  const handleFavorite = async (event: MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    if (!user) {
      toast.error("Favorilere eklemek için giriş yapmalısınız.");
      router.push("/login");
      return;
    }

    if (wishlistBusy) return;
    setWishlistBusy(true);

    try {
      const response = await wishlistApi.toggle(product.id);
      const nextState = Boolean(response.data?.in_wishlist);
      setIsWishlisted(nextState);
      toast.success(nextState ? "Favorilere eklendi" : "Favorilerden çıkarıldı");
    } catch (error) {
      console.error("Failed to toggle wishlist:", error);
      toast.error("Favori işlemi tamamlanamadı.");
    } finally {
      setWishlistBusy(false);
    }
  };

  const handleCompare = (event: MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    if (!isCompared && compareCount >= MAX_COMPARE_ITEMS) {
      toast.error(`En fazla ${MAX_COMPARE_ITEMS} ürün karşılaştırılabilir.`);
      return;
    }

    toggleCompare({
      id: product.id,
      name: product.name,
      brand: product.brand ?? undefined,
      image_url: product.image_url ?? undefined,
      image: product.image ?? undefined,
      lowest_price: Number(product.lowest_price || 0),
      psf: product.psf,
    });

    toast.success(isCompared ? "Karşılaştırmadan çıkarıldı" : "Karşılaştırmaya eklendi");
  };

  return (
    <Link href={`/market/product/${product.id}`} className="ih-card group flex min-h-[340px] flex-col overflow-hidden transition hover:-translate-y-0.5 hover:shadow-[0_2px_6px_rgba(11,18,32,.06)]">
      <div className="relative aspect-square bg-white">
        {image ? <Image src={image} alt={product.name} fill sizes="220px" className="object-contain p-6" /> : <Ph label={`product · ${product.brand || "tools"}`} className="h-full w-full" />}
        <span className="absolute left-2.5 top-2.5 inline-flex items-center gap-1 rounded-full bg-[#16A34A] px-2.5 py-1 text-[10px] font-black text-white"><ChromeIcon name="trending" size={11} /> {badge}</span>
        <div className="absolute right-2.5 top-2.5 flex flex-col gap-2">
          <button
            type="button"
            onClick={handleFavorite}
            disabled={wishlistBusy}
            aria-label={isWishlisted ? "Favorilerden çıkar" : "Favorilere ekle"}
            className={`grid h-8 w-8 place-items-center rounded-lg bg-white/95 shadow-sm transition hover:bg-white disabled:opacity-60 ${isWishlisted ? "text-[#E11D48]" : "text-[#5B6679]"}`}
          >
            <ChromeIcon name="heart" size={15} className={isWishlisted ? "fill-current" : undefined} />
          </button>
          <button
            type="button"
            onClick={handleCompare}
            aria-label={isCompared ? "Karşılaştırmadan çıkar" : "Karşılaştırmaya ekle"}
            className={`grid h-8 w-8 place-items-center rounded-lg bg-white/95 shadow-sm transition hover:bg-white ${isCompared ? "text-[#1F4ED8]" : "text-[#5B6679]"}`}
          >
            <ChromeIcon name="scale" size={15} />
          </button>
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-3">
        <div className="text-[12px] leading-snug text-[#2A3447]">{product.brand && <b className="text-[#0A1F44]">{product.brand}</b>} {product.name}</div>
        <div className="mt-auto"><div className="text-[10px] font-bold uppercase tracking-[.06em] text-[#7E8898]">PSF</div><div className="ih-price text-[17px] font-black">{price(product.psf || product.lowest_price)} <span className="text-[11px] font-semibold text-[#5B6679]">TL</span></div></div>
        <div className="mt-1 flex items-center justify-between border-t border-[#EFF1F5] pt-2"><span className="text-[11px] font-bold text-[#1F4ED8]">{product.offers_count || 0} bayi ilanı →</span><span className="grid h-7 w-7 place-items-center rounded-md border border-[#E6E8EE] text-[#2A3447]"><ChromeIcon name="cart" size={12} /></span></div>
      </div>
    </Link>
  );
}

function ProductRail({ title, products, badge }: { title: string; products: ProductRailItem[]; badge?: string }) {
  if (!products.length) return null;
  return (
    <section className="px-4 pt-8 sm:px-7">
      <div className="mx-auto max-w-[1320px]">
        <div className="mb-3.5 flex items-center justify-between"><h2 className="m-0 text-xl font-black tracking-[-0.02em] text-[#0A1F44]">{title}</h2><Link href="/market/products" className="text-xs font-bold text-[#FF5B18]">Tümünü Keşfet ›</Link></div>
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">{products.slice(0, 10).map((product) => <ProductCard key={product.id} product={product} badge={badge} />)}</div>
      </div>
    </section>
  );
}

function FeaturedCampaigns({ banners }: { banners: Banner[] }) {
  const fallback = [
    ["Ustabilir'i Keşfet, Güvenli Hizmet Almaya Başla!", "linear-gradient(135deg,#FF6B1A,#C2410C)"],
    ["Mağaza Teslim Seçeneğinde Özel Fırsat!", "linear-gradient(135deg,#FFC72C,#F59E0B)"],
    ["Uygulamayı İndir, İndirimli Kap!", "linear-gradient(135deg,#FF6B1A,#FB923C)"],
    ["İyi ki Almışım Diyeceğin Ürünler", "linear-gradient(135deg,#1F4ED8,#3B82F6)"],
  ];
  return (
    <section className="px-4 pt-8 sm:px-7">
      <div className="mx-auto max-w-[1320px]">
        <div className="mb-3.5 flex items-center justify-between"><h2 className="text-xl font-black text-[#0A1F44]">Öne Çıkan Kampanyalar</h2><Link href="/market/kampanyalar" className="text-xs font-bold text-[#FF5B18]">Tümünü Keşfet ›</Link></div>
        <div className="grid gap-4 lg:grid-cols-4">
          {fallback.map(([title, bg], index) => {
            const banner = banners[index];
            return (
              <Link href={banner?.link_url || "/market/kampanyalar"} key={title} className="block">
                <div className="relative aspect-[4/5] overflow-hidden rounded-xl p-5 text-white" style={{ background: banner?.image_url ? "#FFFFFF" : bg }}>
                  {banner?.image_url && <Image src={banner.image_url} alt={banner.title || title} fill sizes="320px" className="object-cover" />}
                  <h3 className="relative max-w-[220px] text-xl font-black leading-tight">{banner?.title || title}</h3>
                  <span className="absolute bottom-5 left-5 rounded bg-white px-4 py-2 text-xs font-black text-[#0A1F44]">{banner?.button_text || "Alışverişe Başla"}</span>
                </div>
                <strong className="mt-2 block text-sm text-[#2A3447]">{banner?.subtitle || title}</strong>
                <span className="mt-1 block text-xs font-bold text-[#1F4ED8] underline">Alışverişe Başla</span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function VideoSection({ banners }: { banners: Banner[] }) {
  const items = [
    ["Hızlı Sipariş Sırrı", "10 dakikada 20 ürün sepete", "linear-gradient(135deg,#475569,#94A3B8)"],
    ["Bayi Karşılaştırma", "En uygun fiyatı bul", "linear-gradient(135deg,#15803D,#65A30D)"],
    ["Excel ile Toplu Sipariş", "1000 satıra kadar", "linear-gradient(135deg,#B91C1C,#F97316)"],
    ["Sözleşmeli Fiyat", "Kurumsal avantaj", "linear-gradient(135deg,#6D28D9,#A855F7)"],
  ];
  return (
    <section className="px-4 pt-8 sm:px-7">
      <div className="mx-auto max-w-[1320px]">
        <h2 className="mb-3.5 text-xl font-black text-[#0A1F44]">İyi ki Almışım Diyeceğiniz Ürünler</h2>
        <div className="grid gap-4 md:grid-cols-4">
          {items.map(([fallbackTitle, fallbackCaption, bg], index) => {
            const banner = banners[index];
            const title = banner?.title || fallbackTitle;
            const caption = banner?.subtitle || fallbackCaption;
            const content = (
              <div className="relative aspect-[3/4] overflow-hidden rounded-xl p-4 text-white" style={{ background: banner?.image_url ? "#111827" : bg }}>
                {banner?.image_url && <Image src={banner.image_url} alt={title} fill sizes="(min-width: 1024px) 25vw, 100vw" className="object-cover" />}
                {banner?.image_url && <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/55" />}
                <div className="relative text-[11px] font-black uppercase tracking-[.08em]">{banner?.button_text || "İyi ki almışım"}</div>
                <div className="absolute bottom-4 left-4 right-4">
                  <strong className="block text-sm">{title}</strong>
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white/25">▶</span>
                    <span className="text-right text-xs font-bold">{caption}</span>
                  </div>
                </div>
              </div>
            );

            return banner?.link_url ? (
              <Link href={banner.link_url} key={fallbackTitle} className="block">
                {content}
              </Link>
            ) : (
              <div key={fallbackTitle}>{content}</div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function IconCategoryScroller({ categories }: { categories: CategoryItem[] }) {
  const items = categories.slice(0, 10);
  if (items.length === 0) return null;

  return (
    <section className="px-4 pt-8 sm:px-7">
      <div className="mx-auto max-w-[1320px]">
        <h2 className="mb-4 text-xl font-black text-[#0A1F44]">İlgini Çekebilecek Kategoriler</h2>
        <div className="flex items-center gap-3">
          <button className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-[#E6E8EE] bg-white">
            <ChromeIcon name="chevron-left" size={15} />
          </button>
          <div className="grid flex-1 grid-cols-5 gap-4 md:grid-cols-10">
            {items.map((cat) => (
              <Link key={cat.id} href={`/market/category/${cat.slug}`} className="group text-center">
                <div className="relative mx-auto mb-2 aspect-square w-full overflow-hidden rounded-full border border-[#E6E8EE] bg-white transition group-hover:border-[#1F4ED8] group-hover:shadow-ih">
                  {cat.image_url ? (
                    <Image src={cat.image_url} alt={cat.name} fill sizes="80px" className="object-contain p-3" />
                  ) : (
                    <div className="grid h-full w-full place-items-center bg-[#FAFBFD] text-[#0A1F44]">
                      <ChromeIcon name="wrench" size={24} />
                    </div>
                  )}
                </div>
                <span className="line-clamp-2 text-[11px] font-semibold leading-tight text-[#2A3447] group-hover:text-[#1F4ED8]">{cat.name}</span>
              </Link>
            ))}
          </div>
          <button className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-[#E6E8EE] bg-white">
            <ChromeIcon name="chevron-right" size={15} />
          </button>
        </div>
      </div>
    </section>
  );
}

function BlogSection({ posts }: { posts: BlogPost[] }) {
  if (posts.length === 0) return null;
  const visible = posts.slice(0, 3);

  return (
    <section className="px-4 pt-8 sm:px-7">
      <div className="mx-auto max-w-[1320px]">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div className="leading-none">
            <span className="text-2xl font-black text-[#FF5B18]">HIRDAVAT</span>
            <br />
            <span className="text-3xl font-black text-[#0A1F44]">DÜNYASI </span>
            <span className="text-2xl font-semibold italic text-[#7C3AED]">Blog</span>
          </div>
          <Link href="/market/blog" className="text-xs font-bold text-[#FF5B18]">Tüm Yazılar ›</Link>
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          {visible.map((post) => (
            <Link href={`/market/blog/${post.slug}`} key={post.id} className="ih-card overflow-hidden transition hover:-translate-y-0.5 hover:shadow-ih">
              <div className="relative aspect-[16/10] bg-[#F6F7FA]">
                {post.featured_image_url ? (
                  <Image src={post.featured_image_url} alt={post.title} fill sizes="(min-width: 1024px) 33vw, 100vw" className="object-cover" />
                ) : (
                  <Ph label={post.category?.slug || "blog"} className="h-full w-full" />
                )}
              </div>
              <div className="p-5">
                {post.category?.name && (
                  <div className="text-[10px] font-black uppercase tracking-[.08em] text-[#FF5B18]">{post.category.name}</div>
                )}
                <h3 className="mt-2 line-clamp-2 text-base font-black leading-tight text-[#0A1F44]">{post.title}</h3>
                {post.excerpt && (
                  <p className="mt-2 line-clamp-2 text-sm leading-snug text-[#5B6679]">{post.excerpt}</p>
                )}
                <span className="mt-3 inline-block text-sm font-bold text-[#1F4ED8]">Blog&apos;da İncele ↗</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export function MarketHomeClient() {
  const [data, setData] = useState<HomeData | null>(null);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    cmsApi.getHomepage().then((response) => {
      setData((response.data || null) as HomeData | null);
      setIsLoading(false);
    }).catch(() => setIsLoading(false));

    blogApi.getPosts({ per_page: 3, page: 1 }).then((response) => {
      if (response.data?.posts) setPosts(response.data.posts);
    }).catch(() => {});
  }, []);

  const banners = data?.banners || {};
  const categorySections = useMemo(() => data?.category_sections || [], [data?.category_sections]);
  const featuredCategoryRail = categorySections[0]?.products || [];

  if (isLoading) {
    return <div className="mx-auto max-w-[1320px] px-4 py-6 sm:px-7"><Skeleton className="h-[420px] rounded-xl" /></div>;
  }

  return (
    <div className="pb-12">
      <Hero banners={banners.hero?.length ? banners.hero : [fallbackHero]} categories={data?.categories || []} />
      <AttentionBanners banners={banners.promo || []} categories={data?.categories || []} />
      <ZoneBanners banners={[...(banners.middle || []), ...(banners.grid || [])]} />
      <MiniCategoryCards sections={categorySections} />
      <ProductRail title="Yakın Zamanda İncelediklerin 🔍😍" products={data?.recommended || []} badge="Çok Satan" />
      <ProductRail title={categorySections[0]?.category_name ? `${categorySections[0].category_name} Kategorisinin Yıldızları ⭐` : "Öne Çıkan Ürünler ⭐"} products={featuredCategoryRail} badge="Yıldızlı Ürün" />
      <ProductRail title="i-hirdavat'ın Çok Satan Ürünleri 🚀" products={data?.best_sellers || []} badge="Çok Satan" />
      <FeaturedCampaigns banners={banners.featured_campaigns?.length ? banners.featured_campaigns : [...(banners.grid || []), ...(banners.showcase || []), ...(banners.brand || [])]} />
      <VideoSection banners={banners.video_stories || []} />
      <IconCategoryScroller categories={data?.categories || []} />
      <BlogSection posts={posts} />
    </div>
  );
}
