import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ChevronRight,
  User,
  Package,
  Heart,
  MapPin,
  CreditCard,
  Bell,
  HelpCircle,
  LogIn,
  LogOut,
  Shield,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { StoreHeader } from "@/components/StoreHeader";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { useAuth } from "@/hooks/useAuth";

/**
 * Account — profile hub. Shows guest CTA when logged out, and the user's
 * name + sign-out when signed in. Auth is backed by Lovable Cloud.
 */
const Account = () => {
  const navigate = useNavigate();
  const { user, displayName, loading, signOut } = useAuth();

  const sections = [
    {
      title: "My Shop",
      items: [
        { icon: Package, label: "My Orders", sub: "Track, return or reorder", to: "/orders" },
        { icon: Heart, label: "Wishlist", sub: "Saved pieces", to: "/wishlist" },
        { icon: MapPin, label: "Addresses", sub: "Manage delivery spots" },
        { icon: CreditCard, label: "Payment Methods", sub: "M-Pesa, card, COD" },
      ],
    },
    {
      title: "Preferences",
      items: [
        { icon: Bell, label: "Notifications", sub: "Deals & order updates" },
        { icon: Shield, label: "Privacy & Security", sub: "Password, data" },
        { icon: HelpCircle, label: "Help Centre", sub: "We're here to help" },
      ],
    },
  ];

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out", { description: "Karibu tena soon!" });
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0 texture-paper">
      <StoreHeader />

      <section className="container mx-auto px-4 pt-4">
        <div className="flex items-center gap-2 text-xs font-grotesk uppercase tracking-wider text-muted-foreground">
          <Link to="/" className="flex items-center gap-1 hover:text-primary transition">
            <ArrowLeft className="h-3.5 w-3.5" /> Home
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-secondary font-bold">Account</span>
        </div>
      </section>

      {/* Profile card */}
      <section className="container mx-auto px-4 mt-3">
        <div className="rounded-2xl gradient-emerald text-secondary-foreground p-5 sm:p-6 md:p-7 relative overflow-hidden shadow-elevated">
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-accent/20 rounded-full blur-2xl" />
          <div className="relative flex items-center gap-3 sm:gap-4">
            <div className="h-14 w-14 sm:h-16 sm:w-16 md:h-20 md:w-20 rounded-full bg-card/15 backdrop-blur border-2 border-accent/40 flex items-center justify-center shrink-0">
              {loading ? (
                <Loader2 className="h-6 w-6 text-accent animate-spin" />
              ) : (
                <User className="h-7 w-7 sm:h-8 sm:w-8 md:h-10 md:w-10 text-accent" strokeWidth={2} />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-display text-xl sm:text-2xl md:text-3xl font-black leading-tight truncate">
                Karibu,{" "}
                <em className="not-italic text-accent">
                  {loading ? "..." : user ? displayName : "guest"}
                </em>
              </div>
              <p className="text-[11px] sm:text-xs md:text-sm text-white/85 mt-1 truncate">
                {user
                  ? user.email
                  : "Sign in to track orders, save favourites and check out faster."}
              </p>
            </div>
          </div>

          <div className="relative flex flex-wrap gap-2 mt-4">
            {user ? (
              <button
                onClick={handleSignOut}
                className="bg-white/15 backdrop-blur hover:bg-white/25 border border-white/40 text-white font-grotesk font-semibold uppercase tracking-wider text-xs px-4 py-2.5 rounded-full transition flex items-center gap-1.5"
              >
                <LogOut className="h-3.5 w-3.5" /> Sign out
              </button>
            ) : (
              <>
                <button
                  onClick={() => navigate("/auth")}
                  className="bg-primary hover:bg-primary-dark text-primary-foreground font-grotesk font-semibold uppercase tracking-wider text-xs px-4 py-2.5 rounded-full transition shadow-card flex items-center gap-1.5"
                >
                  <LogIn className="h-3.5 w-3.5" /> Sign in
                </button>
                <button
                  onClick={() => navigate("/auth")}
                  className="bg-white/15 backdrop-blur hover:bg-white/25 border border-white/40 text-white font-grotesk font-semibold uppercase tracking-wider text-xs px-4 py-2.5 rounded-full transition"
                >
                  Create account
                </button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Settings list */}
      <main className="container mx-auto px-4 mt-5 space-y-5">
        {sections.map((sec) => (
          <div key={sec.title}>
            <h2 className="font-grotesk text-[11px] font-bold uppercase tracking-[0.22em] text-muted-foreground mb-2 px-1">
              {sec.title}
            </h2>
            <div className="bg-card rounded-2xl border border-border shadow-soft overflow-hidden divide-y divide-border">
              {sec.items.map((item) => {
                const Inner = (
                  <>
                    <div className="h-10 w-10 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center shrink-0 border border-secondary/15">
                      <item.icon className="h-[18px] w-[18px]" strokeWidth={2.2} />
                    </div>
                    <div className="flex-1 min-w-0 leading-tight">
                      <div className="text-sm font-display font-bold text-secondary truncate">{item.label}</div>
                      <div className="text-[11px] text-muted-foreground truncate">{item.sub}</div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                  </>
                );
                return "to" in item && item.to ? (
                  <Link key={item.label} to={item.to} className="flex items-center gap-3 px-4 py-3.5 hover:bg-muted/40 transition">
                    {Inner}
                  </Link>
                ) : (
                  <button key={item.label} className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-muted/40 transition text-left">
                    {Inner}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        <p className="text-center text-[11px] text-muted-foreground font-grotesk pt-2">
          Wajose Smart Wear · v1.0 · Made in Kenya 🇰🇪
        </p>
      </main>

      <MobileBottomNav />
    </div>
  );
};

export default Account;
