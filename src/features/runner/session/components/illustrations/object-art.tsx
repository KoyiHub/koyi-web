import type { ObjectArtKey } from '@/features/runner/session/fln-session-fixture';
import { cn } from '@/lib/utils/cn';

/**
 * Flat-vector objects that appear inside answer tiles and counting groups.
 *
 * Drawn inline rather than shipped as files so the assessment is complete with
 * no binary assets. Every one is decorative: the option's own text label
 * carries the meaning for screen readers, so these are `aria-hidden`.
 *
 * Each shape is authored on a 64×64 grid and scaled by the `className` the
 * caller passes, so one drawing serves a 28px tile icon and a 56px group item.
 */

interface ArtProps {
  className?: string | undefined;
}

function Frame({ className, children }: ArtProps & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className={cn('size-full', className)}
    >
      {children}
    </svg>
  );
}

function BallArt(props: ArtProps) {
  return (
    <Frame {...props}>
      <circle cx="32" cy="32" r="22" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1.5" />
      <path d="M32 10a22 22 0 0 1 0 44 30 30 0 0 0 0-44Z" fill="#ef4444" />
      <path d="M32 10a22 22 0 0 0 0 44 30 30 0 0 1 0-44Z" fill="#3b82f6" />
      <path d="M32 10c6 8 6 36 0 44" stroke="#facc15" strokeWidth="6" strokeLinecap="round" />
      <circle cx="32" cy="32" r="22" stroke="#94a3b8" strokeWidth="1.5" />
    </Frame>
  );
}

function AppleArt(props: ArtProps) {
  return (
    <Frame {...props}>
      <path
        d="M32 18c-4-4-12-4-15 2-3 6-2 16 3 24 3 5 7 8 12 8s9-3 12-8c5-8 6-18 3-24-3-6-11-6-15-2Z"
        fill="#dc2626"
      />
      <path d="M32 18c-3-3-8-4-11-1 4 0 8 2 11 5Z" fill="#f87171" />
      <path d="M32 18v-6" stroke="#7c4a2d" strokeWidth="3" strokeLinecap="round" />
      <path d="M33 13c4-5 9-5 11-4 0 4-4 8-11 8Z" fill="#22c55e" />
    </Frame>
  );
}

function DogArt(props: ArtProps) {
  return (
    <Frame {...props}>
      <path d="M12 22c-3-8 0-14 4-14s8 6 8 12Z" fill="#a16207" />
      <path d="M52 22c3-8 0-14-4-14s-8 6-8 12Z" fill="#a16207" />
      <ellipse cx="32" cy="34" rx="20" ry="19" fill="#d9a441" />
      <ellipse cx="32" cy="42" rx="11" ry="9" fill="#fde9c8" />
      <circle cx="24" cy="31" r="3" fill="#3f2a13" />
      <circle cx="40" cy="31" r="3" fill="#3f2a13" />
      <ellipse cx="32" cy="38" rx="4" ry="3" fill="#3f2a13" />
      <path d="M32 41v4M32 45c-2 2-5 2-6 0M32 45c2 2 5 2 6 0" stroke="#3f2a13" strokeWidth="1.6" />
    </Frame>
  );
}

function CatArt(props: ArtProps) {
  return (
    <Frame {...props}>
      <path d="M14 24 12 8l14 8Z" fill="#f97316" />
      <path d="M50 24 52 8l-14 8Z" fill="#f97316" />
      <path d="M16 22 15 13l8 5Z" fill="#fca5a5" />
      <path d="M48 22l1-9-8 5Z" fill="#fca5a5" />
      <ellipse cx="32" cy="34" rx="20" ry="18" fill="#fb923c" />
      <path d="M26 17h4v8h-4ZM34 17h4v8h-4Z" fill="#ea7317" />
      <ellipse cx="32" cy="41" rx="10" ry="8" fill="#fed7aa" />
      <ellipse cx="24" cy="32" rx="3" ry="3.5" fill="#1f2937" />
      <ellipse cx="40" cy="32" rx="3" ry="3.5" fill="#1f2937" />
      <path d="M32 37l-3 3h6Z" fill="#f43f5e" />
      <path
        d="M22 39h-9M22 43h-8M42 39h9M42 43h8"
        stroke="#c2410c"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </Frame>
  );
}

function BananaArt(props: ArtProps) {
  return (
    <Frame {...props}>
      <path d="M14 16c2 18 12 30 30 32 6 1 8-3 5-6-14-3-22-12-26-26-1-4-9-4-9 0Z" fill="#facc15" />
      <path d="M18 20c4 14 13 22 26 26-12 1-24-9-26-26Z" fill="#eab308" />
      <path d="M13 15c-1-4 2-6 5-5l2 4Z" fill="#65a30d" />
    </Frame>
  );
}

function MangoArt(props: ArtProps) {
  return (
    <Frame {...props}>
      <path
        d="M40 15c9 4 12 16 8 25-4 10-15 16-24 13S11 38 16 28c4-8 14-16 24-13Z"
        fill="#f59e0b"
      />
      <path d="M42 20c5 6 5 16 0 23 6-5 8-17 0-23Z" fill="#dc2626" />
      <path d="M38 16c3-5 9-7 12-6-1 5-6 8-11 8Z" fill="#16a34a" />
    </Frame>
  );
}

