import logoUrl from '@/assets/brand/koyi-logo.svg';
import { cn } from '@/lib/utils/cn';

interface LogoProps {
  className?: string;
}

/**
 * Brand lockup (mark + wordmark), sized by height — pass an `h-*` class to
 * override the default.
 *
 * Built from the delivered `Koyi_Logo-removebg-preview 1.svg`, which is kept
 * beside this as the source of record. That file is a Figma export rather than
 * a true vector: it wraps a 609×410 PNG in a `<pattern>` whose
 * `preserveAspectRatio="none"` and offset transform stretch the artwork when
 * the box is scaled, and its ink covers only 56% of the frame height, which is
 * what made earlier headers render a logo a third smaller than the `h-*` asked
 * for. This asset is the same artwork cropped to its ink and rewrapped in a
 * plain `<image>` with a matching viewBox, so `h-*` now measures real ink.
 *
 * Colour comes straight from the delivered alpha channel — the sky blue and
 * gold in the mark are the designer's values, untouched.
 *
 * Still a raster inside an SVG shell, so it has no resolution advantage over a
 * PNG; 292×128 covers 3.5× DPR at the header's `h-9`. Drop a real vector in at
 * this same path when one is delivered and nothing here needs to change.
 */
export function Logo({ className }: LogoProps) {
  return (
    <img
      src={logoUrl}
      alt="Koyi"
      width={292}
      height={128}
      decoding="async"
      className={cn('h-9 w-auto', className)}
    />
  );
}
