import type { APIContext } from 'astro';
import { SITE } from '../../consts';
import { renderOg, ogResponse } from '../../lib/og';

export async function GET(_context: APIContext) {
  const png = await renderOg({
    kicker: 'PORTFOLIO · BUILD LOGS',
    title: 'JP Lepecki',
    subtitle: SITE.description,
  });
  return ogResponse(png);
}
