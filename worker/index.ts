import { Hono } from 'hono'

interface Env {
  KV: KVNamespace
  ASSETS: Fetcher
}

/** Whitelisted anonymous counter events. No PII, no script content ever sent. */
const EVENTS = new Set([
  'page_view',
  'prompter_start',
  'prompter_finish',
  'script_save',
  'script_import',
  'mirror_on',
  'voice_on',
  'usecase_view',
])

const SLUG_RE = /^[a-z0-9-]{1,40}$/

const app = new Hono<{ Bindings: Env }>()

// Security headers on every response (API and static assets alike).
// No CSP: Vite emits hashed module scripts and the app uses in-browser
// speech APIs; a strict CSP would need per-build nonces for little gain here.
const SECURITY_HEADERS: Record<string, string> = {
  'strict-transport-security': 'max-age=31536000; includeSubDomains',
  'x-frame-options': 'DENY',
  'x-content-type-options': 'nosniff',
  'referrer-policy': 'strict-origin-when-cross-origin',
  'permissions-policy': 'camera=(), geolocation=(), payment=()',
}

app.use('*', async (c, next) => {
  await next()
  for (const [k, v] of Object.entries(SECURITY_HEADERS)) c.header(k, v)
})

app.get('/api/health', (c) => c.json({ ok: true }))

app.post('/api/track', async (c) => {
  const body = await c.req
    .json<{ event?: string; slug?: string }>()
    .catch(() => ({ event: undefined, slug: undefined }))
  const event = body.event
  if (!event || !EVENTS.has(event)) return c.json({ error: 'unknown event' }, 400)
  const day = new Date().toISOString().slice(0, 10)
  const keys = [`count:${event}:total`, `count:${event}:${day}`]
  if (event === 'usecase_view' && typeof body.slug === 'string' && SLUG_RE.test(body.slug)) {
    keys.push(`count:usecase_view:${body.slug}:total`)
  }
  await Promise.all(
    keys.map(async (key) => {
      const current = Number((await c.env.KV.get(key)) ?? '0')
      await c.env.KV.put(key, String(current + 1))
    })
  )
  return c.json({ ok: true })
})

app.get('/api/stats', async (c) => {
  const events = [...EVENTS]
  const [values, slugList] = await Promise.all([
    Promise.all(events.map((e) => c.env.KV.get(`count:${e}:total`))),
    c.env.KV.list({ prefix: 'count:usecase_view:' }),
  ])
  const out: Record<string, number> = {}
  events.forEach((e, i) => {
    out[e] = Number(values[i] ?? '0')
  })
  const slugKeys = slugList.keys
    .map((k) => k.name)
    .filter((name) => name.split(':').length === 4 && name.endsWith(':total'))
  const slugValues = await Promise.all(slugKeys.map((k) => c.env.KV.get(k)))
  slugKeys.forEach((name, i) => {
    out[`usecase_view:${name.split(':')[2]}`] = Number(slugValues[i] ?? '0')
  })
  c.header('cache-control', 'public, max-age=60')
  return c.json(out)
})

app.notFound(async (c) => {
  const res = await c.env.ASSETS.fetch(c.req.raw)
  const headers = new Headers(res.headers)
  for (const [k, v] of Object.entries(SECURITY_HEADERS)) headers.set(k, v)
  return new Response(res.body, { status: res.status, statusText: res.statusText, headers })
})

export default app
