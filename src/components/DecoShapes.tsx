// Playful confetti-style decorative shapes that scroll with the page.
// Sits between the header and the hero. Pure decoration — aria-hidden.
export const DecoShapes = () => {
  return (
    <div
      aria-hidden
      className="container mx-auto px-4 pt-3 pb-1 select-none pointer-events-none"
    >
      <div className="relative h-7 md:h-9 overflow-hidden">
        {/* Dotted baseline rule */}
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 border-t-2 border-dashed border-secondary/20" />

        {/* Floating shape lineup */}
        <div className="relative flex items-center justify-between gap-3 h-full">
          {/* Terracotta circle */}
          <span className="h-3.5 w-3.5 md:h-4 md:w-4 rounded-full bg-primary shadow-soft animate-pulse" />
          {/* Gold square tilted */}
          <span className="h-3 w-3 md:h-3.5 md:w-3.5 bg-accent rotate-45 shadow-soft" />
          {/* Emerald pill */}
          <span className="h-2 w-7 md:h-2.5 md:w-9 rounded-full bg-secondary" />
          {/* Hollow ring */}
          <span className="h-4 w-4 md:h-5 md:w-5 rounded-full border-2 border-primary" />
          {/* Mini gold dots cluster */}
          <span className="flex gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            <span className="h-1.5 w-1.5 rounded-full bg-accent/70" />
            <span className="h-1.5 w-1.5 rounded-full bg-accent/40" />
          </span>
          {/* Triangle (emerald) */}
          <span
            className="block h-0 w-0"
            style={{
              borderLeft: "7px solid transparent",
              borderRight: "7px solid transparent",
              borderBottom: "11px solid hsl(var(--secondary))",
            }}
          />
          {/* Cream bar with primary outline */}
          <span className="h-2.5 w-10 md:w-14 rounded-sm bg-card border border-primary/40" />
          {/* Plus / cross mark */}
          <span className="relative h-4 w-4">
            <span className="absolute inset-x-0 top-1/2 h-0.5 -translate-y-1/2 bg-secondary" />
            <span className="absolute inset-y-0 left-1/2 w-0.5 -translate-x-1/2 bg-secondary" />
          </span>
          {/* Big terracotta ring */}
          <span className="h-4 w-4 md:h-5 md:w-5 rounded-full border-[3px] border-primary/70" />
          {/* Gold half-moon */}
          <span className="h-3.5 w-3.5 md:h-4 md:w-4 rounded-full bg-accent [clip-path:inset(0_0_0_50%)]" />
          {/* Wavy emerald dash */}
          <span className="h-1 w-8 md:w-10 rounded-full bg-secondary/70" />
          {/* Small primary diamond */}
          <span className="h-2.5 w-2.5 bg-primary rotate-45" />
        </div>
      </div>
    </div>
  );
};
