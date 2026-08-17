import { Suspense, lazy, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  AlignCenter,
  AlignLeft,
  Check,
  Eye,
  FlipHorizontal2,
  FlipVertical2,
  FolderOpen,
  Mic,
  Play,
  Save,
  Upload,
  Trash2,
  X,
} from 'lucide-react'
import { SiteFooter, SiteHeader } from '@/components/Layout'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  type PrompterSettings,
  type SavedScript,
  TEXT_COLORS,
  type TextColor,
  countWords,
  estimateSeconds,
  formatDuration,
  loadCurrentText,
  loadScripts,
  loadSettings,
  saveCurrentText,
  saveScripts,
  saveSettings,
  speedToWpm,
  upsertScript,
} from '@/lib/store'
import { track } from '@/lib/track'
import { COMPARISON, FAQ, FEATURES, SAMPLE, STEPS } from '@/lib/homeContent'
import { CTA_START_FREE, USE_CASE_LINKS } from '@/lib/useCaseLinks'
import { voiceSupported } from '@/lib/voice'

const prompterModule = () => import('@/components/Prompter')
const Prompter = lazy(prompterModule)

export default function Home() {
  const [text, setText] = useState<string>(() => loadCurrentText() || SAMPLE)
  const [settings, setSettings] = useState<PrompterSettings>(() => loadSettings())
  const [scripts, setScripts] = useState<SavedScript[]>(() => loadScripts())
  const [running, setRunning] = useState(false)
  const [saved, setSaved] = useState(false)
  const [editorError, setEditorError] = useState<string | null>(null)
  const [starts, setStarts] = useState<number | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const savedTimerRef = useRef<number | null>(null)
  const editorErrorTimerRef = useRef<number | null>(null)

  const looksBinary = (content: string) => {
    if (content.includes('\0')) return true
    const sample = content.slice(0, 2000)
    let bad = 0
    for (const ch of sample) {
      const c = ch.codePointAt(0) ?? 0
      if (c === 0xfffd || (c < 32 && c !== 9 && c !== 10 && c !== 13)) bad++
    }
    return sample.length > 0 && bad / sample.length > 0.05
  }

  const showEditorError = (msg: string) => {
    setEditorError(msg)
    if (editorErrorTimerRef.current) window.clearTimeout(editorErrorTimerRef.current)
    editorErrorTimerRef.current = window.setTimeout(() => setEditorError(null), 4000)
  }

  const importFile = (file: File) => {
    const reader = new FileReader()
    reader.onload = () => {
      const content = typeof reader.result === 'string' ? reader.result : ''
      if (!content.trim() || looksBinary(content)) {
        showEditorError('That file doesn\u2019t look like a text script (.txt / .md).')
        return
      }
      const unsaved =
        text.trim() &&
        text !== SAMPLE &&
        text !== content &&
        !scripts.some((s) => s.text === text)
      if (
        unsaved &&
        !window.confirm(
          'Replace your current script with the imported file? Your current text is not saved.',
        )
      ) {
        return
      }
      setText(content)
      track('script_import')
    }
    reader.readAsText(file)
  }

  useEffect(() => {
    track('page_view')
    const t = window.setTimeout(() => void prompterModule(), 2000)
    return () => window.clearTimeout(t)
  }, [])

  useEffect(() => {
    // Live anonymous aggregate — real usage, shown only once meaningful.
    fetch('/api/pulse')
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { starts?: number } | null) => {
        if (d && typeof d.starts === 'number' && d.starts >= 500) setStarts(d.starts)
      })
      .catch(() => undefined)
  }, [])

  useEffect(() => {
    saveCurrentText(text)
  }, [text])

  const updateSettings = useCallback((next: PrompterSettings) => {
    setSettings(next)
    saveSettings(next)
  }, [])

  const words = useMemo(() => countWords(text), [text])
  const seconds = useMemo(() => estimateSeconds(text), [text])

  const saveScript = () => {
    if (!text.trim()) return
    const next = upsertScript(scripts, text)
    if (!saveScripts(next)) {
      showEditorError('Couldn\u2019t save \u2014 device storage is full or unavailable.')
      return
    }
    setScripts(next)
    setSaved(true)
    if (savedTimerRef.current) window.clearTimeout(savedTimerRef.current)
    savedTimerRef.current = window.setTimeout(() => setSaved(false), 1500)
    track('script_save')
  }

  const deleteScript = (id: string) => {
    const next = scripts.filter((s) => s.id !== id)
    if (!saveScripts(next)) {
      showEditorError('Couldn\u2019t delete \u2014 device storage is unavailable.')
      return
    }
    setScripts(next)
  }

  return (
    <div id="top" className="flex min-h-svh flex-col">
      <a
        href="#editor"
        className="bg-primary text-primary-foreground sr-only z-50 rounded-lg px-4 py-2 font-semibold focus:not-sr-only focus:absolute focus:top-2 focus:left-2"
      >
        Skip to script editor
      </a>
      <SiteHeader />

      <main className="flex-1">
        {/* hero + editor */}
        <section className="mx-auto max-w-6xl px-4 pt-12 pb-10 sm:pt-16">
          <div className="text-center">
            <p className="bg-accent text-accent-foreground mx-auto w-fit rounded-full px-4 py-1.5 text-xs font-semibold tracking-wide">
              Free forever · No signup · No watermark · Private
            </p>
            <h1 className="mx-auto mt-5 max-w-3xl text-4xl font-extrabold tracking-tight text-balance sm:text-6xl">
              Read your script.
              <br />
              Look at the camera.
            </h1>
            <p className="text-muted-foreground mx-auto mt-4 max-w-2xl text-base text-balance sm:text-lg">
              A free online teleprompter that runs right in your browser. Paste your
              script, press Start, and read at your own pace — your script never leaves
              your device.
            </p>
            {starts !== null && (
              <p className="text-muted-foreground mt-3 text-sm">
                <span className="text-foreground font-semibold tabular-nums">
                  {(Math.floor(starts / 100) * 100).toLocaleString()}+
                </span>{' '}
                teleprompter sessions started here — live count, no account needed
              </p>
            )}
          </div>

          <div id="editor" className="mt-10 grid scroll-mt-20 gap-6 lg:grid-cols-[1fr_310px]">
            {/* dark studio editor */}
            <div className="flex min-w-0 flex-col overflow-hidden rounded-3xl bg-neutral-900 shadow-xl ring-1 ring-black/10">
              <div className="flex items-center gap-2 border-b border-white/10 px-5 py-3">
                <span className="size-2.5 rounded-full bg-red-400/80" aria-hidden />
                <span className="size-2.5 rounded-full bg-amber-400/80" aria-hidden />
                <span className="size-2.5 rounded-full bg-emerald-400/80" aria-hidden />
                <span className="ml-2 text-xs font-medium tracking-wide whitespace-nowrap text-white/50 max-sm:hidden">
                  Your script
                </span>
                <span className="ml-auto text-xs whitespace-nowrap text-white/50 tabular-nums">
                  {words} words · ≈ {formatDuration(seconds)} spoken
                </span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".txt,.md,.text,text/plain,text/markdown"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0]
                    if (f) importFile(f)
                    e.target.value = ''
                  }}
                />
                <button
                  type="button"
                  className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-white/60 hover:bg-white/10 hover:text-white"
                  onClick={() => fileInputRef.current?.click()}
                  title="Import a .txt or .md file — read locally, never uploaded"
                >
                  <Upload className="size-3.5" /> Import
                </button>
              </div>
              {editorError && (
                <p className="border-b border-white/10 bg-red-500/15 px-5 py-2 text-xs text-red-300">
                  {editorError}
                </p>
              )}
              <textarea
                aria-label="Your script"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Type or paste your script here…"
                className="min-h-56 w-full min-w-0 flex-1 bg-transparent px-5 py-4 text-base leading-relaxed text-white outline-none placeholder:text-white/40 max-sm:resize-none sm:min-h-96 sm:resize-y sm:text-lg"
              />
              <div className="flex items-center justify-between border-t border-white/10 px-5 py-2.5 text-xs text-white/40">
                <span>
                  Autosaved locally — nothing is uploaded · Need a script?{' '}
                  <a
                    href="https://speech.zalize.com"
                    target="_blank"
                    rel="noopener"
                    className="underline hover:text-white/70"
                  >
                    Try SpeakEasy
                  </a>
                </span>
                <span className="max-sm:hidden">Space to pause · M mirror · Esc exit</span>
              </div>
            </div>

            {/* control deck */}
            <section
              aria-label="Prompter settings"
              className="min-w-0 space-y-5 rounded-3xl border bg-white p-5 shadow-sm"
            >
              <div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="speed" className="font-semibold">
                    Speed
                  </Label>
                  <span className="text-muted-foreground text-sm tabular-nums">
                    ≈{speedToWpm(settings.speed)} wpm
                  </span>
                </div>
                <input
                  id="speed"
                  type="range"
                  min={1}
                  max={20}
                  value={settings.speed}
                  onChange={(e) =>
                    updateSettings({ ...settings, speed: Number(e.target.value) })
                  }
                  className="accent-primary mt-1.5 h-8 w-full"
                />
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="fontSize" className="font-semibold">
                    Text size
                  </Label>
                  <span className="text-muted-foreground text-sm tabular-nums">
                    {settings.fontSize}px
                  </span>
                </div>
                <input
                  id="fontSize"
                  type="range"
                  min={20}
                  max={120}
                  step={4}
                  value={settings.fontSize}
                  onChange={(e) =>
                    updateSettings({ ...settings, fontSize: Number(e.target.value) })
                  }
                  className="accent-primary mt-1.5 h-8 w-full"
                />
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="countdown" className="font-semibold">
                    Countdown
                  </Label>
                  <span className="text-muted-foreground text-sm tabular-nums">
                    {settings.countdown}s
                  </span>
                </div>
                <input
                  id="countdown"
                  type="range"
                  min={0}
                  max={10}
                  value={settings.countdown}
                  onChange={(e) =>
                    updateSettings({ ...settings, countdown: Number(e.target.value) })
                  }
                  className="accent-primary mt-1.5 h-8 w-full"
                />
              </div>
              <Button
                className="w-full text-base font-bold shadow-md"
                size="lg"
                disabled={!text.trim()}
                onClick={() => setRunning(true)}
              >
                <Play /> Start teleprompter
              </Button>

              <div className="space-y-2 border-t pt-4">
                <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                  Display
                </p>
                <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant={settings.mirrorX ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    if (!settings.mirrorX) track('mirror_on')
                    updateSettings({ ...settings, mirrorX: !settings.mirrorX })
                  }}
                >
                  <FlipHorizontal2 /> Mirror H
                </Button>
                <Button
                  type="button"
                  variant={settings.mirrorY ? 'default' : 'outline'}
                  size="sm"
                  onClick={() =>
                    updateSettings({ ...settings, mirrorY: !settings.mirrorY })
                  }
                >
                  <FlipVertical2 /> Mirror V
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    updateSettings({
                      ...settings,
                      align: settings.align === 'left' ? 'center' : 'left',
                    })
                  }
                >
                  {settings.align === 'left' ? <AlignLeft /> : <AlignCenter />}
                  {settings.align === 'left' ? 'Left' : 'Center'}
                </Button>
                <Button
                  type="button"
                  variant={settings.guide ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => updateSettings({ ...settings, guide: !settings.guide })}
                >
                  <Eye /> Guide
                </Button>
                {voiceSupported() && (
                  <Button
                    type="button"
                    variant={settings.voice ? 'default' : 'outline'}
                    size="sm"
                    title="Voice follow — the scroll tracks your reading (in-browser, nothing uploaded)"
                    onClick={() =>
                      updateSettings({ ...settings, voice: !settings.voice })
                    }
                  >
                    <Mic /> Voice
                  </Button>
                )}
                </div>
                <div className="flex gap-2">
                  {(Object.keys(TEXT_COLORS) as TextColor[]).map((c) => (
                    <button
                      key={c}
                      type="button"
                      aria-label={`Text color ${c}`}
                      aria-pressed={settings.textColor === c}
                      onClick={() => updateSettings({ ...settings, textColor: c })}
                      className={`flex h-8 flex-1 items-center justify-center rounded-lg border bg-neutral-900 text-sm font-bold ${
                        settings.textColor === c
                          ? 'ring-primary ring-2'
                          : 'hover:border-neutral-400'
                      }`}
                      style={{ color: TEXT_COLORS[c] }}
                    >
                      Aa
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  disabled={!text.trim()}
                  onClick={saveScript}
                >
                  {saved ? (
                    <>
                      <Check className="text-emerald-600" /> Saved
                    </>
                  ) : (
                    <>
                      <Save /> Save script
                    </>
                  )}
                </Button>
              </div>

              {scripts.length > 0 && (
                <div>
                  <p className="text-muted-foreground mb-2 flex items-center gap-1.5 text-xs font-semibold">
                    <FolderOpen className="size-3.5" /> Saved scripts (on this device)
                  </p>
                  <ul className="space-y-1">
                    {scripts.map((s) => (
                      <li key={s.id} className="flex items-center gap-1">
                        <button
                          className="hover:bg-accent min-w-0 flex-1 truncate rounded-md px-2 py-1.5 text-left text-sm"
                          onClick={() => setText(s.text)}
                          title={s.title}
                        >
                          {s.title}
                        </button>
                        <button
                          className="text-muted-foreground hover:text-destructive rounded-md p-1.5"
                          onClick={() => deleteScript(s.id)}
                          aria-label={`Delete ${s.title}`}
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </section>
          </div>
        </section>

        {/* how it works */}
        <section id="how-it-works" className="border-t bg-white">
          <div className="mx-auto max-w-6xl scroll-mt-20 px-4 py-16 sm:py-20">
            <div className="grid items-center gap-10 lg:grid-cols-2">
              <div className="relative overflow-hidden rounded-3xl shadow-xl ring-1 ring-black/10">
                <img
                  src="/media/creator-recording.webp"
                  alt="A creator reading from a phone teleprompter while recording at her desk"
                  width={1200}
                  height={800}
                  loading="lazy"
                  decoding="async"
                  className="block h-auto w-full"
                />
                <span className="absolute bottom-3 left-3 rounded-full bg-black/60 px-3 py-1 text-xs font-medium text-white backdrop-blur">
                  Any camera, any phone — just prop it up and read
                </span>
              </div>
              <div>
                <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
                  On camera in three steps
                </h2>
                <div className="mt-8 space-y-6">
                  {STEPS.map((s, i) => (
                    <div key={s.title} className="flex gap-4">
                      <span className="bg-primary text-primary-foreground flex size-9 shrink-0 items-center justify-center rounded-xl text-sm font-extrabold">
                        {i + 1}
                      </span>
                      <div>
                        <h3 className="text-lg font-bold">{s.title}</h3>
                        <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
                          {s.text}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* features */}
        <section className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
          <h2 className="text-center text-3xl font-extrabold tracking-tight sm:text-4xl">
            Everything a teleprompter should be — free
          </h2>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="rounded-2xl border bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <span className="bg-accent flex size-11 items-center justify-center rounded-xl">
                  <f.icon className="text-accent-foreground size-5" aria-hidden />
                </span>
                <h3 className="mt-4 font-bold">{f.title}</h3>
                <p className="text-muted-foreground mt-1.5 text-sm leading-relaxed">
                  {f.text}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* comparison */}
        <section className="border-t bg-white">
          <div className="mx-auto max-w-4xl px-4 py-16 sm:py-20">
            <h2 className="text-center text-3xl font-extrabold tracking-tight sm:text-4xl">
              Why creators pick PromptCue
            </h2>
            <p className="text-muted-foreground mx-auto mt-3 max-w-2xl text-center text-sm sm:text-base">
              Everything the paid teleprompter apps charge for, without the paywall.
            </p>
            <div className="mt-10 overflow-x-auto rounded-2xl border shadow-sm">
              <table className="w-full min-w-[520px] text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="text-muted-foreground px-4 py-3 font-medium">
                      <span className="sr-only">Feature</span>
                    </th>
                    <th className="px-4 py-3 font-extrabold">PromptCue</th>
                    <th className="text-muted-foreground px-4 py-3 font-medium">
                      Typical teleprompter apps
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON.map((row) => (
                    <tr key={row.label} className="border-b last:border-b-0">
                      <td className="text-muted-foreground px-4 py-3 font-medium">
                        {row.label}
                      </td>
                      <td className="px-4 py-3 font-semibold">
                        {row.us === true ? (
                          <Check className="size-5 text-emerald-600" aria-label="Yes" />
                        ) : row.us === false ? (
                          <X className="text-muted-foreground size-5" aria-label="No" />
                        ) : (
                          row.us
                        )}
                      </td>
                      <td className="text-muted-foreground px-4 py-3">
                        {row.them === true ? (
                          <Check className="size-5" aria-label="Yes" />
                        ) : row.them === false ? (
                          <X className="size-5" aria-label="No" />
                        ) : (
                          row.them
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* use cases */}
        <section id="use-cases" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-16 sm:py-20">
          <h2 className="text-center text-3xl font-extrabold tracking-tight sm:text-4xl">
            One prompter, every speaking moment
          </h2>
          <p className="text-muted-foreground mx-auto mt-3 max-w-2xl text-center text-sm sm:text-base">
            Guides for getting the most out of a browser teleprompter in your situation.
          </p>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {USE_CASE_LINKS.map((u) => (
              <Link
                key={u.slug}
                to={u.path}
                className="hover:border-primary rounded-2xl border bg-white p-5 shadow-sm transition-colors"
              >
                <h3 className="text-sm font-bold">{u.name}</h3>
                <p className="text-muted-foreground mt-1.5 line-clamp-3 text-xs leading-relaxed">
                  {u.blurb}
                </p>
              </Link>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="border-t bg-white">
          <div className="mx-auto max-w-3xl scroll-mt-20 px-4 py-16 sm:py-20">
            <h2 className="text-center text-3xl font-extrabold tracking-tight sm:text-4xl">
              Frequently asked questions
            </h2>
            <div className="mt-10 space-y-3">
              {FAQ.map((f) => (
                <details
                  key={f.q}
                  className="group rounded-2xl border px-5 py-4 open:shadow-sm"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-bold [&::-webkit-details-marker]:hidden">
                    {f.q}
                    <span
                      className="text-muted-foreground transition-transform group-open:rotate-45"
                      aria-hidden
                    >
                      +
                    </span>
                  </summary>
                  <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
                    {f.a}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* CTA band */}
        <section className="bg-neutral-900">
          <div className="mx-auto max-w-6xl px-4 py-16 text-center sm:py-20">
            <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Ready when you are
            </h2>
            <p className="mt-3 text-base text-white/70">
              No signup, no download — your script is already waiting above.
            </p>
            <a
              href="#top"
              className="bg-primary text-primary-foreground hover:bg-primary/90 mt-8 inline-flex items-center gap-2 rounded-xl px-8 py-3.5 text-base font-bold shadow-lg"
            >
              <Play className="size-5" /> {CTA_START_FREE}
            </a>
          </div>
        </section>
      </main>

      <SiteFooter />

      {running && (
        <Suspense fallback={null}>
          <Prompter
            text={text}
            settings={settings}
            onSettingsChange={updateSettings}
            onClose={() => setRunning(false)}
          />
        </Suspense>
      )}
    </div>
  )
}
