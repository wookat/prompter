/**
 * Build-time SEO pages: renders one static HTML page per use case
 * (title/description/OG/canonical/JSON-LD) into dist/client/, plus
 * sitemap.xml, robots.txt and the IndexNow key file. Static assets win
 * over the SPA fallback, so crawlers get real HTML.
 *
 * Use-case content lives in src/lib/useCases.ts (single source of truth,
 * imported here at build time).
 */
import { execFileSync } from 'node:child_process'
import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { CTA_START_FREE, SITE, USE_CASES } from '../src/lib/useCases.ts'

const ROOT = path.resolve(import.meta.dirname, '..')
const OUT_DIR = path.join(ROOT, 'dist/client')
const INDEXNOW_KEY = '9cb164313a6ba5a3a0dcb9ec11cdfb06'

// Prerender the real page components (esbuild-bundled for Node) so every
// route ships full HTML in #root; React re-renders over it on mount.
execFileSync(
  path.join(ROOT, 'node_modules/.bin/esbuild'),
  [
    'scripts/prerender.tsx',
    '--bundle',
    '--format=esm',
    '--platform=node',
    '--jsx=automatic',
    '--alias:@=./src',
    '--packages=external',
    '--outfile=dist/prerender.mjs',
    '--log-level=warning',
  ],
  { cwd: ROOT },
)
const { renderRoute } = await import(path.join(ROOT, 'dist/prerender.mjs'))

/** <lastmod> from the newest git commit touching the page's content sources. */
function lastmodOf(...files) {
  const dates = files.map((f) =>
    execFileSync('git', ['log', '-1', '--format=%cs', '--', f], {
      cwd: ROOT,
      encoding: 'utf8',
    }).trim(),
  )
  return dates.filter(Boolean).sort().at(-1) ?? new Date().toISOString().slice(0, 10)
}

const esc = (s) =>
  s
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')

const assets = readdirSync(path.join(OUT_DIR, 'assets'))
const jsFile = assets.find((f) => f.startsWith('index-') && f.endsWith('.js'))
const cssFile = assets.find((f) => f.startsWith('index-') && f.endsWith('.css'))

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
  const faqLd = u.faq && {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: u.faq.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  }
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" media="print" onload="this.media='all'" />
    <noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" /></noscript>
    <title>${esc(u.title)}</title>
    <meta name="description" content="${esc(u.description)}" />
    <link rel="canonical" href="${url}" />
    <meta property="og:type" content="website" />
    <meta property="og:title" content="${esc(u.title)}" />
    <meta property="og:description" content="${esc(u.description)}" />
    <meta property="og:url" content="${url}" />
    <meta property="og:image" content="${SITE}/og.png" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:image" content="${SITE}/og.png" />
    <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
    <script type="application/ld+json">${JSON.stringify(breadcrumbs)}</script>${faqLd ? `
    <script type="application/ld+json">${JSON.stringify(faqLd)}</script>` : ''}
    <script type="module" crossorigin src="/assets/${jsFile}"></script>
    <link rel="stylesheet" crossorigin href="/assets/${cssFile}" />
  </head>
  <body>
    <div id="root">${renderRoute(u.path)}</div>
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

// Inject the prerendered homepage into Vite's built index.html.
const indexPath = path.join(OUT_DIR, 'index.html')
const indexHtml = readFileSync(indexPath, 'utf8')
if (!indexHtml.includes('<div id="root"></div>')) {
  throw new Error('index.html: #root mount point not found')
}
writeFileSync(
  indexPath,
  indexHtml.replace('<div id="root"></div>', `<div id="root">${renderRoute('/')}</div>`),
)

const HOME_SOURCES = ['src/pages/Home.tsx', 'src/lib/homeContent.ts']
const USECASE_SOURCES = ['src/lib/useCases.ts', 'src/lib/useCaseLinks.ts', 'src/pages/UseCase.tsx']
writeFileSync(
  path.join(OUT_DIR, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (p) =>
      `  <url><loc>${SITE}${p === '/' ? '/' : p}</loc><lastmod>${lastmodOf(...(p === '/' ? HOME_SOURCES : USECASE_SOURCES))}</lastmod></url>`
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

writeFileSync(
  path.join(OUT_DIR, '404.html'),
  `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="robots" content="noindex" />
    <title>Page not found | PromptCue</title>
    <link rel="stylesheet" crossorigin href="/assets/${cssFile}" />
  </head>
  <body>
    <main style="min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1rem;font-family:system-ui,sans-serif;text-align:center;padding:2rem">
      <h1 style="font-size:2rem;font-weight:800">404 — page not found</h1>
      <p>That page doesn't exist. The teleprompter is waiting for you on the homepage.</p>
      <p><a href="/" style="font-weight:600;text-decoration:underline">${esc(CTA_START_FREE)} →</a></p>
    </main>
  </body>
</html>
`
)

writeFileSync(path.join(OUT_DIR, `${INDEXNOW_KEY}.txt`), INDEXNOW_KEY)

console.log(`SEO build: ${USE_CASES.length} use-case pages, sitemap, robots, IndexNow key`)
