import type { SVGProps } from 'react';

/**
 * Small hand-authored inline icon set, matching the existing precedent in
 * `teacher-topbar.tsx` (inline SVG, no icon library dependency). Kept tiny
 * and purpose-built — add to this file rather than introducing a package.
 */
type IconProps = SVGProps<SVGSVGElement>;

export function MailIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="size-4 fill-none stroke-current stroke-2"
      {...props}
    >
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m4 7 8 6 8-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function LockIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="size-4 fill-none stroke-current stroke-2"
      {...props}
    >
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" strokeLinecap="round" />
    </svg>
  );
}

export function UserIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="size-4 fill-none stroke-current stroke-2"
      {...props}
    >
      <circle cx="12" cy="8" r="3.5" />
      <path d="M4.5 20a7.5 7.5 0 0 1 15 0" strokeLinecap="round" />
    </svg>
  );
}

export function BellIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="size-5 fill-none stroke-current stroke-2"
      {...props}
    >
      <path d="M6 9a6 6 0 0 1 12 0c0 3.5 1 5 1.5 6H4.5C5 14 6 12.5 6 9Z" strokeLinejoin="round" />
      <path d="M10 19a2 2 0 0 0 4 0" strokeLinecap="round" />
    </svg>
  );
}

export function GearIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="size-5 fill-none stroke-current stroke-2"
      {...props}
    >
      <circle cx="12" cy="12" r="3" />
      <path
        d="M19.4 13.5a7.6 7.6 0 0 0 0-3l1.9-1.5-2-3.4-2.2.9a7.5 7.5 0 0 0-2.6-1.5L14.1 2h-4l-.4 2.3a7.5 7.5 0 0 0-2.6 1.5l-2.2-.9-2 3.4L4.7 10a7.6 7.6 0 0 0 0 3l-1.9 1.5 2 3.4 2.2-.9c.76.66 1.64 1.18 2.6 1.5l.4 2.3h4l.4-2.3a7.5 7.5 0 0 0 2.6-1.5l2.2.9 2-3.4-1.9-1.5Z"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function HelpIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="size-4 fill-none stroke-current stroke-2"
      {...props}
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.7.3-1 .8-1 1.7v.5" strokeLinecap="round" />
      <path d="M12 17h.01" strokeLinecap="round" />
    </svg>
  );
}

export function BuildingIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="size-5 fill-none stroke-current stroke-2"
      {...props}
    >
      <rect x="5" y="3" width="14" height="18" rx="1" />
      <path d="M9 8h.01M12 8h.01M15 8h.01M9 12h.01M12 12h.01M15 12h.01M9 16h.01M15 16h.01" />
      <path d="M10 21v-4h4v4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function UsersIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="size-5 fill-none stroke-current stroke-2"
      {...props}
    >
      <circle cx="9" cy="8" r="3" />
      <path d="M2.5 20a6.5 6.5 0 0 1 13 0" strokeLinecap="round" />
      <path d="M16 4.5a3 3 0 0 1 0 6" strokeLinecap="round" />
      <path d="M17.5 14.3a6.5 6.5 0 0 1 4 5.7" strokeLinecap="round" />
    </svg>
  );
}

export function ClipboardIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="size-5 fill-none stroke-current stroke-2"
      {...props}
    >
      <rect x="5" y="4" width="14" height="17" rx="2" />
      <rect x="9" y="2" width="6" height="4" rx="1" />
      <path d="M8 11h8M8 15h5" strokeLinecap="round" />
    </svg>
  );
}

export function GraduationCapIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="size-5 fill-none stroke-current stroke-2"
      {...props}
    >
      <path d="M2 9.5 12 5l10 4.5-10 4.5-10-4.5Z" strokeLinejoin="round" />
      <path d="M6 11.5V16c0 1.4 2.7 2.5 6 2.5s6-1.1 6-2.5v-4.5" strokeLinecap="round" />
      <path d="M22 9.5V15" strokeLinecap="round" />
    </svg>
  );
}

export function TrendingUpIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="size-5 fill-none stroke-current stroke-2"
      {...props}
    >
      <path d="m3 17 6-6 4 4 8-8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M15 7h6v6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function LogoutIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="size-4 fill-none stroke-current stroke-2"
      {...props}
    >
      <path
        d="M9 4H5a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M16 16l4-4-4-4M20 12H9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
