import { useEffect, useState } from "react";
import { Flame } from "lucide-react";

const TARGET_HOURS = 6;

const useCountdown = () => {
  const [time, setTime] = useState({ h: 0, m: 0, s: 0 });
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const totalSec = TARGET_HOURS * 3600;
      const elapsed =
        (now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds()) % totalSec;
      const remaining = totalSec - elapsed;
      setTime({
        h: Math.floor(remaining / 3600),
        m: Math.floor((remaining % 3600) / 60),
        s: remaining % 60,
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return time;
};

const pad = (n: number) => n.toString().padStart(2, "0");

/**
 * Ticket-style flash sale banner — perforated edges,
 * serif "SOKO" display, stamped countdown chips.
 */
export const FlashSaleBanner = () => {
  const { h, m, s } = useCountdown();

  return (
    <div className="container mx-auto px-4 mt-4">
      <div className="relative gradient-deals rounded-2xl shadow-card overflow-hidden">
        {/* Perforated divider */}
        <div className="absolute left-1/2 top-0 bottom-0 w-px border-l-2 border-dashed border-card/30 hidden sm:block" />

        <div className="grid grid-cols-1 sm:grid-cols-2 items-center gap-3 px-5 py-4 text-card">
          <div className="flex items-center gap-3">
            <div className="bg-accent text-accent-foreground rounded-xl p-2 shrink-0 shadow-card animate-float">
              <Flame className="h-5 w-5 md:h-6 md:w-6" strokeWidth={2.5} />
            </div>
            <div className="leading-tight min-w-0">
              <div className="flex items-baseline gap-2">
                <span className="font-display font-black text-2xl md:text-3xl text-card italic">
                  Soko
                </span>
                <span className="font-grotesk uppercase text-[10px] tracking-[0.25em] text-accent font-bold">
                  Flash · Sale
                </span>
              </div>
              <div className="text-[11px] md:text-xs text-card/90 mt-0.5">
                Hand-picked deals — vanishes when the clock hits zero.
              </div>
            </div>
          </div>

          <div className="flex items-center justify-start sm:justify-end gap-2">
            <span className="font-grotesk text-[10px] uppercase tracking-widest text-card/80 mr-1">
              Ends in
            </span>
            {[
              { v: h, l: "Hrs" },
              { v: m, l: "Min" },
              { v: s, l: "Sec" },
            ].map((u, i) => (
              <div key={i} className="flex flex-col items-center">
                <span className="bg-card text-secondary rounded-md px-2 py-1 font-display font-black text-base md:text-lg tabular-nums min-w-[40px] text-center shadow-card">
                  {pad(u.v)}
                </span>
                <span className="text-[8px] uppercase tracking-widest text-card/80 mt-0.5 font-grotesk font-bold">
                  {u.l}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
