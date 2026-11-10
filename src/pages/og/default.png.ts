import type { APIRoute } from 'astro';
import { SITE_NAME, SITE_TAGLINE } from '../../config/site';
import { ogResponse, renderOg } from '../../lib/og';

export const GET: APIRoute = async () =>
  ogResponse(await renderOg({
    kicker: 'JPLEPECKI.TECH',
    title: SITE_NAME,
    subtitle: SITE_TAGLINE,
  }));
