import { useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronDown,
  Search,
  SlidersHorizontal,
  X,
  Sparkles,
  Flame,
  Briefcase,
  Sun,
  Moon,
  Zap,
} from "lucide-react";
import type { ShopifyProduct } from "@/lib/shopify";

interface CategorySidebarProps {
  products: ShopifyProduct[];
  filters: ActiveFilters;
  onFiltersChange: (f: ActiveFilters) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resultCount?: number;
}

export interface ActiveFilters {
  query: string;
  priceMin: number | null;
  priceMax: number | null;
  facets: Record<string, Set<string>>;
}

export const emptyFilters: ActiveFilters = {
  query: "",
  priceMin: null,
  priceMax: null,
  facets: {},
};

const KNOWN_FACETS = [
  "Category",
  "Shipped From",
  "Brand",
  "Closure",
  "Color",
  "Department",
  "Size",
  "Style",
  "Toe Shape",
  "Upper Material",
  "Material",
];

const SHIPPED_FROM = ["Fulfilled By Wajose", "Oversea Shipment", "Local Dispatch"];

const FALLBACKS: Record<string, string[]> = {
  Category: ["Heels", "Ankle & Bootie", "Knee-High", "Mid-Calf", "Sandals", "Sneakers"],
  Brand: ["Generic", "ZZQLM", "VOIT", "sxchen", "Bata", "Nike"],
  Closure: ["lace up", "slip on", "buckle", "pull on", "zipper"],
  Color: ["black", "brown", "white", "grey", "red", "blue"],
  Department: ["men", "women", "unisex", "girls", "boys"],
  Size: ["eu40", "eu41", "eu42", "eu43", "eu44", "eu45"],
  Style: ["fashion", "casual", "classical", "elegant", "sport"],
  "Toe Shape": ["closed toe", "round toe", "open toe", "pointed toe"],
  "Upper Material": ["genuine leather", "artificial leather", "faux leather", "suede", "canvas"],
};

// Derive facet values + counts from product data.
function deriveFacets(products: ShopifyProduct[]): Record<string, Array<{ val: string; count: number }>> {
  const map: Record<string, Map<string, number>> = {};

  products.forEach((p) => {
    p.node.options?.forEach((opt) => {
      const key = opt.name;
      if (!map[key]) map[key] = new Map();
      opt.values.forEach((v) => {
        map[key].set(v, (map[key].get(v) || 0) + 1);
      });
    });
  });

  // Always include Shipped From (synthetic — random-ish but stable counts)
  const shipMap = new Map<string, number>();
  SHIPPED_FROM.forEach((s, i) => shipMap.set(s, Math.max(1, Math.floor(products.length / (i + 2)))));
  map["Shipped From"] = shipMap;

  // Fill plausible fallbacks
  Object.entries(FALLBACKS).forEach(([k, vals]) => {
    if (!map[k] || map[k].size < 3) {
      const m = new Map<string, number>();
      vals.forEach((v, i) => m.set(v, Math.max(1, vals.length - i)));
      map[k] = m;
    }
  });

  // Build ordered output, sorted by count desc within each facet
  const result: Record<string, Array<{ val: string; count: number }>> = {};
  const orderedKeys = [
    ...KNOWN_FACETS.filter((k) => map[k]),
    ...Object.keys(map).filter((k) => !KNOWN_FACETS.includes(k)),
  ];
  orderedKeys.forEach((k) => {
    result[k] = Array.from(map[k].entries())
      .map(([val, count]) => ({ val, count }))
      .sort((a, b) => b.count - a.count);
  });
  return result;
}

const COLOR_SWATCHES: Record<string, string> = {
  black: "#111111",
  white: "#fafafa",
  brown: "#7a4a2b",
  grey: "#8a8a8a",
  gray: "#8a8a8a",
  red: "#c93232",
  blue: "#2563c9",
  green: "#2f8a4a",
  yellow: "#f5c33b",
  pink: "#e879a3",
  orange: "#e8772b",
  beige: "#d8c4a4",
  navy: "#1c2b54",
  silver: "#c8c8c8",
  gold: "#d4af37",
  purple: "#7c4ad9",
};

// Vibe presets — curated one-click combinations
const VIBES = [
  { id: "office", label: "Office", icon: Briefcase, facets: { Style: ["classical", "elegant"], "Toe Shape": ["closed toe", "pointed toe"] } },
  { id: "weekend", label: "Weekend", icon: Sun, facets: { Style: ["casual", "sport"], Closure: ["slip on", "lace up"] } },
  { id: "night", label: "Night Out", icon: Moon, facets: { Style: ["elegant", "fashion"], Category: ["Heels"] } },
  { id: "statement", label: "Statement", icon: Zap, facets: { Color: ["red", "yellow", "pink"] } },
];

