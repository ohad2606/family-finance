/**
 * Rasterises the תקציב logomark (public/icon-512.svg) into the PNG icons the
 * PWA manifest needs. Chrome's WebAPK minting service does not reliably accept
 * SVG manifest icons, which is why the installed app needs real PNGs.
 *
 * One-off script — sharp/opentype.js are intentionally NOT project dependencies.
 * Re-run after a logo change with:
 *   npm i --no-save sharp opentype.js && node scripts/generate-pwa-icons.mjs
 *
 * The ₪ is baked in as a vector path taken from Heebo — the same display face the
 * app already loads for its wordmark — so the icon matches the app's typography
 * and rasterisation does not depend on the build machine's installed fonts.
 * Requires network access to fetch the font.
 */
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'
import opentype from 'opentype.js'

const PUBLIC_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../public')

// Heebo Black (900) — the weight the app's own wordmark uses (--fw-black), and the
// one that stays legible once Android shrinks the icon to launcher size.
// `subset=hebrew` matters: the default Latin subset has no ₪ (U+20AA).
const FONT_CSS = 'https://fonts.googleapis.com/css?family=Heebo:900&subset=hebrew'

const INK = '#1B2A27'
const BRASS = '#C9A23F'

/** Resolve the TTF via the CSS API rather than hardcoding a versioned gstatic URL. */
async function loadFont() {
  // The legacy UA gets truetype back; modern clients are served woff2, which
  // opentype.js cannot decompress.
  const css = await fetch(FONT_CSS, { headers: { 'User-Agent': 'Wget/1.13' } })
  if (!css.ok) throw new Error(`could not resolve Heebo CSS (${css.status}) — network required`)
  const url = (await css.text()).match(/https:\/\/[^)]+\.ttf/)?.[0]
  if (!url) throw new Error('no TTF url in Google Fonts CSS response')
  const ttf = await fetch(url)
  if (!ttf.ok) throw new Error(`could not fetch Heebo TTF (${ttf.status})`)
  return opentype.parse(await ttf.arrayBuffer())
}

const font = await loadFont()
const glyph = font.charToGlyph('₪')
if (glyph.index === 0) throw new Error('font has no ₪ (U+20AA) glyph — wrong subset?')

/**
 * ₪ as a path, scaled to `inkHeight` and centred on (cx, cy).
 * Positioned from the glyph's ink bounding box rather than its baseline and
 * advance width, so swapping the font or weight cannot shift the mark.
 */
function shekelPath(cx, cy, inkHeight) {
  const { x1, y1, x2, y2 } = glyph.getBoundingBox()
  const upm = font.unitsPerEm
  const size = (inkHeight * upm) / (y2 - y1)
  const penX = cx - (((x1 + x2) / 2) * size) / upm
  const baseline = cy + (((y1 + y2) / 2) * size) / upm
  return glyph.getPath(penX, baseline, size).toPathData(2)
}

/**
 * The logomark on a 512x512 canvas, mirroring public/icon-512.svg exactly.
 * `rx` rounds the backplate (0 = full bleed, required for maskable icons).
 * `contentScale` shrinks the mark about the canvas centre for maskable safe zone.
 */
function markSvg({ rx, contentScale = 1 }) {
  const s = contentScale
  const t = s === 1 ? '' : ` transform="translate(${256 * (1 - s)} ${250 * (1 - s)}) scale(${s})"`
  return `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="${rx}" fill="${INK}"/>
  <g${t}>
    <polygon points="256,115 403,256 109,256" fill="${BRASS}"/>
    <rect x="141" y="248" width="230" height="136" rx="8" fill="${BRASS}" fill-opacity="0.18" stroke="${BRASS}" stroke-width="13"/>
    <path d="${shekelPath(256, 310, 74)}" fill="${BRASS}"/>
  </g>
</svg>`
}

const targets = [
  // Standard icons keep the rounded backplate of the existing logo.
  { file: 'icon-192.png', size: 192, svg: markSvg({ rx: 107 }) },
  { file: 'icon-512.png', size: 512, svg: markSvg({ rx: 107 }) },
  // Maskable: full bleed so Android can apply its own circle/squircle mask,
  // with the mark nudged inside the 80% safe zone.
  { file: 'icon-maskable-512.png', size: 512, svg: markSvg({ rx: 0, contentScale: 0.95 }) },
  // iOS applies its own corner rounding, so ship a square backplate.
  { file: 'apple-touch-icon.png', size: 180, svg: markSvg({ rx: 0 }) },
]

for (const { file, size, svg } of targets) {
  await sharp(Buffer.from(svg))
    .resize(size, size)
    .png({ compressionLevel: 9 })
    .toFile(path.join(PUBLIC_DIR, file))
  console.log(`wrote ${file} (${size}x${size})`)
}
