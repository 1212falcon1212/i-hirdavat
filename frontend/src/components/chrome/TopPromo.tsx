import Link from "next/link";
import { ChromeIcon } from "./Icon";

export function TopPromo() {
  return (
    <div className="bg-[#0A1F44] text-[#C7D0E4] text-[11px]">
      <div className="mx-auto flex h-[25px] max-w-[1400px] items-center justify-between gap-4 px-4 sm:px-7">
        <div className="hidden items-center gap-4 lg:flex">
          <span className="inline-flex items-center gap-1.5"><ChromeIcon name="truck" size={11} />16:00&apos;a kadar siparişlerde aynı gün kargo</span>
          <span className="inline-flex items-center gap-1.5"><ChromeIcon name="wallet" size={11} />Vadeli ödemede %0 faiz</span>
          <span className="inline-flex items-center gap-1.5"><ChromeIcon name="shield" size={11} />7/24 bayi destek</span>
        </div>
        <div className="lg:hidden">Türkiye&apos;nin B2B hırdavat pazaryeri</div>
        <div className="flex items-center gap-3 whitespace-nowrap">
          <Link href="/register" className="hover:text-white">Bayi Ol</Link>
          <span className="text-white/20">|</span>
          <Link href="/yardim" className="hover:text-white">Yardım</Link>
          <span className="text-white/20">|</span>
          <span>TR ▾</span>
        </div>
      </div>
    </div>
  );
}
