/**
 * Decorative geometric strip inspired by Maasai shuka triangles.
 * A polished, layered band with alternating triangle heights, a soft cream
 * baseline, and a faint dotted underline for editorial finish.
 * Purely visual — used as a section divider beneath the header and elsewhere.
 */
export const PatternStrip = ({ className = "" }: { className?: string }) => {
  // Triangle palette: emerald, gold, terracotta, gold — Wajose brand rhythm.
  const colors = [
    "hsl(var(--secondary))",
    "hsl(var(--accent))",
    "hsl(var(--primary))",
    "hsl(var(--accent))",
    "hsl(var(--secondary))",
    "hsl(var(--primary))",
  ];

  return (
    <div
      aria-hidden
      className={`relative bg-card border-y border-border/50 ${className}`}
    >
      {/* Faint dotted baseline for editorial polish */}
      <div className="absolute inset-x-0 bottom-1 h-px border-b border-dashed border-secondary/20" />

      <div className="flex items-end justify-center gap-[3px] h-4 overflow-hidden px-2">
        {Array.from({ length: 80 }).map((_, i) => {
          const c = colors[i % colors.length];
          // Alternate heights for a playful, hand-stamped rhythm.
          const tall = i % 3 === 0;
          const h = tall ? 14 : 10;
          const w = tall ? 9 : 7;
          return (
            <div
              key={i}
              style={{
                width: 0,
                height: 0,
                borderLeft: `${w}px solid transparent`,
                borderRight: `${w}px solid transparent`,
                borderBottom: `${h}px solid ${c}`,
                filter: "drop-shadow(0 1px 0 rgba(0,0,0,0.08))",
              }}
            />
          );
        })}
      </div>
    </div>
  );
};
