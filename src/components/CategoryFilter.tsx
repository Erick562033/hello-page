import {
  Sparkles,
  Shirt,
  User,
  Baby,
  Home,
  Tag,
  Truck,
  Flame,
} from "lucide-react";

const categories = [
  { label: "All", value: "", icon: Sparkles },
  { label: "Women", value: "women", icon: Shirt },
  { label: "Men", value: "men", icon: User },
  { label: "Kids", value: "children", icon: Baby },
  { label: "Home", value: "carpets", icon: Home },
  { label: "Soko Deals", value: "", icon: Tag },
  { label: "Trending", value: "", icon: Flame },
  { label: "Free Ship", value: "", icon: Truck },
];

interface CategoryFilterProps {
  active: string;
  onChange: (value: string) => void;
}

export const CategoryFilter = ({ active, onChange }: CategoryFilterProps) => {
  return (
    <div className="bg-card rounded-2xl shadow-soft my-4 border border-border">
      <div className="flex gap-1 overflow-x-auto scrollbar-hide px-2 py-3">
        {categories.map((cat, idx) => {
          const Icon = cat.icon;
          const isActive = active === cat.value && idx < 5;
          return (
            <button
              key={`${cat.label}-${idx}`}
              onClick={() => onChange(cat.value)}
              className={`flex flex-col items-center justify-center min-w-[72px] md:min-w-[92px] py-2 px-2 rounded-xl transition-all group ${
                isActive ? "bg-primary/5" : "hover:bg-muted"
              }`}
            >
              <div
                className={`relative h-11 w-11 md:h-12 md:w-12 rounded-2xl flex items-center justify-center mb-1.5 transition-all ${
                  isActive
                    ? "bg-secondary text-accent shadow-stamp rotate-[-3deg]"
                    : "bg-muted text-secondary group-hover:bg-secondary/10"
                }`}
              >
                <Icon className="h-5 w-5 md:h-5 md:w-5" strokeWidth={2.2} />
                {isActive && (
                  <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-primary ring-2 ring-card" />
                )}
              </div>
              <span className={`text-[11px] md:text-xs font-grotesk font-semibold whitespace-nowrap ${
                isActive ? "text-primary" : "text-foreground"
              }`}>
                {cat.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
