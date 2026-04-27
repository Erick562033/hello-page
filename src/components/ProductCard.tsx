import { Link } from "react-router-dom";
import { ShoppingBag, Loader2, Star, ImageOff } from "lucide-react";
import { useCartStore, type ShopifyProduct } from "@/stores/cartStore";
import { toast } from "sonner";

interface ProductCardProps {
  product: ShopifyProduct;
}

const hash = (s: string) => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
};

export const ProductCard = ({ product }: ProductCardProps) => {
  const addItem = useCartStore((state) => state.addItem);
  const isLoading = useCartStore((state) => state.isLoading);
  const { node } = product;
  const image = node.images.edges[0]?.node;
  const price = node.priceRange.minVariantPrice;
  const variant = node.variants.edges[0]?.node;

  const seed = hash(node.id);
  const discount = 10 + (seed % 51);
  const rating = (3.8 + ((seed >> 3) % 13) / 10).toFixed(1);
  const sold = 50 + (seed % 1500);
  const original = parseFloat(price.amount) / (1 - discount / 100);
  const isHot = sold > 800;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!variant) return;
    await addItem({
      product,
      variantId: variant.id,
      variantTitle: variant.title,
      price: variant.price,
      quantity: 1,
      selectedOptions: variant.selectedOptions || [],
    });
    toast.success(`${node.title} added to cart`, { position: "top-center" });
  };

  return (
    <Link to={`/product/${node.handle}`} className="group block">
      <div className="relative bg-card rounded-2xl overflow-hidden shadow-soft hover:shadow-elevated transition-all duration-300 hover:-translate-y-1 h-full flex flex-col border border-border/60">
        {/* Stamped discount badge — rotated */}
        <div className="absolute top-2.5 left-2.5 z-10 bg-primary text-primary-foreground text-[10px] font-display font-black px-2 py-0.5 rounded-md rotate-[-6deg] shadow-card">
          −{discount}% OFF
        </div>

        {/* Hot tag */}
        {isHot && (
          <div className="absolute top-2.5 right-2.5 z-10 bg-accent text-accent-foreground text-[9px] font-grotesk font-bold uppercase tracking-wider px-1.5 py-0.5 rounded">
            🔥 Hot
          </div>
        )}

        <div className="aspect-square overflow-hidden bg-muted relative">
          {image ? (
            <img
              src={image.url}
              alt={image.altText || node.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              loading="lazy"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-muted-foreground">
              <ImageOff className="h-10 w-10" />
            </div>
          )}

          {/* Quick add */}
          <button
            onClick={handleAddToCart}
            disabled={isLoading || !variant?.availableForSale}
            aria-label="Add to cart"
            className="absolute bottom-2 right-2 h-10 w-10 rounded-full bg-secondary text-accent shadow-elevated flex items-center justify-center opacity-0 group-hover:opacity-100 disabled:opacity-50 transition-all hover:scale-110 border-2 border-accent/40"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ShoppingBag className="h-4 w-4" strokeWidth={2.2} />
            )}
          </button>
        </div>

        <div className="p-3 flex flex-col gap-1 flex-1 bg-gradient-to-b from-card to-background/40">
          <h3 className="text-[13px] leading-snug text-foreground line-clamp-2 min-h-[34px] font-medium">
            {node.title}
          </h3>

          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="font-display text-lg font-black text-primary leading-none">
              {price.currencyCode === "KES" ? "KSh" : price.currencyCode}{" "}
              {parseFloat(price.amount).toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </span>
            <span className="text-[11px] text-muted-foreground line-through">
              {original.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </span>
          </div>

          <div className="flex items-center justify-between text-[11px] text-muted-foreground mt-0.5">
            <span className="flex items-center gap-0.5">
              <Star className="h-3 w-3 fill-accent text-accent" />
              <span className="font-bold text-foreground font-grotesk">{rating}</span>
            </span>
            <span className="font-grotesk">{sold.toLocaleString()} sold</span>
          </div>

          <div className="mt-1.5 flex flex-wrap gap-1">
            <span className="text-[10px] bg-secondary/10 text-secondary font-grotesk font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
              Free Ship
            </span>
            {variant?.availableForSale ? (
              <span className="text-[10px] bg-success/10 text-success font-grotesk font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
                In Stock
              </span>
            ) : (
              <span className="text-[10px] bg-muted text-muted-foreground font-grotesk font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
                Sold Out
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};
