import { cn } from '@/lib/utils/cn';

/**
 * Pastel tones rotated across a list so adjacent rows read as distinct
 * people, matching the design reference. The tone is derived from the name,
 * not the row index, so a person keeps the same colour after sorting,
 * filtering or paging.
 */
const TONES = [
  'bg-violet-100 text-violet-700',
  'bg-sky-100 text-sky-700',
  'bg-amber-100 text-amber-700',
  'bg-emerald-100 text-emerald-700',
  'bg-rose-100 text-rose-700',
  'bg-indigo-100 text-indigo-700',
];

function toneFor(name: string): string {
  let hash = 0;
  for (let index = 0; index < name.length; index += 1) {
    hash = (hash + name.charCodeAt(index) * (index + 1)) % TONES.length;
  }
  return TONES[hash]!;
}

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0] ?? ''}${parts[parts.length - 1]![0] ?? ''}`.toUpperCase();
}

interface InitialsAvatarProps {
  name: string;
  /** Tailwind size utilities — defaults to the 40px table-row size. */
  className?: string;
}

/**
 * Circular initials avatar. Decorative: the person's name is always rendered
 * beside it, so this is hidden from assistive technology rather than
 * repeating the name.
 */
export function InitialsAvatar({ name, className }: InitialsAvatarProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-bold',
        toneFor(name),
        className,
      )}
    >
      {initialsOf(name)}
    </span>
  );
}

interface SchoolCrestProps {
  name: string;
  logoUrl?: string | null | undefined;
  className?: string;
}

/**
 * The school's crest, shown under the product logo in the app shell and in
 * the topbar. Falls back to initials on a brand-tinted disc when a school has
 * not uploaded a logo — which is the case for every school today, since no
 * logo upload endpoint is confirmed.
 */
export function SchoolCrest({ name, logoUrl, className }: SchoolCrestProps) {
  if (logoUrl) {
    return (
      <img
        src={logoUrl}
        alt=""
        aria-hidden="true"
        className={cn('size-10 shrink-0 rounded-full object-cover', className)}
      />
    );
  }

  return (
    <span
      aria-hidden="true"
      className={cn(
        'from-koyi-primary to-koyi-accent flex size-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-sm font-bold text-white',
        className,
      )}
    >
      {initialsOf(name)}
    </span>
  );
}
