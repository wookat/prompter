import { Hono } from 'hono'

interface Env {
  KV: KVNamespace
  ASSETS: Fetcher
  AE: AnalyticsEngineDataset
  TRACK_RL: RateLimit
  ACCOUNT_ID: string
  AE_SQL_TOKEN: string
  STATS_KEY?: string
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

// Counter architecture: /api/track writes atomic data points to Analytics
// Engine (no read-modify-write race, no response-blocking KV round trips).
// A daily cron folds AE counts into KV all-time totals (single writer, so
// no race; AE only retains ~90 days). /api/stats = KV totals + AE counts
// since the last rollup.
const AE_DATASET = 'prompter_events'
const ROLLUP_KEY = 'ae:rollup_ts'
/** When AE ingestion started; counts before this live only in KV. */
const AE_EPOCH = '2026-08-14 00:00:00'

interface CountRow {
  event: string
  slug: string
  n: number
}

async function aeCounts(env: Env, from: string, to?: string): Promise<CountRow[]> {
  const range =
    `timestamp >= toDateTime('${from}')` +
    (to ? ` AND timestamp < toDateTime('${to}')` : '')
  const sql =
    `SELECT blob1 AS event, blob2 AS slug, SUM(_sample_interval) AS n ` +
    `FROM ${AE_DATASET} WHERE ${range} GROUP BY event, slug`
  const res = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${env.ACCOUNT_ID}/analytics_engine/sql`,
    {
      method: 'POST',
      headers: { authorization: `Bearer ${env.AE_SQL_TOKEN}` },
      body: sql,
    },
  )
  if (!res.ok) throw new Error(`AE query failed: ${res.status}`)
  const json = await res.json<{ data: { event: string; slug: string; n: string }[] }>()
  return json.data.map((r) => ({ event: r.event, slug: r.slug, n: Number(r.n) }))
}

const sqlTime = (d: Date) => d.toISOString().slice(0, 19).replace('T', ' ')

/** Fold AE counts up to (now - 10 min, letting ingestion settle) into KV totals. */
async function rollup(env: Env): Promise<void> {
  const from = (await env.KV.get(ROLLUP_KEY)) ?? AE_EPOCH
  const to = sqlTime(new Date(Date.now() - 10 * 60_000))
  if (to <= from) return
  const rows = await aeCounts(env, from, to)
  for (const row of rows) {
    const keys = [`count:${row.event}:total`]
    if (row.event === 'usecase_view' && row.slug) {
      keys.push(`count:usecase_view:${row.slug}:total`)
    }
    for (const key of keys) {
      const current = Number((await env.KV.get(key)) ?? '0')
      await env.KV.put(key, String(current + row.n))
    }
  }
  await env.KV.put(ROLLUP_KEY, to)
}

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
  const ip = c.req.header('cf-connecting-ip') ?? 'unknown'
  const { success } = await c.env.TRACK_RL.limit({ key: ip })
  if (!success) return c.json({ error: 'rate limited' }, 429)
  const body = await c.req
    .json<{ event?: string; slug?: string }>()
    .catch(() => ({ event: undefined, slug: undefined }))
  const event = body.event
  if (!event || !EVENTS.has(event)) return c.json({ error: 'unknown event' }, 400)
  const slug =
    event === 'usecase_view' && typeof body.slug === 'string' && SLUG_RE.test(body.slug)
      ? body.slug
      : ''
  c.env.AE.writeDataPoint({ blobs: [event, slug], indexes: [event] })
  return c.json({ ok: true })
})

app.get('/api/stats', async (c) => {
  // Internal metrics — not public. Requires ?key=<STATS_KEY> (wrangler secret).
  if (!c.env.STATS_KEY || c.req.query('key') !== c.env.STATS_KEY) {
    return c.json({ error: 'not found' }, 404)
  }
  const events = [...EVENTS]
  const [values, slugList, rollupTs] = await Promise.all([
    Promise.all(events.map((e) => c.env.KV.get(`count:${e}:total`))),
    c.env.KV.list({ prefix: 'count:usecase_view:' }),
    c.env.KV.get(ROLLUP_KEY),
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
  const live = await aeCounts(c.env, rollupTs ?? AE_EPOCH).catch(() => [])
  for (const row of live) {
    out[row.event] = (out[row.event] ?? 0) + row.n
    if (row.event === 'usecase_view' && row.slug) {
      const key = `usecase_view:${row.slug}`
      out[key] = (out[key] ?? 0) + row.n
    }
  }
  c.header('cache-control', 'public, max-age=60')
  return c.json(out)
})

app.notFound(async (c) => {
  const res = await c.env.ASSETS.fetch(c.req.raw)
  const headers = new Headers(res.headers)
  for (const [k, v] of Object.entries(SECURITY_HEADERS)) headers.set(k, v)
  return new Response(res.body, { status: res.status, statusText: res.statusText, headers })
})

export default {
  fetch: app.fetch,
  scheduled(_controller: ScheduledController, env: Env, ctx: ExecutionContext) {
    ctx.waitUntil(rollup(env))
  },
}
