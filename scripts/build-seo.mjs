/**
 * Build-time SEO pages: renders one static HTML page per use case
 * (title/description/OG/canonical/JSON-LD) into dist/client/, plus
 * sitemap.xml, robots.txt and the IndexNow key file. Static assets win
 * over the SPA fallback, so crawlers get real HTML.
 *
 * Use-case content lives in src/lib/useCases.ts (single source of truth,
 * imported here at build time).
 */
import { mkdirSync, readdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { SITE, USE_CASES } from '../src/lib/useCases.ts'

const OUT_DIR = path.resolve(import.meta.dirname, '../dist/client')
const INDEXNOW_KEY = '9cb164313a6ba5a3a0dcb9ec11cdfb06'

const esc = (s) =>
  s
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')

const assets = readdirSync(path.join(OUT_DIR, 'assets'))
const jsFile = assets.find((f) => f.endsWith('.js'))
const cssFile = assets.find((f) => f.endsWith('.css'))

function pageHtml(u) {
  const url = `${SITE}${u.path}`
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'PromptCue — Free Online Teleprompter',
    url,
    applicationCategory: 'MultimediaApplication',
    operatingSystem: 'Any',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    description: u.description,
  }
  const breadcrumbs = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'PromptCue', item: `${SITE}/` },
      { '@type': 'ListItem', position: 2, name: u.name, item: url },
    ],
  }
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${esc(u.title)}</title>
    <meta name="description" content="${esc(u.description)}" />
    <link rel="canonical" href="${url}" />
    <meta property="og:type" content="website" />
    <meta property="og:title" content="${esc(u.title)}" />
    <meta property="og:description" content="${esc(u.description)}" />
    <meta property="og:url" content="${url}" />
    <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
    <script type="application/ld+json">${JSON.stringify(breadcrumbs)}</script>
    <script type="module" crossorigin src="/assets/${jsFile}"></script>
    <link rel="stylesheet" crossorigin href="/assets/${cssFile}" />
  </head>
  <body>
    <div id="root"></div>
    <noscript>
      <h1>${esc(u.h1)}</h1>
      <p>${esc(u.intro)}</p>
      <ul>${u.bullets.map((b) => `<li>${esc(b)}</li>`).join('')}</ul>
      <p><a href="/">Open the free online teleprompter</a></p>
    </noscript>
  </body>
</html>
`
}

const urls = ['/', ...USE_CASES.map((u) => u.path)]

for (const u of USE_CASES) {
  // Emit "<route>.html" (not "<route>/index.html") so Workers assets serve
  // the exact path with 200 instead of a trailing-slash redirect.
  writeFileSync(path.join(OUT_DIR, `${u.path.replace(/^\//, '')}.html`), pageHtml(u))
}

const today = new Date().toISOString().slice(0, 10)
writeFileSync(
  path.join(OUT_DIR, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (p) => `  <url><loc>${SITE}${p === '/' ? '/' : p}</loc><lastmod>${today}</lastmod></url>`
  )
  .join('\n')}
</urlset>
`
)

writeFileSync(
  path.join(OUT_DIR, 'robots.txt'),
  `User-agent: *
Allow: /

Sitemap: ${SITE}/sitemap.xml
`
)

writeFileSync(path.join(OUT_DIR, `${INDEXNOW_KEY}.txt`), INDEXNOW_KEY)

console.log(`SEO build: ${USE_CASES.length} use-case pages, sitemap, robots, IndexNow key`)
