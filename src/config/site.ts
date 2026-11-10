export const SITE_NAME = 'João Pedro Lepecki';
export const SITE_TAGLINE = 'Proudly a maker.';

export const LINKEDIN_URL = 'https://www.linkedin.com/in/joao-pedro-lepecki-310464271/';
export const GITHUB_URL = 'https://github.com/JplepeckiBR';

// TODO(JP): Add the public X profile URL when it is ready to appear on the site.
export const X_URL: string | undefined = undefined;
// TODO(JP): Add the public contact email when it is ready to appear on the site.
export const EMAIL_URL: string | undefined = undefined;

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

export const SOCIAL_LINKS = [
  { label: 'LinkedIn', href: LINKEDIN_URL },
  { label: 'GitHub', href: GITHUB_URL },
] as const;
