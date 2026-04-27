import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Loader2,
  ShoppingCart,
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
  MessageCircle,
  Store,
  ImageOff,
  CheckCircle2,
} from "lucide-react";
import { StoreHeader } from "@/components/StoreHeader";
import { storefrontApiRequest, STOREFRONT_PRODUCT_BY_HANDLE_QUERY } from "@/lib/shopify";
import { useCartStore } from "@/stores/cartStore";
import { toast } from "sonner";

const COLOR_SWATCHES: Record<string, string> = {
  black: "#111111", white: "#ffffff", brown: "#7a4a2b", grey: "#8a8a8a",
  gray: "#8a8a8a", red: "#c93232", blue: "#2563c9", green: "#2f8a4a",
  yellow: "#f5c33b", pink: "#e879a3", orange: "#e8772b", beige: "#d8c4a4",
  navy: "#1c2b54",
};

interface VariantNode {
  id: string;
  title: string;
  price: { amount: string; currencyCode: string };
  availableForSale: boolean;
  selectedOptions: Array<{ name: string; value: string }>;
}
interface ProductData {
  id: string;
  title: string;
  description: string;
  handle: string;
  priceRange: { minVariantPrice: { amount: string; currencyCode: string } };
  images: { edges: Array<{ node: { url: string; altText: string | null } }> };
  variants: { edges: Array<{ node: VariantNode }> };
  options: Array<{ name: string; values: string[] }>;
}

