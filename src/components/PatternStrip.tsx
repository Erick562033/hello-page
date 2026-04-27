/**
 * Decorative geometric strip inspired by Maasai shuka triangles.
 * Edge-to-edge band with alternating triangle heights, a soft cream
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

  // Render plenty of triangles so the row fills any viewport (4K included).
  // Overflow-hidden trims the excess on smaller screens.
  const COUNT = 240;

  return (
    <div
      aria-hidden
      className={`relative w-full bg-card border-y border-border/50 ${className}`}
    >
      {/* Faint dotted baseline for editorial polish */}
      <div className="absolute inset-x-0 bottom-1 h-px border-b border-dashed border-secondary/20" />

      <div className="flex items-end justify-start gap-[3px] h-4 overflow-hidden w-full">
        {Array.from({ length: COUNT }).map((_, i) => {
          const c = colors[i % colors.length];
          // Alternate heights for a playful, hand-stamped rhythm.
          const tall = i % 3 === 0;
          const h = tall ? 14 : 10;
          const w = tall ? 9 : 7;
          return (
            <div
              key={i}
              className="shrink-0"
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
