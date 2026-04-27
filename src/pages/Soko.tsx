import { Link } from "react-router-dom";
import { ArrowLeft, Flame, Tag, Truck, Sparkles, ChevronRight } from "lucide-react";
import { StoreHeader } from "@/components/StoreHeader";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { FlashSaleBanner } from "@/components/FlashSaleBanner";
import { ProductGrid } from "@/components/ProductGrid";

/**
 * Soko — the marketplace browse hub.
 * Surfaces deals, categories and the full catalog in one editorial page.
 */
const Soko = () => {
  const tiles = [
    { label: "Women", emoji: "👗", tone: "bg-primary/10 text-primary" },
    { label: "Men", emoji: "👔", tone: "bg-secondary/10 text-secondary" },
    { label: "Kids", emoji: "🧒", tone: "bg-accent/20 text-secondary" },
    { label: "Carpets", emoji: "🪔", tone: "bg-secondary/15 text-secondary" },
    { label: "Door Mats", emoji: "🚪", tone: "bg-primary/15 text-primary" },
    { label: "New In", emoji: "✨", tone: "bg-accent/25 text-secondary" },
  ];

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0 texture-paper">
      <StoreHeader />

      {/* Page hero */}
      <section className="container mx-auto px-4 pt-4">
        <div className="flex items-center gap-2 text-xs font-grotesk uppercase tracking-wider text-muted-foreground">
          <Link to="/" className="flex items-center gap-1 hover:text-primary transition">
            <ArrowLeft className="h-3.5 w-3.5" /> Home
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-secondary font-bold">Soko</span>
        </div>

        <div className="mt-3 rounded-2xl gradient-emerald text-secondary-foreground p-6 md:p-8 relative overflow-hidden shadow-elevated">
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-accent/20 rounded-full blur-2xl" />
          <span className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-[0.2em] px-3 py-1 rounded-full font-grotesk">
            <Sparkles className="h-3 w-3" /> The Wajose Soko
          </span>
          <h1 className="font-display text-3xl md:text-5xl font-black mt-3 leading-tight">
            Walk the <em className="not-italic text-accent">market</em>, your way.
          </h1>
          <p className="text-sm md:text-base text-white/90 mt-2 max-w-lg">
            Browse every aisle — from boutique fashion to home essentials — all under one roof.
          </p>
        </div>
      </section>

      {/* Quick category tiles */}
      <section className="container mx-auto px-4 mt-5">
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2.5">
          {tiles.map((t) => (
            <button
              key={t.label}
              className={`flex flex-col items-center justify-center gap-1.5 rounded-2xl border border-border bg-card shadow-soft py-4 hover:shadow-card transition ${t.tone.split(" ")[1]}`}
            >
              <span className={`h-12 w-12 rounded-full flex items-center justify-center text-2xl ${t.tone.split(" ")[0]}`}>
                {t.emoji}
              </span>
              <span className="text-[11px] font-grotesk font-bold uppercase tracking-wider">{t.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Perks row */}
      <section className="container mx-auto px-4 mt-4">
        <div className="grid grid-cols-3 gap-2 bg-card rounded-2xl border border-border p-2 shadow-soft">
          {[
            { icon: Flame, t: "Daily Soko", s: "Up to 60% off" },
            { icon: Tag, t: "Best Prices", s: "Verified by Wajose" },
            { icon: Truck, t: "Fast Delivery", s: "1–3 days" },
          ].map((p) => (
            <div key={p.t} className="flex items-center gap-2 px-2 py-1.5">
              <div className="h-9 w-9 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center shrink-0 border border-secondary/20">
                <p.icon className="h-4 w-4" strokeWidth={2.2} />
              </div>
              <div className="leading-tight">
                <div className="text-[11px] font-bold font-display">{p.t}</div>
                <div className="text-[9px] text-muted-foreground">{p.s}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <FlashSaleBanner />

      <main className="container mx-auto px-4">
        <h2 className="font-display text-2xl md:text-3xl font-black text-secondary mt-6 mb-3">
          Today's edit
        </h2>
        <ProductGrid categoryFilter="" />
      </main>

      <MobileBottomNav />
    </div>
  );
};

export default Soko;
