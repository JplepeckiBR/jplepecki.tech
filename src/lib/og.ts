// Build-time Open Graph rendering adapted from the archived portfolio implementation.
// Raw OFL font files live beside this module and are not shipped to the browser.
import { Resvg } from '@resvg/resvg-js';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import satori from 'satori';

const fontDir = join(process.cwd(), 'src', 'assets', 'og-fonts');

async function font(file: string) {
  return readFile(join(fontDir, file));
}

let fontCache: Awaited<ReturnType<typeof loadFonts>> | null = null;

async function loadFonts() {
  const [serifRegular, serifSemibold, mono] = await Promise.all([
    font('SourceSerif4-Regular.ttf'),
    font('SourceSerif4-Semibold.ttf'),
    font('JetBrainsMono-Regular.ttf'),
  ]);

  return [
    { name: 'Source Serif 4', data: serifRegular, weight: 400 as const, style: 'normal' as const },
    { name: 'Source Serif 4', data: serifSemibold, weight: 600 as const, style: 'normal' as const },
    { name: 'JetBrains Mono', data: mono, weight: 400 as const, style: 'normal' as const },
  ];
}

export interface OgOptions {
  kicker: string;
  title: string;
  subtitle?: string;
}

const MAT = '#2E5C48';
const PAGE = '#151918';
const TEXT = '#ECE8DE';
const MUTED = '#9DA6A1';
const COPPER = '#C89B5C';
const TAPE = '#E8DEBE';

function gridPath(step: number): string {
  const segments: string[] = [];
  for (let x = 0; x <= 1200; x += step) segments.push(`M${x} 0V630`);
  for (let y = 0; y <= 630; y += step) segments.push(`M0 ${y}H1200`);
  return segments.join('');
}

function titleSize(title: string): number {
  if (title.length > 72) return 54;
  if (title.length > 48) return 64;
  return 76;
}

export async function renderOg({ kicker, title, subtitle }: OgOptions): Promise<Buffer> {
  fontCache ??= await loadFonts();

  const optionalSubtitle = subtitle
    ? {
        type: 'div',
        props: {
          style: {
            display: 'flex',
            maxWidth: '880px',
            marginTop: '18px',
            color: MUTED,
            fontFamily: 'Source Serif 4',
            fontSize: '27px',
            lineHeight: 1.25,
          },
          children: subtitle,
        },
      }
    : null;

  const markup = {
    type: 'div',
    props: {
      style: {
        display: 'flex',
        width: '1200px',
        height: '630px',
        position: 'relative',
        overflow: 'hidden',
        background: MAT,
        fontFamily: 'Source Serif 4',
      },
      children: [
        {
          type: 'svg',
          props: {
            width: 1200,
            height: 630,
            viewBox: '0 0 1200 630',
            style: { position: 'absolute', inset: 0 },
            children: [
              { type: 'path', props: { d: gridPath(24), stroke: 'rgba(255,255,255,.12)', strokeWidth: 1 } },
              { type: 'path', props: { d: gridPath(120), stroke: 'rgba(255,255,255,.27)', strokeWidth: 1 } },
              { type: 'path', props: { d: 'M0 630L630 0M280 630L644 0', stroke: 'rgba(255,255,255,.18)', strokeWidth: 2 } },
              { type: 'circle', props: { cx: 1078, cy: 94, r: 42, fill: 'none', stroke: 'rgba(74,42,20,.25)', strokeWidth: 5 } },
              { type: 'path', props: { d: 'M1030 524q44-8 92 7', stroke: 'rgba(236,232,222,.65)', strokeWidth: 5, fill: 'none', strokeLinecap: 'round' } },
            ],
          },
        },
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              flexDirection: 'column',
              position: 'absolute',
              left: '86px',
              top: '68px',
              width: '1028px',
              height: '494px',
              padding: '54px 64px 42px 72px',
              background: PAGE,
              color: TEXT,
              border: `2px solid ${COPPER}`,
              boxShadow: '0 20px 34px rgba(0,0,0,.42)',
            },
            children: [
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    fontFamily: 'JetBrains Mono',
                    color: COPPER,
                    fontSize: '22px',
                    letterSpacing: '2px',
                    textTransform: 'uppercase',
                  },
                  children: kicker,
                },
              },
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    maxWidth: '900px',
                    marginTop: '22px',
                    color: TEXT,
                    fontSize: `${titleSize(title)}px`,
                    fontWeight: 600,
                    lineHeight: 1.02,
                  },
                  children: title,
                },
              },
              optionalSubtitle,
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    width: '100%',
                    marginTop: 'auto',
                    paddingTop: '18px',
                    borderTop: '1px solid #2C3330',
                    color: MUTED,
                    fontFamily: 'JetBrains Mono',
                    fontSize: '20px',
                  },
                  children: [
                    { type: 'div', props: { children: 'JPLEPECKI.TECH' } },
                    { type: 'div', props: { children: 'LAB NOTEBOOK · REV 01' } },
                  ],
                },
              },
            ].filter(Boolean),
          },
        },
        {
          type: 'div',
          props: {
            style: {
              position: 'absolute',
              left: '172px',
              top: '54px',
              width: '132px',
              height: '28px',
              background: TAPE,
              opacity: 0.88,
            },
          },
        },
        ...[
          [108, 90],
          [1092, 90],
          [108, 540],
          [1092, 540],
        ].map(([left, top]) => ({
          type: 'div',
          props: {
            style: {
              position: 'absolute',
              left: `${left}px`,
              top: `${top}px`,
              width: '18px',
              height: '18px',
              borderRadius: '50%',
              border: `3px solid ${COPPER}`,
              background: MAT,
            },
          },
        })),
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
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
    },
  });
}
