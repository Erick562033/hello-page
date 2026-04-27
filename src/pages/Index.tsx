import { useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { StoreHeader } from "@/components/StoreHeader";
import { HeroBanner } from "@/components/HeroBanner";
import { CategoryFilter } from "@/components/CategoryFilter";
import { ProductGrid } from "@/components/ProductGrid";
import { FlashSaleBanner } from "@/components/FlashSaleBanner";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { PatternStrip } from "@/components/PatternStrip";
import { BrandMark } from "@/components/BrandMark";

const Index = () => {
  const [category, setCategory] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0 texture-paper">
      <StoreHeader />
      <div className="pt-3">
        <HeroBanner />
        <FlashSaleBanner />
      </div>
      <main className="container mx-auto px-4">
        <CategoryFilter active={category} onChange={setCategory} />

        {/* Mobile filter trigger */}
        <div className="md:hidden flex justify-end mb-2">
          <button
            onClick={() => setFiltersOpen(true)}
            className="flex items-center gap-1.5 bg-card border border-border shadow-soft rounded-full px-3.5 py-1.5 text-xs font-grotesk font-bold uppercase tracking-wider text-secondary"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Filters
          </button>
        </div>

        <ProductGrid
          categoryFilter={category}
          mobileFiltersOpen={filtersOpen}
          onMobileFiltersOpenChange={setFiltersOpen}
        />
      </main>

      {/* Editorial brand banner */}
      <section className="container mx-auto px-4 mt-8">
        <div className="rounded-2xl gradient-emerald text-secondary-foreground p-6 md:p-10 text-center shadow-elevated relative overflow-hidden">
          <div className="absolute inset-0 texture-paper opacity-40" />
          <div className="relative">
            <span className="font-grotesk text-[10px] uppercase tracking-[0.3em] text-accent">Made for Kenya</span>
            <h3 className="font-display text-2xl md:text-4xl font-black mt-2 max-w-2xl mx-auto leading-tight">
              "Karibu Wajose — where <em className="text-accent not-italic">style</em> meets the warmth of home."
            </h3>
            <p className="text-sm opacity-85 mt-3 max-w-lg mx-auto">
              Every piece is hand-picked, every order is wrapped with care, every delivery comes with a smile.
            </p>
          </div>
        </div>
      </section>

      <PatternStrip className="mt-8" />

      <footer className="bg-secondary text-secondary-foreground">
        <div className="container mx-auto px-4 py-10 grid grid-cols-2 md:grid-cols-4 gap-8 text-sm">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <BrandMark size={36} />
              <div>
                <div className="font-display font-black text-lg leading-none">Wajose<span className="text-primary">.</span></div>
                <div className="font-grotesk text-[9px] uppercase tracking-[0.22em] text-accent mt-1">Smart · Wear · Home</div>
              </div>
            </div>
            <p className="opacity-75 text-xs leading-relaxed">
              Quality fashion & home essentials, delivered with love across Kenya.
            </p>
          </div>
          <div>
            <h4 className="font-display font-black mb-3 text-accent text-base">Shop</h4>
            <ul className="space-y-2 opacity-90 text-xs font-grotesk">
              <li>Women's Edit</li><li>Men's Edit</li><li>Kids</li><li>Carpets & Mats</li>
            </ul>
          </div>
          <div>
            <h4 className="font-display font-black mb-3 text-accent text-base">Help</h4>
            <ul className="space-y-2 opacity-90 text-xs font-grotesk">
              <li>Track Order</li><li>Returns</li><li>Shipping</li><li>Contact Us</li>
            </ul>
          </div>
          <div>
            <h4 className="font-display font-black mb-3 text-accent text-base">Pay With</h4>
            <div className="flex flex-wrap gap-1.5">
              {["M-Pesa", "Card", "COD", "Airtel"].map((p) => (
                <span key={p} className="bg-card/10 border border-card/20 px-2.5 py-1 rounded-full text-[10px] font-grotesk font-semibold uppercase tracking-wider">
                  {p}
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className="border-t border-card/10 py-4 text-center text-[11px] opacity-70 font-grotesk">
          © 2026 Wajose Smart Wear · Made in Kenya 🇰🇪 · Karibu sana
        </div>
      </footer>

      <MobileBottomNav />
    </div>
  );
};

export default Index;
