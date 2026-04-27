import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingBag, Loader2, X, ImageOff, Star } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useCartStore, type ShopifyProduct } from "@/stores/cartStore";
import { toast } from "sonner";

interface QuickViewModalProps {
  product: ShopifyProduct | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const QuickViewModal = ({ product, open, onOpenChange }: QuickViewModalProps) => {
  const addItem = useCartStore((s) => s.addItem);
  const isLoading = useCartStore((s) => s.isLoading);

  const [imgIdx, setImgIdx] = useState(0);
  const [selectedOpts, setSelectedOpts] = useState<Record<string, string>>({});

  useEffect(() => {
    if (product) {
      setImgIdx(0);
      const initial: Record<string, string> = {};
      product.node.options?.forEach((opt) => {
        initial[opt.name] = opt.values[0];
      });
      setSelectedOpts(initial);
    }
  }, [product]);

  if (!product) return null;
  const { node } = product;
  const images = node.images.edges;
  const currentImg = images[imgIdx]?.node;

  // Find variant matching selected options
  const matchedVariant =
    node.variants.edges.find((v) =>
      v.node.selectedOptions.every((o) => selectedOpts[o.name] === o.value),
    )?.node || node.variants.edges[0]?.node;

  const price = matchedVariant?.price || node.priceRange.minVariantPrice;

  const handleAdd = async () => {
    if (!matchedVariant) return;
    await addItem({
      product,
      variantId: matchedVariant.id,
      variantTitle: matchedVariant.title,
      price: matchedVariant.price,
      quantity: 1,
      selectedOptions: matchedVariant.selectedOptions || [],
    });
    toast.success(`${node.title} added to cart`, { position: "top-center" });
    onOpenChange(false);
  };

  const isColorOption = (name: string) => /colou?r/i.test(name);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl p-0 overflow-hidden gap-0 bg-card border-2 border-border">
        <button
          onClick={() => onOpenChange(false)}
          className="absolute right-3 top-3 z-20 h-8 w-8 rounded-full bg-card/90 backdrop-blur flex items-center justify-center shadow-card hover:bg-card transition"
          aria-label="Close"
        >
          <X className="h-4 w-4 text-secondary" />
        </button>

        <div className="grid md:grid-cols-2 gap-0 max-h-[85vh] overflow-y-auto">
          {/* Images */}
          <div className="bg-muted">
            <div className="aspect-square overflow-hidden relative">
              {currentImg ? (
                <img
                  src={currentImg.url}
                  alt={currentImg.altText || node.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                  <ImageOff className="h-12 w-12" />
                </div>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 p-3 overflow-x-auto bg-card">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setImgIdx(i)}
                    className={`shrink-0 h-14 w-14 rounded-lg overflow-hidden border-2 transition ${
                      i === imgIdx ? "border-primary" : "border-transparent opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img src={img.node.url} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="p-5 md:p-6 flex flex-col gap-4">
            <div>
              <span className="font-grotesk text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                Quick View
              </span>
              <h2 className="font-display text-xl md:text-2xl font-black text-secondary leading-tight mt-1">
                {node.title}
              </h2>
              <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-0.5">
                  <Star className="h-3.5 w-3.5 fill-accent text-accent" />
                  <span className="font-bold text-foreground font-grotesk">4.6</span>
                </span>
                <span>·</span>
                <span className="font-grotesk">In Stock</span>
              </div>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="font-display text-2xl font-black text-primary">
                {price.currencyCode === "KES" ? "KSh" : price.currencyCode}{" "}
                {parseFloat(price.amount).toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </span>
            </div>

            {node.description && (
              <p className="text-sm text-muted-foreground line-clamp-3">{node.description}</p>
            )}

            {/* Variant options */}
            {node.options?.filter((o) => o.values.length > 1 || o.name.toLowerCase() !== "title").map((opt) => (
              <div key={opt.name}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-grotesk text-xs font-bold uppercase tracking-wider text-secondary">
                    {opt.name}
                  </span>
                  <span className="text-xs text-muted-foreground">{selectedOpts[opt.name]}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {opt.values.map((val) => {
                    const active = selectedOpts[opt.name] === val;
                    if (isColorOption(opt.name)) {
                      return (
                        <button
                          key={val}
                          title={val}
                          onClick={() => setSelectedOpts((s) => ({ ...s, [opt.name]: val }))}
                          className={`h-9 w-9 rounded-full border-2 transition ${
                            active ? "border-primary scale-110 shadow-stamp" : "border-border"
                          }`}
                          style={{ backgroundColor: val.toLowerCase() }}
                        />
                      );
                    }
                    return (
                      <button
                        key={val}
                        onClick={() => setSelectedOpts((s) => ({ ...s, [opt.name]: val }))}
                        className={`min-w-[44px] px-3 h-9 rounded-md font-grotesk font-bold text-xs uppercase tracking-wider border-2 transition ${
                          active
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-card text-foreground hover:border-secondary"
                        }`}
                      >
                        {val}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            <div className="mt-auto flex flex-col sm:flex-row gap-2 pt-2">
              <button
                onClick={handleAdd}
                disabled={isLoading || !matchedVariant?.availableForSale}
                className="flex-1 h-12 rounded-xl bg-primary text-primary-foreground font-display font-black uppercase tracking-wider text-sm flex items-center justify-center gap-2 hover:bg-primary/90 disabled:opacity-50 transition shadow-card"
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <ShoppingBag className="h-5 w-5" strokeWidth={2.4} />
                )}
                Add to Cart
              </button>
              <Link
                to={`/product/${node.handle}`}
                onClick={() => onOpenChange(false)}
                className="h-12 px-5 rounded-xl border-2 border-secondary text-secondary font-grotesk font-bold uppercase tracking-wider text-xs flex items-center justify-center hover:bg-secondary hover:text-secondary-foreground transition"
              >
                View Details
              </Link>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
