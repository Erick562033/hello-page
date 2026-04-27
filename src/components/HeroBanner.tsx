import { ChevronRight, Sparkles, Gift, ShieldCheck, Truck, Award } from "lucide-react";

export const HeroBanner = () => {
  return (
    <div className="space-y-4">
      {/* Promo marquee — emerald with gold dots */}
      <div className="bg-secondary text-secondary-foreground overflow-hidden border-b-2 border-accent/30">
        <div className="container mx-auto px-4 py-2 flex">
          <div className="flex gap-12 whitespace-nowrap animate-marquee text-xs font-medium">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="flex gap-12 items-center">
                <span className="flex items-center gap-2"><span className="text-accent">●</span> Free shipping over KSh 2,000</span>
                <span className="flex items-center gap-2"><span className="text-accent">●</span> Daily Soko deals at noon</span>
                <span className="flex items-center gap-2"><span className="text-accent">●</span> Pay on delivery — Nairobi & metro</span>
                <span className="flex items-center gap-2"><span className="text-accent">●</span> New here? Use <b className="text-accent font-display italic">KARIBU10</b> for 10% off</span>
                <span className="flex items-center gap-2"><span className="text-accent">●</span> Hand-picked across Kenya</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Hero — editorial split with serif display */}
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {/* Main hero — emerald with cream texture & rotating stamp */}
          <div className="md:col-span-3 relative rounded-2xl overflow-hidden gradient-emerald text-secondary-foreground p-6 md:p-10 min-h-[260px] md:min-h-[340px] flex flex-col justify-center shadow-elevated texture-paper">
            {/* Decorative blobs */}
            <div className="absolute -right-16 -top-16 w-64 h-64 bg-accent/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -left-10 bottom-0 w-40 h-40 bg-primary/20 rounded-full blur-2xl pointer-events-none" />

            {/* Readability scrim — darkens left side behind text without hiding the gradient */}
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-black/55 via-black/30 to-transparent" />
            {/* Bottom fade for the CTA row */}
            <div className="absolute inset-x-0 bottom-0 h-24 pointer-events-none bg-gradient-to-t from-black/40 to-transparent" />

            {/* Rotating stamp badge — kept clear of the headline column on mobile */}
            <div className="absolute top-3 right-3 md:top-6 md:right-8 animate-stamp z-10">
              <div className="bg-accent text-accent-foreground rounded-full h-16 w-16 md:h-24 md:w-24 flex flex-col items-center justify-center text-center shadow-elevated border-2 border-dashed border-secondary/40">
                <span className="font-display font-black text-xl md:text-3xl leading-none">60%</span>
                <span className="text-[8px] md:text-[10px] uppercase tracking-widest font-bold mt-0.5">Off Today</span>
              </div>
            </div>

            <div className="relative z-[1] max-w-md">
              <span className="inline-flex items-center gap-1.5 self-start bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-[0.2em] px-3 py-1 rounded-full mb-4 font-grotesk shadow-card">
                <Sparkles className="h-3 w-3" /> The Soko Edit
              </span>

              <h1 className="font-display text-4xl md:text-6xl font-black leading-[0.95] mb-3 text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.45)]">
                Wear your <em className="not-italic text-accent stamp-underline">story</em>,
                dress your <em className="not-italic text-accent">home</em>.
              </h1>
              <p className="text-sm md:text-base text-white/95 mb-5 leading-relaxed drop-shadow-[0_1px_4px_rgba(0,0,0,0.5)]">
                Curated fashion for the whole family, plus statement carpets and door mats —
                all from Wajose, all delivered across Kenya.
              </p>
              <div className="flex flex-wrap gap-2.5">
                <button className="bg-primary hover:bg-primary-dark text-primary-foreground font-grotesk font-semibold uppercase tracking-wider text-xs md:text-sm px-5 py-3 rounded-full transition shadow-card flex items-center gap-1.5">
                  Shop the edit <ChevronRight className="h-4 w-4" />
                </button>
                <button className="bg-white/15 backdrop-blur-md hover:bg-white/25 border border-white/40 text-white font-grotesk font-semibold uppercase tracking-wider text-xs md:text-sm px-5 py-3 rounded-full transition">
                  New arrivals
                </button>
              </div>
            </div>

          {/* Side cards — playful asymmetric */}
          <div className="md:col-span-2 grid grid-cols-2 md:grid-cols-1 gap-3">
            <div className="relative rounded-2xl overflow-hidden bg-card p-5 shadow-card flex flex-col justify-between border border-border min-h-[120px] md:min-h-[160px]">
              <div className="absolute top-0 right-0 h-full w-1.5 pattern-kente" />
              <div>
                <span className="font-grotesk text-[10px] font-bold text-primary uppercase tracking-[0.2em]">Just In</span>
                <h3 className="font-display font-black text-xl md:text-2xl mt-1 leading-tight">
                  Women's <br/><span className="italic text-secondary">collection</span>
                </h3>
              </div>
              <button className="text-xs font-grotesk font-semibold uppercase tracking-wider text-primary self-start hover:underline flex items-center gap-1">
                Explore <ChevronRight className="h-3 w-3" />
              </button>
            </div>

            <div className="relative rounded-2xl overflow-hidden gradient-sun p-5 shadow-card flex flex-col justify-between min-h-[120px] md:min-h-[160px]">
              <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-card/20 blur-xl" />
              <div className="relative">
                <span className="font-grotesk text-[10px] font-bold text-secondary uppercase tracking-[0.2em]">For the home</span>
                <h3 className="font-display font-black text-xl md:text-2xl mt-1 leading-tight text-secondary">
                  Carpets & <br/><span className="italic">doormats</span>
                </h3>
              </div>
              <button className="relative text-xs font-grotesk font-semibold uppercase tracking-wider text-secondary self-start hover:underline flex items-center gap-1">
                From KSh 499 <ChevronRight className="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>

        {/* Trust strip — cards with serif numerals */}
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2 bg-card rounded-2xl shadow-soft p-3 border border-border">
          {[
            { icon: Truck, title: "Fast Delivery", sub: "1–3 days nationwide" },
            { icon: ShieldCheck, title: "Quality Promise", sub: "Inspected before ship" },
            { icon: Gift, title: "Daily Soko", sub: "Up to 60% off" },
            { icon: Award, title: "M-Pesa & COD", sub: "Pay your way" },
          ].map((item) => (
            <div key={item.title} className="flex items-center gap-3 px-2 py-1">
              <div className="h-10 w-10 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center shrink-0 border border-secondary/20">
                <item.icon className="h-4 w-4" strokeWidth={2.2} />
              </div>
              <div className="leading-tight">
                <div className="text-xs font-bold font-display">{item.title}</div>
                <div className="text-[10px] text-muted-foreground">{item.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
