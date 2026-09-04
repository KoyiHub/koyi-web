import { cn } from '@/lib/utils/cn';

/**
 * Countable maths manipulatives for the numeracy questions.
 *
 * Unlike the scenes, these are *not* placeholder art — the child counts them,
 * so they are generated from the question's own numbers. Changing
 * `media.count` or `media.tens`/`media.ones` in the fixture changes what is on
 * screen, which keeps the drawing and the answer key from drifting apart.
 *
 * Both diagrams are decorative at the SVG level; the surrounding media block
 * supplies one description for assistive technology.
 */

/** Counting sticks, laid out in a single row like the delivered screen. */
export function SticksArt({ count, className }: { count: number; className?: string }) {
  return (
    <div className={cn('flex items-end justify-center gap-3 sm:gap-4', className)}>
      {Array.from({ length: count }, (_, index) => (
        <svg
          key={index}
          viewBox="0 0 24 120"
          fill="none"
          aria-hidden="true"
          focusable="false"
          className="h-24 w-4 sm:h-32 sm:w-5"
        >
          <rect x="4" y="2" width="16" height="116" rx="8" fill="#a1652b" />
          <rect x="4" y="2" width="7" height="116" rx="3.5" fill="#c08344" />
          <rect x="15" y="2" width="5" height="116" rx="2.5" fill="#7c4a19" />
          <ellipse cx="12" cy="6" rx="8" ry="4" fill="#d4a068" />
        </svg>
      ))}
    </div>
  );
}

function TenRod({ label }: { label: string }) {
  return (
    <svg
      viewBox="0 0 28 120"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className="h-28 w-6 sm:h-32 sm:w-7"
      role="presentation"
      data-rod={label}
    >
      <rect x="1" y="1" width="26" height="118" rx="4" fill="#3b82f6" />
      {Array.from({ length: 10 }, (_, index) => (
        <rect
          key={index}
          x="4"
          y={4 + index * 11.6}
          width="20"
          height="9"
          rx="1.5"
          fill="#60a5fa"
        />
      ))}
      <rect x="1" y="1" width="26" height="118" rx="4" stroke="#1d4ed8" strokeWidth="2" />
    </svg>
  );
}

function OneCube() {
  return (
    <svg
      viewBox="0 0 28 28"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className="size-6 sm:size-7"
    >
      <rect x="1" y="1" width="26" height="26" rx="4" fill="#c08344" />
      <rect x="5" y="5" width="18" height="18" rx="2" fill="#d4a068" />
      <rect x="1" y="1" width="26" height="26" rx="4" stroke="#8a5522" strokeWidth="2" />
    </svg>
  );
}

/**
 * Base-ten blocks: `tens` rods of ten beside `ones` loose cubes, each group
 * captioned so the child can read the place value off the picture.
 */
export function BaseTenArt({
  tens,
  ones,
  className,
}: {
  tens: number;
  ones: number;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-wrap items-center justify-center gap-6 sm:gap-8', className)}>
      <div className="flex flex-col items-center gap-3">
        <div className="flex items-end gap-2 sm:gap-3">
          {Array.from({ length: tens }, (_, index) => (
            <TenRod key={index} label={`ten-${String(index + 1)}`} />
          ))}
        </div>
        <p className="text-koyi-muted text-sm font-semibold">
          {tens} {tens === 1 ? 'Ten' : 'Tens'}
        </p>
      </div>

      <span aria-hidden="true" className="text-koyi-muted text-3xl font-bold">
        +
      </span>

      <div className="flex flex-col items-center gap-3">
        <div className="grid max-w-[8.5rem] grid-cols-5 place-items-center gap-2">
          {Array.from({ length: ones }, (_, index) => (
            <OneCube key={index} />
          ))}
        </div>
        <p className="text-koyi-muted text-sm font-semibold">
          {ones} {ones === 1 ? 'One' : 'Ones'}
        </p>
      </div>
    </div>
  );
}
