import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ShoppingCart,
  Loader2,
  X,
  ImageOff,
  Star,
  Truck,
  Shield,
  Heart,
  Share2,
  ChevronLeft,
  ChevronRight,
  Plus,
  Minus,
  Zap,
} from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useCartStore, type ShopifyProduct } from "@/stores/cartStore";
import { toast } from "sonner";

interface QuickViewModalProps {
  product: ShopifyProduct | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const COLOR_SWATCHES: Record<string, string> = {
  black: "#111111", white: "#ffffff", brown: "#7a4a2b", grey: "#8a8a8a",
  gray: "#8a8a8a", red: "#c93232", blue: "#2563c9", green: "#2f8a4a",
  yellow: "#f5c33b", pink: "#e879a3", orange: "#e8772b", beige: "#d8c4a4",
  navy: "#1c2b54",
};

export const QuickViewModal = ({ product, open, onOpenChange }: QuickViewModalProps) => {
  const addItem = useCartStore((s) => s.addItem);
  const isLoading = useCartStore((s) => s.isLoading);

  const [imgIdx, setImgIdx] = useState(0);
  const [qty, setQty] = useState(1);
  const [selectedOpts, setSelectedOpts] = useState<Record<string, string>>({});
  const [favorite, setFavorite] = useState(false);

  useEffect(() => {
    if (product) {
      setImgIdx(0);
      setQty(1);
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

  const matchedVariant =
    node.variants.edges.find((v) =>
      v.node.selectedOptions.every((o) => selectedOpts[o.name] === o.value),
    )?.node || node.variants.edges[0]?.node;

  const price = matchedVariant?.price || node.priceRange.minVariantPrice;
  const original = parseFloat(price.amount) * 1.35;
  const discount = Math.round(((original - parseFloat(price.amount)) / original) * 100);

  const isColorOption = (name: string) => /colou?r/i.test(name);

  const handleAdd = async (closeAfter = true) => {
    if (!matchedVariant) return;
    for (let i = 0; i < qty; i++) {
      await addItem({
        product,
        variantId: matchedVariant.id,
        variantTitle: matchedVariant.title,
        price: matchedVariant.price,
        quantity: 1,
        selectedOptions: matchedVariant.selectedOptions || [],
      });
    }
    toast.success(`${qty} × ${node.title} added`, { position: "top-center" });
    if (closeAfter) onOpenChange(false);
  };

  const navImg = (dir: 1 | -1) => {
    setImgIdx((i) => (i + dir + images.length) % images.length);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="p-0 gap-0 bg-card border-0 overflow-hidden
                   w-screen h-[100dvh] max-w-none rounded-none translate-x-0 translate-y-0 left-0 top-0
                   sm:w-[95vw] sm:max-w-3xl sm:h-auto sm:max-h-[90vh] sm:rounded-2xl sm:left-[50%] sm:top-[50%] sm:translate-x-[-50%] sm:translate-y-[-50%]
                   flex flex-col"
      >
        {/* Top action bar (mobile-app style) */}
        <div className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-3 py-2.5 bg-gradient-to-b from-black/40 to-transparent sm:bg-transparent">
          <button
            onClick={() => onOpenChange(false)}
            className="h-9 w-9 rounded-full bg-card/90 backdrop-blur shadow-card flex items-center justify-center"
            aria-label="Close"
          >
            <X className="h-4 w-4 text-secondary" />
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFavorite((f) => !f)}
              className="h-9 w-9 rounded-full bg-card/90 backdrop-blur shadow-card flex items-center justify-center"
              aria-label="Favorite"
            >
              <Heart
                className={`h-4 w-4 ${favorite ? "fill-primary text-primary" : "text-secondary"}`}
              />
            </button>
            <button
              className="h-9 w-9 rounded-full bg-card/90 backdrop-blur shadow-card flex items-center justify-center"
              aria-label="Share"
            >
              <Share2 className="h-4 w-4 text-secondary" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto sm:grid sm:grid-cols-2 sm:gap-0 sm:overflow-hidden">
          {/* Image gallery */}
          <div className="relative bg-muted sm:h-full">
            <div className="aspect-square relative overflow-hidden">
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

              {discount > 0 && (
                <div className="absolute top-14 left-3 bg-primary text-primary-foreground text-xs font-display font-black px-2 py-1 rounded-md rotate-[-4deg] shadow-card">
                  −{discount}% OFF
                </div>
              )}

              {images.length > 1 && (
                <>
                  <button
                    onClick={() => navImg(-1)}
                    className="absolute left-2 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-card/80 backdrop-blur flex items-center justify-center shadow-card"
                    aria-label="Previous"
                  >
                    <ChevronLeft className="h-4 w-4 text-secondary" />
                  </button>
                  <button
                    onClick={() => navImg(1)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-card/80 backdrop-blur flex items-center justify-center shadow-card"
                    aria-label="Next"
                  >
                    <ChevronRight className="h-4 w-4 text-secondary" />
                  </button>

                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/60 text-white text-[11px] font-grotesk px-2 py-0.5 rounded-full">
                    {imgIdx + 1} / {images.length}
                  </div>
                </>
              )}
            </div>

            {images.length > 1 && (
              <div className="hidden sm:flex gap-2 p-3 overflow-x-auto bg-card border-t border-border">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setImgIdx(i)}
                    className={`shrink-0 h-14 w-14 rounded-lg overflow-hidden border-2 transition ${
                      i === imgIdx
                        ? "border-primary"
                        : "border-transparent opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img src={img.node.url} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="bg-card sm:overflow-y-auto">
            {/* Price block — Kilimall/Jumia red banner */}
            <div className="bg-gradient-to-r from-primary to-primary-glow text-primary-foreground px-4 py-3">
              <div className="flex items-baseline gap-2">
                <span className="font-display text-2xl sm:text-3xl font-black leading-none">
                  KSh {parseFloat(price.amount).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </span>
                <span className="text-sm line-through opacity-75">
                  KSh {original.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1.5 text-[11px] font-grotesk uppercase tracking-wider">
                <span className="bg-accent text-accent-foreground px-1.5 py-0.5 rounded font-bold">
                  Flash Sale
                </span>
                <span className="opacity-90">Ends in 04:23:18</span>
              </div>
            </div>

            <div className="p-4 space-y-4">
              <h2 className="font-medium text-base sm:text-lg leading-snug text-foreground line-clamp-3">
                {node.title}
              </h2>

              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <span className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className="h-3.5 w-3.5 fill-accent text-accent" />
                    ))}
                    <span className="font-bold text-foreground ml-1">4.6</span>
                  </span>
                  <span>· 1.2K ratings</span>
                  <span>· 4.8K sold</span>
                </div>
              </div>

              {/* Trust badges */}
              <div className="grid grid-cols-3 gap-2 text-[11px]">
                <div className="bg-muted rounded-lg p-2 text-center">
                  <Truck className="h-4 w-4 text-success mx-auto mb-0.5" />
                  <div className="font-grotesk font-bold text-foreground">Free Ship</div>
                  <div className="text-muted-foreground text-[10px]">over KSh 500</div>
                </div>
                <div className="bg-muted rounded-lg p-2 text-center">
                  <Shield className="h-4 w-4 text-secondary mx-auto mb-0.5" />
                  <div className="font-grotesk font-bold text-foreground">7-Day</div>
                  <div className="text-muted-foreground text-[10px]">Returns</div>
                </div>
                <div className="bg-muted rounded-lg p-2 text-center">
                  <Zap className="h-4 w-4 text-primary mx-auto mb-0.5" />
                  <div className="font-grotesk font-bold text-foreground">Fast</div>
                  <div className="text-muted-foreground text-[10px]">2-3 days</div>
                </div>
              </div>

              {/* Variant options */}
              {node.options
                ?.filter((o) => o.values.length > 1 || o.name.toLowerCase() !== "title")
                .map((opt) => (
                  <div key={opt.name}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-grotesk text-xs font-bold uppercase tracking-wider text-secondary">
                        {opt.name}: <span className="text-primary normal-case">{selectedOpts[opt.name]}</span>
                      </span>
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
                                active
                                  ? "border-primary scale-110 shadow-stamp"
                                  : "border-border"
                              }`}
                              style={{
                                backgroundColor:
                                  COLOR_SWATCHES[val.toLowerCase()] || val.toLowerCase(),
                              }}
                            />
                          );
                        }
                        return (
                          <button
                            key={val}
                            onClick={() => setSelectedOpts((s) => ({ ...s, [opt.name]: val }))}
                            className={`min-w-[44px] px-3 h-9 rounded-md font-grotesk font-bold text-xs uppercase tracking-wider border transition ${
                              active
                                ? "border-primary bg-primary/10 text-primary"
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

              {/* Quantity */}
              <div className="flex items-center justify-between">
                <span className="font-grotesk text-xs font-bold uppercase tracking-wider text-secondary">
                  Quantity
                </span>
                <div className="flex items-center border border-border rounded-md overflow-hidden">
                  <button
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    className="h-8 w-8 flex items-center justify-center hover:bg-muted"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="w-10 text-center font-bold text-sm">{qty}</span>
                  <button
                    onClick={() => setQty((q) => q + 1)}
                    className="h-8 w-8 flex items-center justify-center hover:bg-muted"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <Link
                to={`/product/${node.handle}`}
                onClick={() => onOpenChange(false)}
                className="block text-center text-xs text-primary font-semibold hover:underline pt-1"
              >
                View full product details →
              </Link>

              {/* Spacer for sticky bar */}
              <div className="h-16 sm:h-0" />
            </div>
          </div>
        </div>

        {/* Sticky bottom action bar — like mobile shopping app */}
        <div className="border-t border-border bg-card flex items-center gap-2 p-2.5 shadow-elevated">
          <button
            onClick={() => handleAdd(false)}
            disabled={isLoading || !matchedVariant?.availableForSale}
            className="flex-1 h-12 rounded-xl border-2 border-secondary text-secondary font-grotesk font-bold uppercase tracking-wider text-xs flex items-center justify-center gap-1.5 hover:bg-secondary hover:text-secondary-foreground disabled:opacity-50 transition"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShoppingCart className="h-4 w-4" />}
            Add to Cart
          </button>
          <button
            onClick={() => handleAdd(true)}
            disabled={isLoading || !matchedVariant?.availableForSale}
            className="flex-1 h-12 rounded-xl bg-primary text-primary-foreground font-display font-black uppercase tracking-wider text-sm flex items-center justify-center gap-1.5 hover:bg-primary/90 disabled:opacity-50 transition shadow-card"
          >
            <Zap className="h-4 w-4" strokeWidth={2.4} />
            Buy Now
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
