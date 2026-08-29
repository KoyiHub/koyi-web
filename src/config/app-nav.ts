import type { ComponentType, SVGProps } from 'react';

/**
 * One row in an application sidebar.
 *
 * Shared by both portals so a single sidebar component can be driven by
 * whichever nav config it is handed. The shape lives here rather than beside
 * either nav config, so neither application imports from the other's module.
 */
export interface AppNavItem {
  label: string;
  to: string;
  /** `true` for index-style destinations that must not stay active on child routes. */
  end: boolean;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
}

/** A sidebar's two groups: the main list, and the rows pinned to the bottom. */
export interface AppNav {
  primary: AppNavItem[];
  footer: AppNavItem[];
}
