import { Stethoscope } from "lucide-react";

/**
 * Brand logo placeholder.
 *
 * To swap with a custom asset, drop the file at `public/logo.png` (or import
 * an SVG) and replace the inner <svg>/<Stethoscope /> with:
 *   <img src="/logo.png" alt="Carnet de Stage" className="w-full h-full object-cover" />
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
      className={`relative grid place-items-center rounded-2xl bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shadow-lg shadow-primary/20 ring-1 ring-primary/30 ${className}`}
      style={{ width: size, height: size }}
      aria-label="Logo Carnet de Stage"
    >
      {/* Replace this inner block with <img src="/logo.png" ... /> when ready */}
      <Stethoscope
        strokeWidth={2.2}
        style={{ width: size * 0.55, height: size * 0.55 }}
      />
      <span
        className="absolute -bottom-1 -right-1 grid place-items-center rounded-full bg-accent text-accent-foreground text-[10px] font-bold shadow"
        style={{ width: size * 0.35, height: size * 0.35 }}
      >
        ﷼
      </span>
    </div>
  );
}
