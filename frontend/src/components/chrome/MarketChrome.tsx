import { ReactNode } from "react";
import { TopPromo } from "./TopPromo";
import { Header } from "./Header";
import { CategoryNav } from "./CategoryNav";
import { Footer } from "./Footer";

export function MarketChrome({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F6F7FA] font-sans text-[#0B1220]">
      <div className="sticky top-0 z-50">
        <TopPromo />
        <Header />
        <CategoryNav />
      </div>
      <main className="relative">{children}</main>
      <Footer />
    </div>
  );
}
