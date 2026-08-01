# PromptCue — Free Online Teleprompter

Live at **https://prompter.zalize.com**

A free browser teleprompter: paste your script, press Start, and read at a steady,
adjustable pace. No signup, no watermark, no word limit. Scripts are stored only in
the browser's local storage — nothing is uploaded.

## Features

- Fullscreen auto-scroll with adjustable speed (1–20) and text size (20–120px)
- Space / tap to pause, arrows for speed & font size, `M` mirror, `R` restart, `Esc` exit
- Horizontal + vertical mirror modes for beam-splitter rigs
- Countdown before the scroll starts, eye-line guide marker, progress bar
- Wheel / touch-drag seeking
- Word count + speaking-time estimate; saved scripts (localStorage, up to 50)
- Mobile friendly (touch controls, safe-area aware control bar)
- 8 pSEO use-case pages prerendered at build time + sitemap/robots/IndexNow key

## Stack

Vite + React 19 + TypeScript + Tailwind CSS 4 (shadcn/ui-style components) on
Cloudflare Workers (Hono). A tiny `/api/track` endpoint keeps anonymous aggregate
usage counters in Workers KV (no PII, no script content).

## Develop

```bash
npm install
npm run dev        # vite dev server
npm run lint       # eslint
npm run build      # tsc + vite build + SEO prerender (scripts/build-seo.mjs)
```

## Deploy

```bash
CLOUDFLARE_API_TOKEN=... npm run deploy
```

Custom domain `prompter.zalize.com` is configured via `routes` in `wrangler.jsonc`.
Create the KV namespace once with `wrangler kv namespace create KV` and put its id
in `wrangler.jsonc`.
