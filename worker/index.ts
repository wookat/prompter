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
])

const app = new Hono<{ Bindings: Env }>()

app.get('/api/health', (c) => c.json({ ok: true }))

app.post('/api/track', async (c) => {
  const body = await c.req.json<{ event?: string }>().catch(() => ({ event: undefined }))
  const event = body.event
  if (!event || !EVENTS.has(event)) return c.json({ error: 'unknown event' }, 400)
  const day = new Date().toISOString().slice(0, 10)
  const keys = [`count:${event}:total`, `count:${event}:${day}`]
  await Promise.all(
    keys.map(async (key) => {
      const current = Number((await c.env.KV.get(key)) ?? '0')
      await c.env.KV.put(key, String(current + 1))
    })
  )
  return c.json({ ok: true })
})

app.get('/api/stats', async (c) => {
  const out: Record<string, number> = {}
  for (const event of EVENTS) {
    out[event] = Number((await c.env.KV.get(`count:${event}:total`)) ?? '0')
  }
  return c.json(out)
})

app.notFound((c) => c.env.ASSETS.fetch(c.req.raw))

export default app
