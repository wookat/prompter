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

app.notFound((c) => c.env.ASSETS.fetch(c.req.raw))

export default app