const ProductDetail = () => {
  const { handle } = useParams<{ handle: string }>();
  const [product, setProduct] = useState<ProductData | null>(null);
  const [loading, setLoading] = useState(true);
  const [imgIdx, setImgIdx] = useState(0);
  const [qty, setQty] = useState(1);
  const [favorite, setFavorite] = useState(false);
  const [selectedOpts, setSelectedOpts] = useState<Record<string, string>>({});
  const addItem = useCartStore((state) => state.addItem);
  const isCartLoading = useCartStore((state) => state.isLoading);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const data = await storefrontApiRequest(STOREFRONT_PRODUCT_BY_HANDLE_QUERY, { handle });
        const prod: ProductData | null = data?.data?.productByHandle || null;
        setProduct(prod);
        if (prod) {
          const initial: Record<string, string> = {};
          prod.options?.forEach((o) => (initial[o.name] = o.values[0]));
          setSelectedOpts(initial);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    if (handle) fetch();
  }, [handle]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <StoreHeader />
        <div className="flex items-center justify-center py-32">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <StoreHeader />
        <div className="container mx-auto px-4 py-16 text-center">
          <h2 className="font-heading text-2xl mb-4">Product not found</h2>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-primary font-semibold hover:underline"
          >
            <ArrowLeft className="h-4 w-4" /> Back to store
          </Link>
        </div>
      </div>
    );
  }

  const images = product.images.edges;
  const currentImg = images[imgIdx]?.node;

  const matchedVariant: VariantNode | undefined =
    product.variants.edges.find((v) =>
      v.node.selectedOptions.every((o) => selectedOpts[o.name] === o.value),
    )?.node || product.variants.edges[0]?.node;

  const price = matchedVariant?.price || product.priceRange.minVariantPrice;
  const original = parseFloat(price.amount) * 1.4;
  const discount = Math.round(((original - parseFloat(price.amount)) / original) * 100);
  const isColorOption = (name: string) => /colou?r/i.test(name);

  const navImg = (dir: 1 | -1) => {
    setImgIdx((i) => (i + dir + images.length) % images.length);
  };

  const handleAddToCart = async (closeAfter = false) => {
    if (!matchedVariant) return;
    for (let i = 0; i < qty; i++) {
      await addItem({
        product: { node: product },
        variantId: matchedVariant.id,
        variantTitle: matchedVariant.title,
        price: matchedVariant.price,
        quantity: 1,
        selectedOptions: matchedVariant.selectedOptions || [],
      });
    }
    toast.success(`${qty} × ${product.title} added to cart`, { position: "top-center" });
    if (closeAfter) {
      // could navigate to cart; keep on page
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-0">
      {/* Mobile-first compact header */}
      <div className="md:hidden sticky top-0 z-40 bg-card border-b border-border flex items-center justify-between px-3 h-12 shadow-soft">
        <Link
          to="/"
          className="h-9 w-9 rounded-full bg-muted flex items-center justify-center"
          aria-label="Back"
        >
          <ChevronLeft className="h-5 w-5 text-secondary" />
        </Link>
        <span className="font-display font-black text-secondary text-sm truncate px-2">
          Product Details
        </span>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setFavorite((f) => !f)}
            className="h-9 w-9 rounded-full bg-muted flex items-center justify-center"
            aria-label="Favorite"
          >
            <Heart className={`h-4 w-4 ${favorite ? "fill-primary text-primary" : "text-secondary"}`} />
          </button>
          <button className="h-9 w-9 rounded-full bg-muted flex items-center justify-center" aria-label="Share">
            <Share2 className="h-4 w-4 text-secondary" />
          </button>
        </div>
      </div>

      <div className="hidden md:block">
        <StoreHeader />
      </div>

      <main className="md:container md:mx-auto md:px-4 md:py-6">
        <Link
          to="/"
          className="hidden md:inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="mr-1 h-4 w-4" /> Back to store
        </Link>

        <div className="md:grid md:grid-cols-5 md:gap-6">
          {/* Image gallery */}
          <div className="md:col-span-2">
            <div className="relative bg-muted md:rounded-2xl overflow-hidden md:shadow-card">
              <div className="aspect-square relative">
                {currentImg ? (
                  <img
                    src={currentImg.url}
                    alt={currentImg.altText || product.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                    <ImageOff className="h-16 w-16" />
                  </div>
                )}

                {discount > 0 && (
                  <div className="absolute top-3 left-3 bg-primary text-primary-foreground text-xs font-display font-black px-2 py-1 rounded-md rotate-[-4deg] shadow-card">
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
            </div>

            {images.length > 1 && (
              <div className="flex gap-2 px-3 py-3 md:px-0 overflow-x-auto scrollbar-hide">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setImgIdx(i)}
                    className={`shrink-0 h-14 w-14 md:h-16 md:w-16 rounded-lg overflow-hidden border-2 transition ${
                      i === imgIdx ? "border-primary" : "border-transparent opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img src={img.node.url} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details column */}
          <div className="md:col-span-3 space-y-3">
            {/* Price banner */}
            <div className="bg-gradient-to-r from-primary to-primary-glow text-primary-foreground px-4 py-4 md:rounded-2xl md:shadow-card">
              <div className="flex items-baseline gap-2">
                <span className="font-display text-3xl md:text-4xl font-black leading-none">
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

            <div className="bg-card md:rounded-2xl md:shadow-card md:border md:border-border p-4 space-y-3">
              <h1 className="font-medium text-base md:text-xl text-foreground leading-snug">
                {product.title}
              </h1>

              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className="h-3.5 w-3.5 fill-accent text-accent" />
                  ))}
                  <span className="font-bold text-foreground ml-1">4.6</span>
                </span>
                <span>· 1.2K ratings</span>
                <span>· 4.8K sold</span>
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
            </div>

            {/* Variant selectors */}
            <div className="bg-card md:rounded-2xl md:shadow-card md:border md:border-border p-4 space-y-4">
              {product.options
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
                              className={`h-10 w-10 rounded-full border-2 transition ${
                                active ? "border-primary scale-110 shadow-stamp" : "border-border"
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
                            className={`min-w-[48px] px-3 h-10 rounded-md font-grotesk font-bold text-xs uppercase tracking-wider border transition ${
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
              <div className="flex items-center justify-between pt-2 border-t border-border">
                <span className="font-grotesk text-xs font-bold uppercase tracking-wider text-secondary">
                  Quantity
                </span>
                <div className="flex items-center border border-border rounded-md overflow-hidden">
                  <button
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    className="h-9 w-9 flex items-center justify-center hover:bg-muted"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="w-12 text-center font-bold">{qty}</span>
                  <button
                    onClick={() => setQty((q) => q + 1)}
                    className="h-9 w-9 flex items-center justify-center hover:bg-muted"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Seller block */}
            <div className="bg-card md:rounded-2xl md:shadow-card md:border md:border-border p-4 flex items-center gap-3">
              <div className="h-11 w-11 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center">
                <Store className="h-5 w-5 text-accent" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-display font-black text-sm text-secondary flex items-center gap-1">
                  Wajose Official Store
                  <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                </div>
                <div className="text-[11px] text-muted-foreground font-grotesk">
                  98% positive · 12K followers
                </div>
              </div>
              <button className="px-3 h-8 rounded-full border border-secondary text-secondary text-xs font-grotesk font-bold uppercase tracking-wider hover:bg-secondary hover:text-secondary-foreground transition">
                Visit
              </button>
            </div>

            {/* Description */}
            <div className="bg-card md:rounded-2xl md:shadow-card md:border md:border-border p-4">
              <h3 className="font-display font-black text-secondary text-sm uppercase tracking-wider mb-2">
                Description
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                {product.description || "No description available for this product."}
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Sticky bottom action bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-card flex items-center gap-2 p-2.5 shadow-elevated md:hidden">
        <Link
          to="/chat"
          className="h-12 w-12 rounded-xl border border-border flex flex-col items-center justify-center text-secondary"
          aria-label="Chat with us"
        >
          <MessageCircle className="h-4 w-4" />
          <span className="text-[9px] font-grotesk mt-0.5">Chat</span>
        </Link>
        <button
          onClick={() => handleAddToCart(false)}
          disabled={isCartLoading || !matchedVariant?.availableForSale}
          className="flex-1 h-12 rounded-xl border-2 border-secondary text-secondary font-grotesk font-bold uppercase tracking-wider text-xs flex items-center justify-center gap-1.5 hover:bg-secondary hover:text-secondary-foreground disabled:opacity-50 transition"
        >
          {isCartLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShoppingCart className="h-4 w-4" />}
          Add to Cart
        </button>
        <button
          onClick={() => handleAddToCart(true)}
          disabled={isCartLoading || !matchedVariant?.availableForSale}
          className="flex-1 h-12 rounded-xl bg-primary text-primary-foreground font-display font-black uppercase tracking-wider text-sm flex items-center justify-center gap-1.5 hover:bg-primary/90 disabled:opacity-50 transition shadow-card"
        >
          <Zap className="h-4 w-4" />
          Buy Now
        </button>
      </div>

      {/* Desktop sticky CTA inside main column */}
      <div className="hidden md:block container mx-auto px-4 mt-4">
        <div className="flex gap-3 max-w-md ml-auto">
          <button
            onClick={() => handleAddToCart(false)}
            disabled={isCartLoading || !matchedVariant?.availableForSale}
            className="flex-1 h-12 rounded-xl border-2 border-secondary text-secondary font-grotesk font-bold uppercase tracking-wider text-xs flex items-center justify-center gap-1.5 hover:bg-secondary hover:text-secondary-foreground disabled:opacity-50 transition"
          >
            {isCartLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShoppingCart className="h-4 w-4" />}
            Add to Cart
          </button>
          <button
            onClick={() => handleAddToCart(true)}
            disabled={isCartLoading || !matchedVariant?.availableForSale}
            className="flex-1 h-12 rounded-xl bg-primary text-primary-foreground font-display font-black uppercase tracking-wider text-sm flex items-center justify-center gap-1.5 hover:bg-primary/90 disabled:opacity-50 transition shadow-card"
          >
            <Zap className="h-4 w-4" />
            Buy Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
