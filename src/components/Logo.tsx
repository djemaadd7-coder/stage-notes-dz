import { Stethoscope } from "lucide-react";

/**
 * Brand logo placeholder.
 *
 * To swap with a custom asset, drop the file at `public/logo.png` (or import
 * an SVG) and replace the inner icon with:
 *   <img src="/logo.png" alt="Carnet de Stage" className="w-full h-full object-cover rounded-2xl" />
 */
export function Logo({
  size = 48,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <div
      className={`grid place-items-center rounded-2xl bg-gradient-to-br from-primary via-primary to-primary/70 text-primary-foreground shadow-lg shadow-primary/25 ring-1 ring-primary/30 ${className}`}
      style={{ width: size, height: size }}
      aria-label="Logo Carnet de Stage"
    >
      {/* Replace this line with <img src="/logo.png" ... /> when your asset is ready. */}
      <Stethoscope
        strokeWidth={2.2}
        style={{ width: size * 0.55, height: size * 0.55 }}
      />
    </div>
  );
}
