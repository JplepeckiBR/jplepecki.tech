// Build-time Open Graph image generation with satori + resvg.
// Fonts are OFL TTFs stored in src/assets/og-fonts (used only here, not shipped
// to the browser). The layout echoes the site: graphite ground, hairline grid,
// signal-orange trace, mono label.
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

// Resolve fonts from the project source tree (cwd), not the bundled chunk dir —
// satori needs the raw TTFs at build time and import.meta.url doesn't survive
// Astro's prerender bundling.
const fontDir = join(process.cwd(), 'src', 'assets', 'og-fonts');

async function font(file: string) {
  return readFile(join(fontDir, file));
}

let fontCache: Awaited<ReturnType<typeof loadFonts>> | null = null;
async function loadFonts() {
  const [groteskBold, groteskMedium, mono] = await Promise.all([
    font('SpaceGrotesk-Bold.ttf'),
    font('SpaceGrotesk-Medium.ttf'),
    font('IBMPlexMono-Regular.ttf'),
  ]);
  return [
    { name: 'Space Grotesk', data: groteskBold, weight: 700 as const, style: 'normal' as const },
    { name: 'Space Grotesk', data: groteskMedium, weight: 500 as const, style: 'normal' as const },
    { name: 'IBM Plex Mono', data: mono, weight: 400 as const, style: 'normal' as const },
  ];
}

export interface OgOptions {
  kicker: string; // mono label, e.g. "PROJECT · STRIDESENSE"
  title: string;
  subtitle?: string;
}

const BG = '#14151a';
const FG = '#ece7df';
const MUTED = '#a6a29b';
const LINE = '#2b2d36';
const ACCENT = '#ff5a1f';

// A gait-like SVG path (same silhouette as the hero), used as a background trace.
const TRACE =
  'M0,360 C80,360 110,180 180,180 C240,180 250,350 320,370 C390,388 410,250 480,250 ' +
  'C540,250 560,380 650,380 C720,380 740,150 820,150 C880,150 900,370 980,370 ' +
  'C1060,370 1080,220 1150,220 L1200,220';

export async function renderOg({ kicker, title, subtitle }: OgOptions): Promise<Buffer> {
  fontCache ??= await loadFonts();

  const markup = {
    type: 'div',
    props: {
      style: {
        display: 'flex',
        flexDirection: 'column',
        width: '1200px',
        height: '630px',
        background: BG,
        padding: '72px',
        position: 'relative',
        fontFamily: 'Space Grotesk',
      },
      children: [
        // background trace
        {
          type: 'svg',
          props: {
            width: 1200,
            height: 630,
            viewBox: '0 0 1200 630',
            style: { position: 'absolute', top: 0, left: 0 },
            children: [
              {
                type: 'path',
                props: { d: TRACE, fill: 'none', stroke: ACCENT, strokeWidth: 3, strokeOpacity: 0.9 },
              },
            ],
          },
        },
        // kicker
        {
          type: 'div',
          props: {
            style: {
              fontFamily: 'IBM Plex Mono',
              fontSize: '24px',
              letterSpacing: '2px',
              color: MUTED,
              textTransform: 'uppercase',
            },
            children: kicker,
          },
        },
        // title
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              fontSize: '72px',
              fontWeight: 700,
              color: FG,
              marginTop: '24px',
              lineHeight: 1.05,
              maxWidth: '900px',
            },
            children: title,
          },
        },
        // subtitle
        subtitle
          ? {
              type: 'div',
              props: {
                style: {
                  display: 'flex',
                  fontSize: '30px',
                  fontWeight: 500,
                  color: MUTED,
                  marginTop: '24px',
                  maxWidth: '820px',
                },
                children: subtitle,
              },
            }
          : { type: 'div', props: {} },
        // footer brand, pinned bottom
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              marginTop: 'auto',
              alignItems: 'center',
              fontFamily: 'IBM Plex Mono',
              fontSize: '26px',
              color: FG,
            },
            children: [
              {
                type: 'div',
                props: {
                  style: {
                    width: '16px',
                    height: '16px',
                    background: ACCENT,
                    borderRadius: '3px',
                    marginRight: '14px',
                  },
                },
              },
              { type: 'div', props: { children: 'jplepecki.tech' } },
            ],
          },
        },
        // top hairline accent
        {
          type: 'div',
          props: {
            style: {
              position: 'absolute',
              top: 0,
              left: 0,
              width: '1200px',
              height: '6px',
              background: ACCENT,
            },
          },
        },
      ],
    },
  } as const;

  const svg = await satori(markup as Parameters<typeof satori>[0], {
    width: 1200,
    height: 630,
    fonts: fontCache,
  });

  const png = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } }).render().asPng();
  return Buffer.from(png);
}

export function ogResponse(png: Buffer): Response {
  return new Response(new Uint8Array(png), {
    headers: { 'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=31536000, immutable' },
  });
}
