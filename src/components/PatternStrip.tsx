/**
 * Decorative geometric strip inspired by Maasai shuka triangles.
 * Used as a section divider — purely visual.
 */
export const PatternStrip = ({ className = "" }: { className?: string }) => (
  <div className={`flex items-stretch h-2.5 overflow-hidden ${className}`} aria-hidden>
    {Array.from({ length: 60 }).map((_, i) => {
      const colors = ["hsl(var(--secondary))", "hsl(var(--accent))", "hsl(var(--primary))", "hsl(var(--accent))"];
      const c = colors[i % colors.length];
      return (
        <div
          key={i}
          style={{
            width: 0,
            height: 0,
            borderLeft: "8px solid transparent",
            borderRight: "8px solid transparent",
            borderBottom: `10px solid ${c}`,
            marginRight: -2,
          }}
        />
      );
    })}
  </div>
);