function OrangeArt(props: ArtProps) {
  return (
    <Frame {...props}>
      <circle cx="32" cy="35" r="21" fill="#f97316" />
      <path
        d="M32 14v42M13 32c12 6 26 6 38 0M15 45c10-6 24-6 34 0M15 24c10 6 24 6 34 0"
        stroke="#ea580c"
        strokeWidth="1.4"
        opacity=".7"
      />
      <path d="M32 15c-1-5 2-8 5-8 3 4 1 8-5 8Z" fill="#16a34a" />
      <path d="M32 15v-6" stroke="#7c4a2d" strokeWidth="3" strokeLinecap="round" />
    </Frame>
  );
}

function CowArt(props: ArtProps) {
  return (
    <Frame {...props}>
      <path d="M10 20c-4-4-4-9 0-10 4 0 7 4 8 9Z" fill="#e2e8f0" />
      <path d="M54 20c4-4 4-9 0-10-4 0-7 4-8 9Z" fill="#e2e8f0" />
      <ellipse cx="32" cy="34" rx="20" ry="18" fill="#f1f5f9" />
      <path d="M18 22c6-3 10 1 8 6-2 6-11 5-11 0 0-2 1-4 3-6Z" fill="#78350f" />
      <path d="M45 25c4 3 4 9 0 11-5 2-9-3-7-8 1-3 4-5 7-3Z" fill="#78350f" />
      <ellipse cx="32" cy="43" rx="12" ry="9" fill="#fbcfe8" />
      <ellipse cx="27" cy="42" rx="2" ry="2.6" fill="#9d174d" />
      <ellipse cx="37" cy="42" rx="2" ry="2.6" fill="#9d174d" />
      <circle cx="24" cy="30" r="2.6" fill="#1f2937" />
      <circle cx="40" cy="30" r="2.6" fill="#1f2937" />
    </Frame>
  );
}

function ChickenArt(props: ArtProps) {
  return (
    <Frame {...props}>
      <path
        d="M28 52h-4l-2 6M40 52h-4l2 6"
        stroke="#d97706"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      <ellipse cx="30" cy="38" rx="19" ry="15" fill="#fef3c7" />
      <path d="M18 38c4-7 14-9 21-5-5 6-14 8-21 5Z" fill="#fcd34d" />
      <circle cx="43" cy="22" r="10" fill="#fef3c7" />
      <path d="M40 12c0-4 3-5 4-3 1-3 5-2 4 2-1 3-5 4-8 1Z" fill="#ef4444" />
      <path d="M52 22l7 3-7 3Z" fill="#f59e0b" />
      <path d="M46 30c1 3-2 5-4 3Z" fill="#ef4444" />
      <circle cx="45" cy="20" r="2" fill="#1f2937" />
    </Frame>
  );
}

function GoatArt(props: ArtProps) {
  return (
    <Frame {...props}>
      <path d="M22 16c-4-6-10-8-13-5 2 6 7 10 13 9Z" fill="#94a3b8" />
      <path d="M42 16c4-6 10-8 13-5-2 6-7 10-13 9Z" fill="#94a3b8" />
      <path d="M10 30c-4-2-6 3-2 5l6 2Z" fill="#cbd5e1" />
      <path d="M54 30c4-2 6 3 2 5l-6 2Z" fill="#cbd5e1" />
      <path d="M32 16c9 0 14 6 14 15s-6 20-14 20-14-11-14-20 5-15 14-15Z" fill="#e2e8f0" />
      <ellipse cx="32" cy="43" rx="7" ry="5" fill="#f8fafc" />
      <circle cx="25" cy="30" r="2.6" fill="#1f2937" />
      <circle cx="39" cy="30" r="2.6" fill="#1f2937" />
      <ellipse cx="29.5" cy="42" rx="1.4" ry="1.8" fill="#64748b" />
      <ellipse cx="34.5" cy="42" rx="1.4" ry="1.8" fill="#64748b" />
      <path d="M32 51c2 4 1 8-2 9 0-3 1-6 2-9Z" fill="#cbd5e1" />
    </Frame>
  );
}

function FishArt(props: ArtProps) {
  return (
    <Frame {...props}>
      <path d="M46 32c0 9-9 15-19 15S10 41 10 32s7-15 17-15 19 6 19 15Z" fill="#38bdf8" />
      <path d="M46 32 58 21v22Z" fill="#0ea5e9" />
      <path d="M27 17c3 4 3 10 0 14-4-4-4-10 0-14Z" fill="#0ea5e9" />
      <path d="M18 36c5 3 12 3 17 0-4 5-13 5-17 0Z" fill="#0284c7" opacity=".5" />
      <circle cx="19" cy="29" r="3.4" fill="#ffffff" />
      <circle cx="19" cy="29" r="1.8" fill="#0f172a" />
    </Frame>
  );
}

const objectArt: Record<ObjectArtKey, (props: ArtProps) => React.ReactElement> = {
  ball: BallArt,
  apple: AppleArt,
  dog: DogArt,
  cat: CatArt,
  banana: BananaArt,
  mango: MangoArt,
  orange: OrangeArt,
  cow: CowArt,
  chicken: ChickenArt,
  goat: GoatArt,
  fish: FishArt,
};

/** Renders one object drawing. Decorative — label the surrounding control instead. */
export function ObjectArt({ art, className }: { art: ObjectArtKey; className?: string }) {
  const Art = objectArt[art];
  return <Art className={className} />;
}
