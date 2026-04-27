import { Link } from "react-router-dom";
import { ArrowLeft, Heart, ChevronRight, Sparkles } from "lucide-react";
import { StoreHeader } from "@/components/StoreHeader";
import { MobileBottomNav } from "@/components/MobileBottomNav";

/**
 * Wishlist — saved items page.
 * Empty state for now; ready to plug into a wishlist store later.
 */
const Wishlist = () => {
  const items: Array<{ id: string; title: string; price: number; image: string }> = [];

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0 texture-paper">
      <StoreHeader />

      <section className="container mx-auto px-4 pt-4">
        <div className="flex items-center gap-2 text-xs font-grotesk uppercase tracking-wider text-muted-foreground">
          <Link to="/" className="flex items-center gap-1 hover:text-primary transition">
            <ArrowLeft className="h-3.5 w-3.5" /> Home
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-secondary font-bold">Wishlist</span>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl md:text-4xl font-black text-secondary">
              Your <em className="not-italic text-primary">wishlist</em>
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Pieces you love, saved for later.
            </p>
          </div>
          <span className="hidden md:inline-flex items-center gap-1.5 bg-accent/20 text-secondary text-xs font-grotesk font-bold uppercase tracking-wider px-3 py-1.5 rounded-full">
            <Heart className="h-3.5 w-3.5 fill-primary text-primary" /> {items.length} saved
          </span>
        </div>
      </section>

      <main className="container mx-auto px-4 mt-6">
        {items.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-border bg-card p-10 md:p-16 text-center shadow-soft">
            <div className="mx-auto h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Heart className="h-9 w-9 text-primary" strokeWidth={2} />
            </div>
            <h2 className="font-display text-2xl md:text-3xl font-black text-secondary">
              No favourites yet
            </h2>
            <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto">
              Tap the heart on any product to save it here. We'll keep it warm until you're ready.
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 mt-5 bg-primary hover:bg-primary-dark text-primary-foreground font-grotesk font-semibold uppercase tracking-wider text-xs px-5 py-3 rounded-full transition shadow-card"
            >
              <Sparkles className="h-3.5 w-3.5" /> Start exploring
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {/* Render saved items here when wishlist store is wired */}
          </div>
        )}
      </main>

      <MobileBottomNav />
    </div>
  );
};

export default Wishlist;
