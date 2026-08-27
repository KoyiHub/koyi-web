import { paths } from '@/config/paths';

export interface MarketingNavItem {
  label: string;
  to: string;
  /**
   * `false` while the destination page is still a placeholder. The nav renders
   * these as visibly de-emphasised links so nobody mistakes a stub for a
   * finished page — and so the flag disappears the moment the page ships.
   */
  built: boolean;
}

/**
 * Public top navigation for the landing journey. "How It Works" points at
 * step 2 of the journey itself rather than a separate marketing page — it is
 * the same content, so duplicating it would mean two places to keep in sync.
 */
export const marketingNavItems: MarketingNavItem[] = [
  { label: 'About', to: paths.marketing.about, built: false },
  { label: 'How It Works', to: paths.landing.howItWorks, built: true },
  { label: 'Contact Us', to: paths.marketing.contact, built: false },
];
