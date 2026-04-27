import { useState } from "react";
import { Shirt, User, Baby, Home, ChevronDown } from "lucide-react";

interface MegaMenuProps {
  onSelect: (value: string) => void;
}

const menus = [
  {
    key: "women",
    label: "Women",
    icon: Shirt,
    columns: [
      { title: "Clothing", items: ["Ankara Dresses", "Tops & Blouses", "Skirts", "Trousers", "Jumpsuits"] },
      { title: "Footwear", items: ["Heels", "Sandals", "Sneakers", "Boots"] },
      { title: "Accessories", items: ["Handbags", "Jewellery", "Headwraps", "Belts"] },
    ],
  },
  {
    key: "men",
    label: "Men",
    icon: User,
    columns: [
      { title: "Clothing", items: ["Shirts", "T-Shirts", "Trousers", "Suits", "Jackets"] },
      { title: "Footwear", items: ["Oxford Shoes", "Loafers", "Sneakers", "Sandals"] },
      { title: "Accessories", items: ["Watches", "Wallets", "Belts", "Caps"] },
    ],
  },
  {
    key: "children",
    label: "Kids",
    icon: Baby,
    columns: [
      { title: "Boys", items: ["Tops", "Shorts", "Shoes", "Sets"] },
      { title: "Girls", items: ["Dresses", "Skirts", "Shoes", "Sets"] },
      { title: "Baby", items: ["Bodysuits", "Sleepwear", "Bibs", "Booties"] },
    ],
  },
  {
    key: "carpets",
    label: "Carpets & Door Mats",
    icon: Home,
    columns: [
      { title: "Carpets", items: ["Living Room", "Bedroom", "Shaggy", "Persian Style"] },
      { title: "Door Mats", items: ["Coir Mats", "Rubber Mats", "Welcome Mats"] },
      { title: "Runners", items: ["Hallway", "Kitchen", "Stair Runners"] },
    ],
  },
];

export const MegaMenu = ({ onSelect }: MegaMenuProps) => {
  const [open, setOpen] = useState<string | null>(null);

  return (
    <div className="bg-card border-b border-border/60 shadow-soft relative z-40">
      <div className="container mx-auto px-4">
        <nav
          className="hidden md:flex items-center gap-1"
          onMouseLeave={() => setOpen(null)}
        >
          {menus.map((menu) => {
            const Icon = menu.icon;
            const isOpen = open === menu.key;
            return (
              <div
                key={menu.key}
                className="relative"
                onMouseEnter={() => setOpen(menu.key)}
              >
                <button
                  onClick={() => {
                    onSelect(menu.key);
                    setOpen(isOpen ? null : menu.key);
                  }}
                  className={`flex items-center gap-2 px-4 py-3 font-grotesk font-bold text-sm uppercase tracking-wider transition-colors ${
                    isOpen
                      ? "text-primary"
                      : "text-secondary hover:text-primary"
                  }`}
                >
                  <Icon className="h-4 w-4" strokeWidth={2.4} />
                  {menu.label}
                  <ChevronDown
                    className={`h-3.5 w-3.5 transition-transform ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="absolute left-0 top-full w-[640px] bg-card border border-border rounded-b-2xl shadow-elevated p-6 grid grid-cols-3 gap-6 animate-in fade-in slide-in-from-top-2 duration-150">
                    {menu.columns.map((col) => (
                      <div key={col.title}>
                        <h4 className="font-display text-sm font-black text-primary mb-2 uppercase tracking-wider">
                          {col.title}
                        </h4>
                        <ul className="space-y-1.5">
                          {col.items.map((item) => (
                            <li key={item}>
                              <button
                                onClick={() => {
                                  onSelect(menu.key);
                                  setOpen(null);
                                }}
                                className="text-sm text-foreground hover:text-primary hover:translate-x-0.5 transition-all text-left font-medium"
                              >
                                {item}
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Mobile: horizontal pills */}
        <div className="md:hidden flex gap-2 overflow-x-auto scrollbar-hide py-2.5">
          {menus.map((menu) => {
            const Icon = menu.icon;
            return (
              <button
                key={menu.key}
                onClick={() => onSelect(menu.key)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted text-secondary font-grotesk font-bold text-xs uppercase tracking-wider whitespace-nowrap hover:bg-secondary hover:text-secondary-foreground transition-colors"
              >
                <Icon className="h-3.5 w-3.5" strokeWidth={2.4} />
                {menu.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
