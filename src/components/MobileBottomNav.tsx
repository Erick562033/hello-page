import { Home, LayoutGrid, Heart, User } from "lucide-react";
import { useCartStore } from "@/stores/cartStore";

export const MobileBottomNav = () => {
  const totalItems = useCartStore((s) => s.items.reduce((n, i) => n + i.quantity, 0));

  const items = [
    { icon: Home, label: "Home", active: true },
    { icon: LayoutGrid, label: "Soko" },
    { icon: Heart, label: "Wishlist" },
    { icon: User, label: "Account" },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-card border-t-2 border-secondary shadow-elevated">
      <div className="grid grid-cols-4">
        {items.map(({ icon: Icon, label, active }) => (
          <button
            key={label}
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
          </button>
        ))}
      </div>
    </nav>
  );
};
