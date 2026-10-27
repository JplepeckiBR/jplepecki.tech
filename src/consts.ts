// Site-wide constants. Single source of truth for identity + nav.
// Never invent facts — anything unknown is a TODO(JP) handled at the usage site.

export const SITE = {
  title: 'JP Lepecki',
  // Shown as the default <title> suffix and in OG.
  name: 'João Pedro Lepecki',
  url: 'https://jplepecki.tech',
  description:
    'Business student building real technical things — embedded systems, sensing, and data science. Portfolio and build logs.',
  lang: 'en',
  locale: 'en_US',
} as const;

export const SOCIAL = {
  github: 'https://github.com/JplepeckiBR',
  linkedin: 'https://www.linkedin.com/in/joao-pedro-lepecki-310464271',
  // JP will decide which address to expose. Until then, the UI hides the link.
  email: '', // TODO(JP): set a public email, e.g. 'you@jplepecki.tech'
} as const;

export const NAV = [
  { href: '/projects', label: 'Projects' },
  { href: '/blog', label: 'Blog' },
  { href: '/videos', label: 'Videos' },
  { href: '/about', label: 'About' },
  { href: '/now', label: 'Now' },
] as const;

// Canonical tag vocabulary used for project filtering.
export const PROJECT_TAGS = [
  'embedded',
  'data',
  'AI',
  'hardware',
  'finance',
  'agritech',
] as const;

export type ProjectStatus = 'active' | 'shipped' | 'paused' | 'archived';

export const STATUS_LABEL: Record<ProjectStatus, string> = {
  active: 'Active',
  shipped: 'Shipped',
  paused: 'Paused',
  archived: 'Archived',
};
