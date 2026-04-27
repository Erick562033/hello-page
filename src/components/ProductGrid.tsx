import { useState, useEffect, useMemo } from "react";
import { Loader2, PackageOpen, Flame } from "lucide-react";
import { storefrontApiRequest, STOREFRONT_PRODUCTS_QUERY, type ShopifyProduct } from "@/lib/shopify";
import { ProductCard } from "./ProductCard";
import { QuickViewModal } from "./QuickViewModal";
import { CategorySidebar, emptyFilters, type ActiveFilters } from "./CategorySidebar";

interface ProductGridProps {
  categoryFilter: string;
  mobileFiltersOpen: boolean;
  onMobileFiltersOpenChange: (open: boolean) => void;
}

const titleMap: Record<string, string> = {
  "": "Just For You",
  women: "Women's Fashion",
  men: "Men's Fashion",
  children: "Kids' Collection",
  carpets: "Home — Carpets & Mats",
};

export const ProductGrid = ({
  categoryFilter,
  mobileFiltersOpen,
  onMobileFiltersOpenChange,
}: ProductGridProps) => {
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [quickView, setQuickView] = useState<ShopifyProduct | null>(null);
  const [filters, setFilters] = useState<ActiveFilters>(emptyFilters);

  // Reset filters when category changes
  useEffect(() => {
    setFilters(emptyFilters);
  }, [categoryFilter]);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const queryMap: Record<string, string | undefined> = {
          "": undefined,
          women: "tag:women OR product_type:women",
          men: "tag:men OR product_type:men",
          children: "tag:children OR product_type:children",
          carpets: "tag:carpets OR tag:mats OR product_type:carpets OR product_type:mats",
        };

        const data = await storefrontApiRequest(STOREFRONT_PRODUCTS_QUERY, {
          first: 50,
          query: queryMap[categoryFilter] || undefined,
        });

        setProducts(data?.data?.products?.edges || []);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [categoryFilter]);

  // Apply client-side filters (search + price + facets)
  const filtered = useMemo(() => {
    return products.filter((p) => {
      const node = p.node;
      // Search
      if (filters.query) {
        const q = filters.query.toLowerCase();
        if (!node.title.toLowerCase().includes(q) && !node.description?.toLowerCase().includes(q)) {
          return false;
        }
      }
      // Price
      const price = parseFloat(node.priceRange.minVariantPrice.amount);
      if (filters.priceMin != null && price < filters.priceMin) return false;
      if (filters.priceMax != null && price > filters.priceMax) return false;

      // Facets — match at least one selected value per active group (variant options)
      for (const [group, set] of Object.entries(filters.facets)) {
        if (set.size === 0) continue;
        const opt = node.options?.find((o) => o.name === group);
        if (!opt) continue; // synthetic group (e.g., Shipped From) — don't filter out
        const matches = opt.values.some((v) => set.has(v));
        if (!matches) return false;
      }
      return true;
    });
  }, [products, filters]);

  return (
    <section className="mt-2 md:flex md:gap-4 md:items-start">
      <CategorySidebar
        products={products}
        filters={filters}
        onFiltersChange={setFilters}
        open={mobileFiltersOpen}
        onOpenChange={onMobileFiltersOpenChange}
        resultCount={filtered.length}
      />

      <div className="flex-1 min-w-0">
        {/* Editorial section header */}
        <div className="bg-card rounded-t-2xl shadow-soft px-5 py-4 flex items-end justify-between border-b border-border">
          <div className="flex items-end gap-3">
            <Flame className="h-6 w-6 text-primary mb-0.5" strokeWidth={2.2} />
            <div>
              <span className="block font-grotesk text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                {filtered.length} of {products.length} items
              </span>
              <h2 className="font-display text-xl md:text-2xl font-black text-secondary leading-none mt-0.5">
                <span className="italic">{titleMap[categoryFilter] || "Just for you"}</span>
              </h2>
            </div>
          </div>
          <button className="text-[11px] md:text-xs font-grotesk font-bold uppercase tracking-wider text-primary hover:underline whitespace-nowrap">
            See all →
          </button>
        </div>

        <div className="bg-card rounded-b-2xl shadow-soft p-3 border-x border-b border-border">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <PackageOpen className="h-14 w-14 text-muted-foreground mb-3" />
              <h3 className="font-heading text-lg font-semibold mb-1">No matching products</h3>
              <p className="text-sm text-muted-foreground max-w-md">
                Try adjusting your filters or clear them to see all items.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-3">
              {filtered.map((product) => (
                <ProductCard
                  key={product.node.id}
                  product={product}
                  onQuickView={setQuickView}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <QuickViewModal
        product={quickView}
        open={!!quickView}
        onOpenChange={(o) => !o && setQuickView(null)}
      />
    </section>
  );
};
