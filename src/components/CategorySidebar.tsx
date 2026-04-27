import { useMemo, useState } from "react";
import { ChevronDown, Search, SlidersHorizontal, X } from "lucide-react";
import type { ShopifyProduct } from "@/lib/shopify";

interface CategorySidebarProps {
  products: ShopifyProduct[];
  filters: ActiveFilters;
  onFiltersChange: (f: ActiveFilters) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
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

const SUGGESTIONS = [
  "Men's Shoes",
  "Women's Shoes",
  "Kids Shoes",
  "Shoe Care & Accessories",
];

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

// Derive facet values from product data — falls back to plausible defaults so the
// sidebar always feels rich, like Kilimall.
function deriveFacets(products: ShopifyProduct[]): Record<string, string[]> {
  const map: Record<string, Set<string>> = {};

  products.forEach((p) => {
    p.node.options?.forEach((opt) => {
      const key = opt.name;
      if (!map[key]) map[key] = new Set();
      opt.values.forEach((v) => map[key].add(v));
    });
  });

  // Always include Shipped From facet
  map["Shipped From"] = new Set(SHIPPED_FROM);

  // Sample fallbacks so the experience matches Kilimall density
  const fallbacks: Record<string, string[]> = {
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

  Object.entries(fallbacks).forEach(([k, vals]) => {
    if (!map[k] || map[k].size < 3) map[k] = new Set(vals);
  });

  // Build ordered output
  const result: Record<string, string[]> = {};
  KNOWN_FACETS.forEach((k) => {
    if (map[k]) result[k] = Array.from(map[k]);
  });
  // Append any extra options from product data not in KNOWN_FACETS
  Object.keys(map).forEach((k) => {
    if (!result[k]) result[k] = Array.from(map[k]);
  });
  return result;
}

const COLOR_SWATCHES: Record<string, string> = {
  black: "#111111",
  white: "#ffffff",
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
};

interface FacetGroupProps {
  title: string;
  values: string[];
  selected: Set<string>;
  onToggle: (val: string) => void;
  isColor?: boolean;
}

const FacetGroup = ({ title, values, selected, onToggle, isColor }: FacetGroupProps) => {
  const [expanded, setExpanded] = useState(false);
  const [open, setOpen] = useState(true);
  const visible = expanded ? values : values.slice(0, 4);

  return (
    <div className="border-b border-border/60 py-3">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center justify-between w-full mb-2 group"
      >
        <span className="font-grotesk text-[11px] font-bold uppercase tracking-[0.15em] text-secondary">
          {title}
        </span>
        <ChevronDown
          className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${
            open ? "" : "-rotate-90"
          }`}
        />
      </button>
      {open && (
        <ul className="space-y-1.5">
          {visible.map((val) => {
            const isSelected = selected.has(val);
            return (
              <li key={val}>
                <label className="flex items-center gap-2 cursor-pointer group py-0.5">
                  <span
                    className={`h-4 w-4 rounded border-2 flex items-center justify-center shrink-0 transition ${
                      isSelected
                        ? "bg-primary border-primary"
                        : "bg-card border-border group-hover:border-secondary"
                    }`}
                  >
                    {isSelected && (
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
                  {isColor && (
                    <span
                      className="h-4 w-4 rounded-full border border-border shrink-0"
                      style={{
                        backgroundColor:
                          COLOR_SWATCHES[val.toLowerCase()] || val.toLowerCase(),
                      }}
                    />
                  )}
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={isSelected}
                    onChange={() => onToggle(val)}
                  />
                  <span
                    className={`text-[13px] capitalize leading-tight ${
                      isSelected ? "text-primary font-semibold" : "text-foreground"
                    }`}
                  >
                    {val}
                  </span>
                </label>
              </li>
            );
          })}
          {values.length > 4 && (
            <li>
              <button
                onClick={() => setExpanded((e) => !e)}
                className="text-[12px] text-primary font-semibold hover:underline mt-1"
              >
                {expanded ? "View Less ▲" : "View More ▼"}
              </button>
            </li>
          )}
        </ul>
      )}
    </div>
  );
};

export const CategorySidebar = ({
  products,
  filters,
  onFiltersChange,
  open,
  onOpenChange,
}: CategorySidebarProps) => {
  const facets = useMemo(() => deriveFacets(products), [products]);
  const [tempMin, setTempMin] = useState<string>(
    filters.priceMin?.toString() ?? "",
  );
  const [tempMax, setTempMax] = useState<string>(
    filters.priceMax?.toString() ?? "",
  );

  const toggleFacet = (group: string, val: string) => {
    const next = { ...filters.facets };
    const set = new Set(next[group] || []);
    set.has(val) ? set.delete(val) : set.add(val);
    if (set.size === 0) delete next[group];
    else next[group] = set;
    onFiltersChange({ ...filters, facets: next });
  };

  const applyPrice = () => {
    onFiltersChange({
      ...filters,
      priceMin: tempMin ? parseFloat(tempMin) : null,
      priceMax: tempMax ? parseFloat(tempMax) : null,
    });
  };

  const clearAll = () => {
    setTempMin("");
    setTempMax("");
    onFiltersChange(emptyFilters);
  };

  const activeCount =
    Object.values(filters.facets).reduce((s, set) => s + set.size, 0) +
    (filters.priceMin || filters.priceMax ? 1 : 0) +
    (filters.query ? 1 : 0);

  const sidebarBody = (
    <div className="bg-card rounded-2xl shadow-soft border border-border overflow-hidden">
      {/* Header */}
      <div className="bg-secondary text-secondary-foreground px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-accent" strokeWidth={2.4} />
          <span className="font-display font-black text-sm uppercase tracking-wider">
            Filters
          </span>
          {activeCount > 0 && (
            <span className="bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {activeCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {activeCount > 0 && (
            <button
              onClick={clearAll}
              className="text-[11px] font-grotesk font-bold uppercase tracking-wider text-accent hover:underline"
            >
              Clear
            </button>
          )}
          <button
            className="md:hidden h-7 w-7 rounded-full bg-card/10 flex items-center justify-center"
            onClick={() => onOpenChange(false)}
            aria-label="Close filters"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="px-4 pb-4">
        {/* Search */}
        <div className="py-3 border-b border-border/60">
          <span className="font-grotesk text-[11px] font-bold uppercase tracking-[0.15em] text-secondary block mb-2">
            Search Filter
          </span>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="search"
              value={filters.query}
              onChange={(e) =>
                onFiltersChange({ ...filters, query: e.target.value })
              }
              placeholder="Search in this category"
              className="w-full pl-8 pr-3 py-2 text-[13px] bg-muted rounded-md outline-none focus:ring-2 focus:ring-primary/40 placeholder:text-muted-foreground"
            />
          </div>
        </div>

        {/* Price */}
        <div className="py-3 border-b border-border/60">
          <span className="font-grotesk text-[11px] font-bold uppercase tracking-[0.15em] text-secondary block mb-2">
            Price (KSh)
          </span>
          <div className="flex items-center gap-2">
            <input
              type="number"
              inputMode="numeric"
              value={tempMin}
              onChange={(e) => setTempMin(e.target.value)}
              placeholder="Min"
              className="w-full px-2 py-1.5 text-[13px] bg-card border border-border rounded-md outline-none focus:border-primary"
            />
            <span className="text-muted-foreground">—</span>
            <input
              type="number"
              inputMode="numeric"
              value={tempMax}
              onChange={(e) => setTempMax(e.target.value)}
              placeholder="Max"
              className="w-full px-2 py-1.5 text-[13px] bg-card border border-border rounded-md outline-none focus:border-primary"
            />
          </div>
          <button
            onClick={applyPrice}
            className="mt-2 w-full bg-primary text-primary-foreground font-grotesk font-bold text-xs uppercase tracking-wider py-1.5 rounded-md hover:bg-primary/90 transition"
          >
            Apply
          </button>
        </div>

        {/* Suggestions */}
        <div className="py-3 border-b border-border/60">
          <span className="font-grotesk text-[11px] font-bold uppercase tracking-[0.15em] text-secondary block mb-2">
            Suggestions
          </span>
          <ul className="space-y-1.5">
            {SUGGESTIONS.map((s) => (
              <li key={s}>
                <button
                  onClick={() =>
                    onFiltersChange({ ...filters, query: s })
                  }
                  className="text-[13px] text-foreground hover:text-primary hover:translate-x-0.5 transition-all text-left"
                >
                  {s}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Facets */}
        {Object.entries(facets).map(([title, values]) => (
          <FacetGroup
            key={title}
            title={title}
            values={values}
            selected={filters.facets[title] || new Set()}
            onToggle={(v) => toggleFacet(title, v)}
            isColor={title.toLowerCase() === "color" || title.toLowerCase() === "colour"}
          />
        ))}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:block w-[240px] shrink-0 sticky top-32 self-start max-h-[calc(100vh-9rem)] overflow-y-auto scrollbar-hide">
        {sidebarBody}
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden fixed inset-0 z-[60]">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => onOpenChange(false)}
          />
          <div className="absolute right-0 top-0 bottom-0 w-[85%] max-w-sm bg-background overflow-y-auto animate-in slide-in-from-right duration-200 p-3">
            {sidebarBody}
          </div>
        </div>
      )}
    </>
  );
};
