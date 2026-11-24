export const SITE_NAME = 'João Pedro Lepecki';
export const SITE_TAGLINE = 'Proudly a maker.';

export const LINKEDIN_URL = 'https://www.linkedin.com/in/joao-pedro-lepecki-310464271/';
export const GITHUB_URL = 'https://github.com/JplepeckiBR';

export const X_URL = 'https://x.com/PekiMakes';
export const CONTACT_EMAIL = 'jpl@jplepecki.tech';
export const EMAIL_URL = `mailto:${CONTACT_EMAIL}`;

// The two portraits on the desk link to the post that explains how they were made.
export const PORTRAIT_POST_HREF = '/posts/how-a-photo-becomes-a-riso-print';
export const PORTRAIT_REPO_URL = 'https://github.com/JplepeckiBR/portrait-filters';

function validatedHttpsUrl(value: unknown): string | undefined {
  if (typeof value !== 'string' || value.trim() === '') return undefined;

  try {
    const url = new URL(value.trim());
    if (url.protocol !== 'https:' || !url.hostname) return undefined;
    return url.toString();
  } catch {
    return undefined;
  }
}

export const CAL_URL = validatedHttpsUrl(import.meta.env.CAL_URL);

export type SocialIcon = 'linkedin' | 'x' | 'github' | 'email';

export const SOCIAL_LINKS: ReadonlyArray<{ label: string; href: string; icon: SocialIcon }> = [
  { label: 'LinkedIn', href: LINKEDIN_URL, icon: 'linkedin' },
  { label: 'X', href: X_URL, icon: 'x' },
  { label: 'GitHub', href: GITHUB_URL, icon: 'github' },
  { label: `Email ${CONTACT_EMAIL}`, href: EMAIL_URL, icon: 'email' },
];
