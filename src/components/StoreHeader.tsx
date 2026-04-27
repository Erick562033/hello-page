import { Link } from "react-router-dom";
import { Search, MapPin, Heart, User, Phone, LogIn } from "lucide-react";
import { CartDrawer } from "./CartDrawer";
import { BrandMark } from "./BrandMark";
import { PatternStrip } from "./PatternStrip";
import { useAuth } from "@/hooks/useAuth";

export const StoreHeader = () => {
  const { user, displayName } = useAuth();
  const firstName = user && displayName ? displayName.split(" ")[0].slice(0, 12) : null;
  const initial = firstName?.[0]?.toUpperCase() ?? "";

  return (
    <>
      {/* Sticky header — utility bar + brand bar only */}
      <header className="sticky top-0 z-50 shadow-card">
        {/* Top utility bar — deep emerald (desktop only) */}
        <div className="hidden md:block gradient-emerald text-secondary-foreground text-xs">
          <div className="container mx-auto px-4 h-9 flex items-center justify-between">
            <div className="flex items-center gap-4 opacity-95">
              <span className="flex items-center gap-1.5">
                <MapPin className="h-3 w-3 text-accent" />
                <span>Delivered countrywide · Karibu Kenya 🇰🇪</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Phone className="h-3 w-3 text-accent" />
                <span>0700 000 000</span>
              </span>
            </div>
            <div className="flex items-center gap-5 opacity-95">
              <a href="#" className="hover:text-accent transition-colors">Sell on Wajose</a>
              <a href="#" className="hover:text-accent transition-colors">Help Centre</a>
              <a href="#" className="hover:text-accent transition-colors">Track Order</a>
              {firstName ? (
                <span className="text-accent">Hi, <strong>{firstName}</strong> 👋</span>
              ) : (
                <Link to="/auth" className="hover:text-accent transition-colors flex items-center gap-1">
                  <LogIn className="h-3 w-3" /> Sign in
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Main brand bar — warm cream */}
        <div className="bg-card border-b border-border/60">
          <div className="container mx-auto px-2.5 sm:px-4 py-2 md:py-3 flex items-center gap-2 md:gap-5">
            <Link to="/" className="flex items-center gap-1.5 sm:gap-2.5 shrink-0 group">
              <BrandMark size={32} className="sm:!w-9 sm:!h-9 md:!w-11 md:!h-11 transition-transform group-hover:rotate-6" />
              <div className="leading-none">
                <div className="font-display text-base sm:text-xl md:text-2xl font-black tracking-tight text-secondary">
                  Wajose<span className="text-primary">.</span>
                </div>
                <div className="hidden md:block font-grotesk text-[10px] uppercase tracking-[0.22em] text-muted-foreground mt-1">
                  Smart · Wear · Home
                </div>
              </div>
            </Link>

            {/* Search — pill with stamped style */}
            <div className="flex-1 min-w-0 max-w-3xl">
              <div className="flex bg-background rounded-full overflow-hidden border-2 border-secondary shadow-soft focus-within:border-primary transition-colors">
                <input
                  type="search"
                  placeholder="Search ankara, oxford, rugs..."
                  className="flex-1 min-w-0 px-3 sm:px-4 md:px-5 py-1.5 sm:py-2 md:py-2.5 text-xs sm:text-sm text-foreground bg-transparent outline-none placeholder:text-muted-foreground/70"
                />
                <button
                  aria-label="Search"
                  className="bg-secondary hover:bg-secondary-light text-secondary-foreground px-2.5 sm:px-4 md:px-6 flex items-center justify-center transition-colors gap-1.5 font-grotesk text-xs uppercase tracking-wider shrink-0"
                >
                  <Search className="h-4 w-4" strokeWidth={2.5} />
                  <span className="hidden md:inline">Find</span>
                </button>
              </div>
            </div>

            {/* Account + Wishlist (desktop) */}
            <div className="hidden md:flex items-center gap-1 text-foreground">
              <Link
                to={firstName ? "/account" : "/auth"}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-full hover:bg-muted transition group"
              >
                {firstName ? (
                  <>
                    <span className="h-8 w-8 rounded-full gradient-emerald text-accent flex items-center justify-center font-display font-black text-sm shadow-card">
                      {initial}
                    </span>
                    <div className="leading-tight">
                      <div className="text-[10px] text-muted-foreground">Karibu</div>
                      <div className="text-xs font-display font-bold text-secondary truncate max-w-[90px]">{firstName}</div>
                    </div>
                  </>
                ) : (
                  <>
                    <User className="h-5 w-5 text-secondary" />
                    <span className="text-xs font-medium">Sign in</span>
                  </>
                )}
              </Link>
              <Link to="/wishlist" className="flex flex-col items-center px-3 py-1.5 rounded-lg hover:bg-muted transition">
                <Heart className="h-5 w-5 text-secondary" />
                <span className="text-[10px] mt-0.5 font-medium">Wishlist</span>
              </Link>
            </div>

            {/* Mobile profile pill */}
            {firstName && (
              <Link
                to="/account"
                className="md:hidden h-9 w-9 rounded-full gradient-emerald text-accent flex items-center justify-center font-display font-black text-sm shadow-card shrink-0"
                aria-label={`${firstName} — account`}
              >
                {initial}
              </Link>
            )}

            <CartDrawer />
          </div>
        </div>
      </header>

      {/* Pattern strip — NOT sticky, scrolls with the page */}
      <PatternStrip />
    </>
  );
};
