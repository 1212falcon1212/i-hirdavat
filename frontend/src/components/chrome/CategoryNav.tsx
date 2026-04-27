"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { cmsApi, type CategoryItem } from "@/lib/api";
import { ChromeIcon } from "./Icon";

const fallback = [
  "El Aletleri",
  "Elektrikli Aletler",
  "İş Güvenliği",
  "Bağlantı Elemanları",
  "Ölçüm Aletleri",
  "Aydınlatma",
  "Hidrolik & Pnömatik",
].map((name, index) => ({
  id: index + 1,
  name,
  slug: name.toLowerCase().replaceAll(" ", "-").replaceAll("ı", "i"),
  icon: "wrench",
  products_count: 0,
  children: [],
  top_brands: [],
}));

function iconFor(name: string) {
  const lower = name.toLocaleLowerCase("tr-TR");
  if (lower.includes("elektrik") || lower.includes("matkap")) return "bolt";
  if (lower.includes("güven")) return "shield";
  if (lower.includes("bağlantı") || lower.includes("civata")) return "package";
  if (lower.includes("aydın")) return "sparkles";
  return "wrench";
}

export function CategoryNav() {
  const [categories, setCategories] = useState<CategoryItem[]>(fallback);
  const [active, setActive] = useState<number | null>(null);

  useEffect(() => {
    cmsApi.getHomepage().then((res) => {
      if (res.data?.categories?.length) setCategories(res.data.categories.slice(0, 7));
    });
  }, []);

  const navItems = useMemo(() => [{ id: 0, name: "Tüm Kategoriler", slug: "products", icon: "menu", products_count: 0, children: categories }, ...categories], [categories]);
  const activeItem = active == null ? null : navItems[active];

  return (
    <nav className="relative z-40 bg-[#0F2552]" onMouseLeave={() => setActive(null)}>
      <div className="mx-auto flex h-11 max-w-[1400px] items-stretch px-4 sm:px-7">
        <div className="flex min-w-0 flex-1 items-stretch overflow-x-auto">
          {navItems.map((category, index) => (
            <Link
              href={index === 0 ? "/market/products" : `/market/category/${category.slug}`}
              key={`${category.id}-${category.slug}`}
              onMouseEnter={() => setActive(index)}
              className={`flex shrink-0 items-center gap-2 border-b-2 px-4 text-[13px] font-medium text-white transition ${index === 0 ? "bg-[rgba(255,199,44,.12)] font-bold" : ""} ${active === index ? "border-[#FFC72C] bg-white/5" : "border-transparent"}`}
            >
              <ChromeIcon name={index === 0 ? "menu" : iconFor(category.name)} size={14} />
              <span className="whitespace-nowrap">{category.name}</span>
              {index === 1 && <span className="rounded-[3px] bg-[#DC2626] px-1.5 py-0.5 text-[9px] font-black">HOT</span>}
              {index === 0 && <ChromeIcon name="chevron-down" size={11} />}
            </Link>
          ))}
        </div>
        <Link href="/market/kampanyalar" className="ml-3 flex shrink-0 items-center gap-1 border-b-2 border-transparent px-4 text-[13px] font-bold text-[#FFC72C] hover:border-[#FFC72C] hover:bg-white/5">
          🔥 Kampanyalar
        </Link>
      </div>

      {activeItem && (
        <div className="absolute left-0 right-0 top-full hidden border-b border-[#E6E8EE] bg-white px-7 py-6 shadow-[0_12px_32px_rgba(11,18,32,.10),0_2px_6px_rgba(11,18,32,.04)] lg:block">
          <div className="mx-auto grid max-w-[1320px] grid-cols-[220px_1fr_240px] gap-8">
            <div>
              <div className="mb-3 text-[11px] font-extrabold uppercase tracking-[.06em] text-[#0A1F44]">{activeItem.name}</div>
              <div className="flex flex-col gap-2 text-[13px]">
                {(activeItem.children?.length ? activeItem.children : categories).slice(0, 9).map((child) => (
                  <Link key={child.id} href={`/market/category/${child.slug}`} className="font-medium text-[#2A3447] hover:text-[#1F4ED8]">
                    {child.name}
                  </Link>
                ))}
                <Link href="/market/products" className="mt-1 font-semibold text-[#1F4ED8]">Tümünü Gör →</Link>
              </div>
            </div>
            <div>
              <div className="mb-3 text-[11px] font-extrabold uppercase tracking-[.06em] text-[#0A1F44]">Popüler Markalar</div>
              <div className="grid grid-cols-4 gap-2">
                {(activeItem.top_brands?.length ? activeItem.top_brands : ["Bosch", "Makita", "DeWalt", "Stanley", "İzeltaş", "Bahco", "Knipex", "Hilti"].map((name) => ({ name, slug: name.toLowerCase(), logo: null }))).slice(0, 8).map((brand) => (
                  <Link key={brand.slug} href={`/market/marka/${brand.slug}`} className="rounded-md border border-[#E6E8EE] px-3 py-2 text-center text-xs font-semibold text-[#2A3447] hover:border-[#1F4ED8] hover:text-[#1F4ED8]">
                    {brand.name}
                  </Link>
                ))}
              </div>
            </div>
            <Link href="/market/kampanyalar" className="rounded-lg bg-gradient-to-br from-[#FFC72C] to-[#FFD66B] p-4 text-[#0A1F44]">
              <div className="text-[10px] font-extrabold uppercase tracking-[.1em]">Haftanın Fırsatı</div>
              <div className="mt-1.5 text-sm font-extrabold leading-tight">Profesyonel hırdavatta stoklu bayi kampanyaları</div>
              <span className="mt-3 inline-flex rounded-md bg-[#0A1F44] px-3 py-2 text-xs font-bold text-white">Keşfet →</span>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
