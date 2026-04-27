import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Loader2, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StoreHeader } from "@/components/StoreHeader";
import { storefrontApiRequest, STOREFRONT_PRODUCT_BY_HANDLE_QUERY } from "@/lib/shopify";
import { useCartStore } from "@/stores/cartStore";
import { toast } from "sonner";

const ProductDetail = () => {
  const { handle } = useParams<{ handle: string }>();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariantIdx, setSelectedVariantIdx] = useState(0);
  const [selectedImage, setSelectedImage] = useState(0);
  const addItem = useCartStore(state => state.addItem);
  const isCartLoading = useCartStore(state => state.isLoading);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const data = await storefrontApiRequest(STOREFRONT_PRODUCT_BY_HANDLE_QUERY, { handle });
        setProduct(data?.data?.productByHandle);
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
          <Link to="/">
            <Button variant="outline"><ArrowLeft className="mr-2 h-4 w-4" />Back to store</Button>
          </Link>
        </div>
      </div>
    );
  }

  const images = product.images.edges;
  const variants = product.variants.edges;
  const selectedVariant = variants[selectedVariantIdx]?.node;

  const handleAddToCart = async () => {
    if (!selectedVariant) return;
    await addItem({
      product: { node: product },
      variantId: selectedVariant.id,
      variantTitle: selectedVariant.title,
      price: selectedVariant.price,
      quantity: 1,
      selectedOptions: selectedVariant.selectedOptions || [],
    });
    toast.success(`${product.title} added to cart`, { position: "top-center" });
  };

  return (
    <div className="min-h-screen bg-background">
      <StoreHeader />
      <main className="container mx-auto px-4 py-8">
        <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="mr-1 h-4 w-4" /> Back to store
        </Link>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {/* Images */}
          <div className="space-y-4">
            <div className="aspect-square overflow-hidden rounded-xl bg-muted">
              {images[selectedImage]?.node ? (
                <img
                  src={images[selectedImage].node.url}
                  alt={images[selectedImage].node.altText || product.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                  <ShoppingCart className="h-16 w-16" />
                </div>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {images.map((img: any, i: number) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`w-16 h-16 rounded-lg overflow-hidden border-2 flex-shrink-0 transition-colors ${
                      i === selectedImage ? "border-primary" : "border-transparent"
                    }`}
                  >
                    <img src={img.node.url} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="space-y-6">
            <div>
              <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground">{product.title}</h1>
              <p className="mt-4 text-2xl font-semibold text-primary">
                {selectedVariant?.price.currencyCode} {parseFloat(selectedVariant?.price.amount || "0").toFixed(2)}
              </p>
            </div>

            <p className="text-muted-foreground leading-relaxed">{product.description}</p>

            {/* Variant selector */}
            {variants.length > 1 && (
              <div className="space-y-3">
                <label className="text-sm font-medium text-foreground">Variant</label>
                <div className="flex flex-wrap gap-2">
                  {variants.map((v: any, i: number) => (
                    <Button
                      key={v.node.id}
                      variant={i === selectedVariantIdx ? "default" : "outline"}
                      size="sm"
                      className="rounded-full"
                      onClick={() => setSelectedVariantIdx(i)}
                      disabled={!v.node.availableForSale}
                    >
                      {v.node.title}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            <Button
              size="lg"
              className="w-full rounded-full text-base"
              onClick={handleAddToCart}
              disabled={isCartLoading || !selectedVariant?.availableForSale}
            >
              {isCartLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Add to Cart
                </>
              )}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProductDetail;
