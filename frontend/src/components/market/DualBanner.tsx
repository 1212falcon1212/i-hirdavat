'use client';

import Link from 'next/link';

export function DualBanner() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Banner 1 - Elektrikli Aletler */}
      <Link
        href="/market/category/elektrikli-aletler"
        className="rounded-[20px] h-[170px] sm:h-[200px] overflow-hidden relative cursor-pointer group hover:scale-[1.01] transition-transform bg-gradient-to-r from-[#1E3A5F] via-[#1E3A5F]/80 to-[#2C5282]/70 block"
      >
        <div className="absolute left-5 right-5 sm:left-8 sm:right-8 top-1/2 -translate-y-1/2">
          <p className="text-[10px] sm:text-[11px] font-bold tracking-[2px] sm:tracking-[3px] text-white/70">
            ELEKTRİKLİ ALETLER
          </p>
          <p className="text-lg sm:text-2xl lg:text-[30px] font-black text-white leading-tight mt-1">
            Bosch &amp; Makita Aletlerinde
          </p>
          <p className="text-2xl sm:text-3xl lg:text-[44px] font-black text-[#fef08a] leading-tight mt-0.5">
            %25&apos;e Varan İndirim
          </p>
        </div>
      </Link>

      {/* Banner 2 - İş Güvenliği */}
      <Link
        href="/market/category/is-guvenligi"
        className="rounded-[20px] h-[170px] sm:h-[200px] overflow-hidden relative cursor-pointer group hover:scale-[1.01] transition-transform bg-gradient-to-br from-slate-900 via-slate-800/95 to-slate-700/85 block"
      >
        <div className="absolute left-5 right-5 sm:left-8 sm:right-8 top-1/2 -translate-y-1/2">
          <p className="text-[10px] sm:text-[11px] font-bold tracking-widest text-[#2C5282]">
            BU HAFTA
          </p>
          <p className="text-lg sm:text-2xl lg:text-[30px] font-black text-white leading-tight mt-1">
            İş Güvenliği Ekipmanlarında
          </p>
          <span className="inline-block bg-[#1E3A5F] text-white px-4 sm:px-6 py-2 sm:py-2.5 rounded-[10px] font-bold text-[12px] sm:text-[13px] mt-2 sm:mt-3 group-hover:bg-[#0F1F35] transition-colors">
            Hemen Keşfet
          </span>
        </div>
      </Link>
    </div>
  );
}
