interface BrandMarkProps {
  size?: number;
  className?: string;
}

/**
 * Custom Wajose monogram: a hand-drawn "W" inside a stamped circle
 * with a small sun motif — distinctive and ownable.
 */
export const BrandMark = ({ size = 40, className = "" }: BrandMarkProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-label="Wajose"
  >
    {/* Outer stamped circle */}
    <circle cx="32" cy="32" r="29" fill="hsl(var(--accent))" />
    <circle
      cx="32"
      cy="32"
      r="27"
      fill="none"
      stroke="hsl(var(--secondary))"
      strokeWidth="1.5"
      strokeDasharray="2 3"
    />
    {/* Sun rays at top */}
    {[...Array(5)].map((_, i) => {
      const angle = -90 + (i - 2) * 12;
      const rad = (angle * Math.PI) / 180;
      const x1 = 32 + Math.cos(rad) * 18;
      const y1 = 32 + Math.sin(rad) * 18;
      const x2 = 32 + Math.cos(rad) * 22;
      const y2 = 32 + Math.sin(rad) * 22;
      return (
        <line
          key={i}
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke="hsl(var(--secondary))"
          strokeWidth="2"
          strokeLinecap="round"
        />
      );
    })}
    {/* Hand-drawn "W" */}
    <path
      d="M16 28 L23 46 L29 32 L35 46 L42 28"
      stroke="hsl(var(--secondary))"
      strokeWidth="3.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    {/* Dot accent */}
    <circle cx="48" cy="22" r="2" fill="hsl(var(--primary))" />
  </svg>
);