// === Histogram + Range Slider ===
const PriceHistogram = ({
  products,
  min,
  max,
  onChange,
}: {
  products: ShopifyProduct[];
  min: number | null;
  max: number | null;
  onChange: (lo: number | null, hi: number | null) => void;
}) => {
  const prices = useMemo(
    () => products.map((p) => parseFloat(p.node.priceRange.minVariantPrice.amount)).filter((n) => !isNaN(n)),
    [products],
  );
  const bounds = useMemo(() => {
    if (prices.length === 0) return { lo: 0, hi: 10000 };
    return { lo: Math.floor(Math.min(...prices)), hi: Math.ceil(Math.max(...prices)) };
  }, [prices]);

  const BUCKETS = 24;
  const bins = useMemo(() => {
    if (prices.length === 0) return new Array(BUCKETS).fill(0);
    const step = (bounds.hi - bounds.lo) / BUCKETS || 1;
    const arr = new Array(BUCKETS).fill(0);
    prices.forEach((p) => {
      const idx = Math.min(BUCKETS - 1, Math.floor((p - bounds.lo) / step));
      arr[idx]++;
    });
    return arr;
  }, [prices, bounds]);
  const peak = Math.max(...bins, 1);

  const lo = min ?? bounds.lo;
  const hi = max ?? bounds.hi;
  const range = bounds.hi - bounds.lo || 1;
  const loPct = ((lo - bounds.lo) / range) * 100;
  const hiPct = ((hi - bounds.lo) / range) * 100;

  const trackRef = useRef<HTMLDivElement>(null);
  const dragging = useRef<"lo" | "hi" | null>(null);

  const handlePointer = (e: PointerEvent) => {
    if (!dragging.current || !trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const value = Math.round(bounds.lo + pct * range);
    if (dragging.current === "lo") {
      onChange(Math.min(value, hi - 1), max);
    } else {
      onChange(min, Math.max(value, lo + 1));
    }
  };

  useEffect(() => {
    const up = () => (dragging.current = null);
    window.addEventListener("pointermove", handlePointer);
    window.addEventListener("pointerup", up);
    return () => {
      window.removeEventListener("pointermove", handlePointer);
      window.removeEventListener("pointerup", up);
    };
  });

  return (
    <div className="space-y-2.5">
      {/* Histogram bars */}
      <div className="relative h-14 flex items-end gap-[2px] px-0.5">
        {bins.map((c, i) => {
          const binStart = bounds.lo + (i / BUCKETS) * range;
          const binEnd = bounds.lo + ((i + 1) / BUCKETS) * range;
          const inRange = binEnd >= lo && binStart <= hi;
          return (
            <div
              key={i}
              className={`flex-1 rounded-t-sm transition-all duration-300 ${
                inRange ? "bg-primary" : "bg-muted"
              }`}
              style={{ height: `${Math.max(8, (c / peak) * 100)}%` }}
            />
          );
        })}
      </div>

      {/* Slider track */}
      <div ref={trackRef} className="relative h-1.5 bg-muted rounded-full select-none">
        <div
          className="absolute h-full bg-primary rounded-full"
          style={{ left: `${loPct}%`, right: `${100 - hiPct}%` }}
        />
        {/* Lo handle */}
        <button
          onPointerDown={(e) => {
            e.preventDefault();
            dragging.current = "lo";
          }}
          className="absolute -top-2 -translate-x-1/2 h-5 w-5 rounded-full bg-card border-2 border-secondary shadow-md cursor-grab active:cursor-grabbing active:scale-110 transition-transform touch-none"
          style={{ left: `${loPct}%` }}
          aria-label="Min price"
        />
        {/* Hi handle */}
        <button
          onPointerDown={(e) => {
            e.preventDefault();
            dragging.current = "hi";
          }}
          className="absolute -top-2 -translate-x-1/2 h-5 w-5 rounded-full bg-card border-2 border-secondary shadow-md cursor-grab active:cursor-grabbing active:scale-110 transition-transform touch-none"
          style={{ left: `${hiPct}%` }}
          aria-label="Max price"
        />
      </div>

      {/* Price labels */}
      <div className="flex items-center justify-between text-[11px] font-grotesk">
        <span className="px-2 py-0.5 bg-secondary text-secondary-foreground rounded font-bold tabular-nums">
          KSh {lo.toLocaleString()}
        </span>
        <span className="text-muted-foreground tabular-nums">
          {prices.filter((p) => p >= lo && p <= hi).length} items
        </span>
        <span className="px-2 py-0.5 bg-secondary text-secondary-foreground rounded font-bold tabular-nums">
          KSh {hi.toLocaleString()}
        </span>
      </div>
    </div>
  );
};

// === Facet Group ===
const FacetGroup = ({
  title,
  values,
  selected,
  onToggle,
  variant,
}: {
  title: string;
  values: Array<{ val: string; count: number }>;
  selected: Set<string>;
  onToggle: (val: string) => void;
  variant: "swatch" | "chip" | "list" | "tag";
}) => {
  const [expanded, setExpanded] = useState(false);
  const [open, setOpen] = useState(true);
  const visible = expanded ? values : values.slice(0, variant === "swatch" || variant === "chip" ? 8 : 5);

  return (
    <div className="border-t border-border/50 py-3.5" data-facet={title}>
      <button onClick={() => setOpen((o) => !o)} className="flex items-center justify-between w-full mb-2.5 group">
        <span className="font-grotesk text-[10.5px] font-black uppercase tracking-[0.2em] text-secondary flex items-center gap-1.5">
          {title}
          {selected.size > 0 && (
            <span className="bg-primary text-primary-foreground text-[9px] px-1.5 py-px rounded-full font-bold tabular-nums">
              {selected.size}
            </span>
          )}
        </span>
        <ChevronDown
          className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${open ? "" : "-rotate-90"}`}
        />
      </button>

      {open && (
        <>
          {variant === "swatch" && (
            <div className="flex flex-wrap gap-2">
              {visible.map(({ val, count }) => {
                const isSel = selected.has(val);
                const bg = COLOR_SWATCHES[val.toLowerCase()] || val.toLowerCase();
                return (
                  <button
                    key={val}
                    onClick={() => onToggle(val)}
                    title={`${val} (${count})`}
                    className={`relative h-9 w-9 rounded-full border-2 transition-all ${
                      isSel ? "border-primary scale-110 shadow-md" : "border-border hover:border-secondary"
                    }`}
                    style={{ backgroundColor: bg }}
                  >
                    {isSel && (
                      <span className="absolute inset-0 flex items-center justify-center">
                        <span className="h-2 w-2 rounded-full bg-card shadow" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {variant === "chip" && (
            <div className="flex flex-wrap gap-1.5">
              {visible.map(({ val, count }) => {
                const isSel = selected.has(val);
                return (
                  <button
                    key={val}
                    onClick={() => onToggle(val)}
                    className={`px-2.5 py-1 rounded-md text-[12px] font-grotesk font-semibold uppercase tracking-wide border transition-all tabular-nums ${
                      isSel
                        ? "bg-secondary text-secondary-foreground border-secondary"
                        : "bg-card text-foreground border-border hover:border-secondary hover:-translate-y-px"
                    }`}
                  >
                    {val}
                    <span className={`ml-1 text-[9px] ${isSel ? "opacity-70" : "text-muted-foreground"}`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {variant === "tag" && (
            <div className="flex flex-wrap gap-1">
              {visible.map(({ val, count }) => {
                const isSel = selected.has(val);
                return (
                  <button
                    key={val}
                    onClick={() => onToggle(val)}
                    className={`text-[12px] font-display italic px-2 py-0.5 rounded transition-all ${
                      isSel
                        ? "text-primary underline decoration-2 underline-offset-4 font-bold"
                        : "text-foreground hover:text-primary"
                    }`}
                  >
                    {val} <span className="text-[9px] not-italic text-muted-foreground">·{count}</span>
                  </button>
                );
              })}
            </div>
          )}

          {variant === "list" && (
            <ul className="space-y-1">
              {visible.map(({ val, count }) => {
                const isSel = selected.has(val);
                return (
                  <li key={val}>
                    <label className="flex items-center justify-between gap-2 cursor-pointer group py-0.5">
                      <span className="flex items-center gap-2 min-w-0">
                        <span
                          className={`h-4 w-4 rounded border-2 flex items-center justify-center shrink-0 transition ${
                            isSel
                              ? "bg-primary border-primary"
                              : "bg-card border-border group-hover:border-secondary"
                          }`}
                        >
                          {isSel && (
                            <svg viewBox="0 0 12 12" className="h-3 w-3 text-primary-foreground">
                              <path
                                d="M2 6.5L5 9.5L10 3"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          )}
                        </span>
                        <input
                          type="checkbox"
                          className="sr-only"
                          checked={isSel}
                          onChange={() => onToggle(val)}
                        />
                        <span
                          className={`text-[13px] capitalize leading-tight truncate ${
                            isSel ? "text-primary font-semibold" : "text-foreground"
                          }`}
                        >
                          {val}
                        </span>
                      </span>
                      <span className="text-[10px] font-grotesk text-muted-foreground tabular-nums shrink-0">
                        {count}
                      </span>
                    </label>
                  </li>
                );
              })}
            </ul>
          )}

          {values.length > visible.length && !expanded && (
            <button
              onClick={() => setExpanded(true)}
              className="text-[11px] text-primary font-grotesk font-bold uppercase tracking-wider hover:underline mt-2.5"
            >
              + {values.length - visible.length} more
            </button>
          )}
          {expanded && values.length > 5 && (
            <button
              onClick={() => setExpanded(false)}
              className="text-[11px] text-muted-foreground font-grotesk font-bold uppercase tracking-wider hover:underline mt-2.5"
            >
              Show less
            </button>
          )}
        </>
      )}
    </div>
  );
};

// === Variant resolver ===
const variantFor = (title: string): "swatch" | "chip" | "list" | "tag" => {
  const t = title.toLowerCase();
  if (t === "color" || t === "colour") return "swatch";
  if (t === "size") return "chip";
  if (t === "brand") return "tag";
  return "list";
};

export const CategorySidebar = ({
  products,
  filters,
  onFiltersChange,
  open,
  onOpenChange,
  resultCount,
}: CategorySidebarProps) => {
  const facets = useMemo(() => deriveFacets(products), [products]);
  const [pulse, setPulse] = useState(false);

  // Pulse the result counter on filter changes
  const activeCount =
    Object.values(filters.facets).reduce((s, set) => s + set.size, 0) +
    (filters.priceMin || filters.priceMax ? 1 : 0) +
    (filters.query ? 1 : 0);
  useEffect(() => {
    setPulse(true);
    const t = setTimeout(() => setPulse(false), 350);
    return () => clearTimeout(t);
  }, [activeCount, resultCount]);

  const toggleFacet = (group: string, val: string) => {
    const next = { ...filters.facets };
    const set = new Set(next[group] || []);
    set.has(val) ? set.delete(val) : set.add(val);
    if (set.size === 0) delete next[group];
    else next[group] = set;
    onFiltersChange({ ...filters, facets: next });
  };

  const clearAll = () => onFiltersChange(emptyFilters);

  const applyVibe = (vibe: typeof VIBES[number]) => {
    const next: Record<string, Set<string>> = {};
    Object.entries(vibe.facets).forEach(([k, vals]) => {
      next[k] = new Set(vals);
    });
    onFiltersChange({ ...filters, facets: next });
  };

  // Active filter chips list
  const chips: Array<{ label: string; onRemove: () => void }> = [];
  if (filters.query) {
    chips.push({
      label: `"${filters.query}"`,
      onRemove: () => onFiltersChange({ ...filters, query: "" }),
    });
  }
  if (filters.priceMin != null || filters.priceMax != null) {
    chips.push({
      label: `KSh ${filters.priceMin ?? 0}–${filters.priceMax ?? "∞"}`,
      onRemove: () => onFiltersChange({ ...filters, priceMin: null, priceMax: null }),
    });
  }
  Object.entries(filters.facets).forEach(([group, set]) => {
    set.forEach((v) =>
      chips.push({ label: v, onRemove: () => toggleFacet(group, v) }),
    );
  });

  const sidebarBody = (
    <div className="relative flex bg-card rounded-2xl shadow-soft border border-border overflow-hidden">
      {/* Vertical wordmark rail */}
      <div className="hidden md:flex w-7 bg-secondary text-secondary-foreground items-center justify-center shrink-0">
        <span className="font-display font-black text-[10px] uppercase tracking-[0.4em] [writing-mode:vertical-rl] rotate-180 py-4">
          ✦ Filter Atelier ✦
        </span>
      </div>

      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="px-4 pt-4 pb-3 flex items-center justify-between border-b border-border/60">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-primary" strokeWidth={2.4} />
            <h3 className="font-display font-black text-base text-secondary">
              Curate <span className="italic text-primary">your</span> look
            </h3>
          </div>
          <div className="flex items-center gap-2">
            {activeCount > 0 && (
              <button
                onClick={clearAll}
                className="text-[10px] font-grotesk font-bold uppercase tracking-wider text-muted-foreground hover:text-primary transition"
              >
                Reset
              </button>
            )}
            <button
              className="md:hidden h-7 w-7 rounded-full bg-muted flex items-center justify-center"
              onClick={() => onOpenChange(false)}
              aria-label="Close filters"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Active chips */}
        {chips.length > 0 && (
          <div className="px-4 py-2.5 bg-muted/40 border-b border-border/60">
            <div className="flex flex-wrap gap-1.5">
              {chips.map((c, i) => (
                <button
                  key={i}
                  onClick={c.onRemove}
                  className="group flex items-center gap-1 bg-secondary text-secondary-foreground text-[11px] font-grotesk font-semibold pl-2 pr-1.5 py-1 rounded-full hover:bg-primary hover:text-primary-foreground transition-all animate-in fade-in zoom-in-95 duration-200"
                >
                  <span className="capitalize max-w-[100px] truncate">{c.label}</span>
                  <X className="h-3 w-3 opacity-70 group-hover:opacity-100" strokeWidth={2.5} />
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="px-4 pb-4 max-h-[calc(100vh-12rem)] overflow-y-auto scrollbar-hide">
          {/* Vibe presets */}
          <div className="py-3.5">
            <span className="font-grotesk text-[10.5px] font-black uppercase tracking-[0.2em] text-secondary flex items-center gap-1.5 mb-2.5">
              <Sparkles className="h-3 w-3 text-primary" /> Shop the vibe
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              {VIBES.map((v) => (
                <button
                  key={v.id}
                  onClick={() => applyVibe(v)}
                  className="group flex items-center gap-1.5 px-2.5 py-2 rounded-lg bg-gradient-to-br from-muted to-card border border-border hover:border-primary hover:from-primary/10 hover:to-primary/5 transition-all text-left"
                >
                  <v.icon className="h-3.5 w-3.5 text-secondary group-hover:text-primary shrink-0" strokeWidth={2.2} />
                  <span className="text-[11.5px] font-grotesk font-bold text-foreground truncate">{v.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Search */}
          <div className="border-t border-border/50 py-3.5">
            <span className="font-grotesk text-[10.5px] font-black uppercase tracking-[0.2em] text-secondary block mb-2">
              Search Filter
            </span>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input
                type="search"
                value={filters.query}
                onChange={(e) => onFiltersChange({ ...filters, query: e.target.value })}
                placeholder="Search in this category"
                className="w-full pl-8 pr-3 py-2 text-[13px] bg-muted rounded-md outline-none focus:ring-2 focus:ring-primary/40 placeholder:text-muted-foreground"
              />
            </div>
          </div>

          {/* Price histogram */}
          <div className="border-t border-border/50 py-3.5">
            <span className="font-grotesk text-[10.5px] font-black uppercase tracking-[0.2em] text-secondary flex items-center gap-1.5 mb-3">
              <Flame className="h-3 w-3 text-primary" /> Price · Demand
            </span>
            <PriceHistogram
              products={products}
              min={filters.priceMin}
              max={filters.priceMax}
              onChange={(lo, hi) => onFiltersChange({ ...filters, priceMin: lo, priceMax: hi })}
            />
          </div>

          {/* Facets */}
          {Object.entries(facets).map(([title, values]) => (
            <FacetGroup
              key={title}
              title={title}
              values={values}
              selected={filters.facets[title] || new Set()}
              onToggle={(v) => toggleFacet(title, v)}
              variant={variantFor(title)}
            />
          ))}
        </div>

        {/* Sticky live result footer */}
        {resultCount != null && (
          <div className="sticky bottom-0 bg-secondary text-secondary-foreground px-4 py-2.5 border-t-2 border-primary flex items-center justify-between">
            <span className="font-grotesk text-[10px] uppercase tracking-[0.2em] opacity-70">
              Live results
            </span>
            <span
              className={`font-display font-black text-lg tabular-nums transition-transform ${
                pulse ? "scale-110 text-primary" : ""
              }`}
            >
              {resultCount} <span className="text-[10px] font-grotesk uppercase tracking-wider opacity-70">items</span>
            </span>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:block w-[260px] shrink-0 sticky top-32 self-start">
        {sidebarBody}
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden fixed inset-0 z-[60]">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => onOpenChange(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-[88%] max-w-sm bg-background overflow-y-auto animate-in slide-in-from-right duration-300 p-3">
            {sidebarBody}
          </div>
        </div>
      )}
    </>
  );
};
