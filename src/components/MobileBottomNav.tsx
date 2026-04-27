import { Home, LayoutGrid, Heart, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useCartStore } from "@/stores/cartStore";
import { useAuth } from "@/hooks/useAuth";

/**
 * Mobile bottom navigation. Each tab routes to a real page so it works
 * like a native app shell. The active tab is derived from the URL.
 */
export const MobileBottomNav = () => {
  const totalItems = useCartStore((s) => s.items.reduce((n, i) => n + i.quantity, 0));
  const { pathname } = useLocation();
  const { user, displayName } = useAuth();

  const isLoggedIn = Boolean(user && displayName);
  const accountLabel = isLoggedIn ? displayName!.split(" ")[0].slice(0, 8) : "Account";

  const items = [
    { icon: Home, label: "Home", to: "/" },
    { icon: LayoutGrid, label: "Soko", to: "/soko" },
    { icon: Heart, label: "Wishlist", to: "/wishlist" },
    { icon: User, label: isLoggedIn ? "Profile" : accountLabel, to: "/account" },
  ];

  const isActive = (to: string) => (to === "/" ? pathname === "/" : pathname.startsWith(to));

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-card border-t-2 border-secondary shadow-elevated">
      <div className="grid grid-cols-4">
        {items.map(({ icon: Icon, label, to }) => {
          const active = isActive(to);
          return (
            <Link
              key={label}
              to={to}
              className={`relative flex flex-col items-center justify-center py-2.5 gap-1 transition-colors ${
                active ? "text-primary" : "text-secondary/70"
              }`}
            >
              <div className={`relative ${active ? "bg-secondary text-accent rounded-xl p-1.5 -mt-4 shadow-stamp" : ""}`}>
                <Icon className="h-5 w-5" strokeWidth={2.2} />
              </div>
              <span className="text-[10px] font-grotesk font-bold uppercase tracking-wider">{label}</span>
              {label === "Wishlist" && totalItems > 0 && (
                <span className="absolute top-1 right-1/4 h-4 min-w-4 px-1 rounded-full bg-primary text-primary-foreground text-[9px] font-bold flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
