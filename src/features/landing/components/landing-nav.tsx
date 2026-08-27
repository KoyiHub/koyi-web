import { useState } from 'react';
import { Link, NavLink } from 'react-router';

import { Logo } from '@/components/ui/logo';
import { marketingNavItems } from '@/config/marketing-nav';
import { paths } from '@/config/paths';
import { cn } from '@/lib/utils/cn';

/**
 * Public top navigation for the landing journey. Collapses to a disclosure
 * menu below `md` — the four links plus the logo do not fit a 390px bar
 * without either wrapping or shrinking the tap targets below 44px.
 */
export function LandingNav() {
  const [open, setOpen] = useState(false);

  function close() {
    setOpen(false);
  }

  return (
    <header className="border-koyi-border bg-koyi-card/90 sticky top-0 z-40 border-b backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        {/* Height matches the nav links so the lockup sits on their centre line
            and the tap target clears 44px, while the image itself stays flush
            with the gutter the page content below uses. */}
        <Link
          to={paths.landing.welcome}
          aria-label="Koyi home"
          className="rounded-koyi-sm focus-visible:outline-koyi-primary flex h-11 items-center focus-visible:outline-2 focus-visible:outline-offset-4"
        >
          <Logo />
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
          {marketingNavItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'rounded-koyi-sm flex h-11 items-center px-3 text-sm font-medium transition-colors',
                  isActive ? 'text-koyi-primary' : 'text-koyi-text hover:text-koyi-primary',
                  !item.built && 'text-koyi-muted',
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
          <Link
            to={paths.login.chooser}
            className="border-koyi-border text-koyi-text hover:bg-koyi-surface rounded-koyi-md ml-2 flex h-11 items-center border px-4 text-sm font-medium transition-colors"
          >
            Log In
          </Link>
        </nav>

        <button
          type="button"
          onClick={() => {
            setOpen((previous) => !previous);
          }}
          aria-expanded={open}
          aria-controls="landing-menu"
          className="text-koyi-text -mr-2 flex size-11 items-center justify-center md:hidden"
        >
          <span className="sr-only">{open ? 'Close menu' : 'Open menu'}</span>
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            className="size-5 fill-none stroke-current stroke-2"
          >
            {open ? (
              <path d="m6 6 12 12M18 6 6 18" strokeLinecap="round" />
            ) : (
              <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
            )}
          </svg>
        </button>
      </div>

      {open && (
        <nav
          id="landing-menu"
          aria-label="Main"
          className="border-koyi-border bg-koyi-card border-t px-4 pb-4 md:hidden"
        >
          {marketingNavItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={close}
              className={({ isActive }) =>
                cn(
                  'flex h-12 items-center text-sm font-medium',
                  isActive ? 'text-koyi-primary' : 'text-koyi-text',
                  !item.built && 'text-koyi-muted',
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
          <Link
            to={paths.login.chooser}
            onClick={close}
            className="border-koyi-border text-koyi-text rounded-koyi-md mt-2 flex h-11 items-center justify-center border text-sm font-medium"
          >
            Log In
          </Link>
        </nav>
      )}
    </header>
  );
}
