import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  AlignCenter,
  AlignLeft,
  Check,
  Clock,
  Eye,
  FlipHorizontal2,
  FlipVertical2,
  FolderOpen,
  Lock,
  Mic,
  MonitorSmartphone,
  Play,
  Save,
  Upload,
  ScrollText,
  Trash2,
  X,
  Zap,
} from 'lucide-react'
import { SiteFooter, SiteHeader } from '@/components/Layout'
import Prompter from '@/components/Prompter'
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
} from '@/lib/store'
import { track } from '@/lib/track'
import { USE_CASE_LINKS } from '@/lib/useCaseLinks'
import { voiceSupported } from '@/lib/voice'

const SAMPLE = `Welcome to PromptCue, your free online teleprompter.

Paste your script here — a speech, a video script, lecture notes, lyrics — anything you need to read out loud.

Press Start and the text scrolls at a steady pace, like this. Press the space bar (or tap the screen) to pause and resume. Use the up and down arrows to change speed, and the left and right arrows to change the text size.

Everything runs in your browser. Your script never leaves your device, there is no watermark, no word limit, and no account. Break a leg!`

const FAQ = [
  {
    q: 'Is PromptCue really free?',
    a: 'Yes — 100% free for personal and commercial use. No account, no watermark, no word limit, no paid tier hiding the useful features.',
  },
  {
    q: 'Is my script uploaded anywhere?',
    a: 'No. Your script lives only in your browser\u2019s local storage. Nothing you type or paste is ever sent to a server.',
  },
  {
    q: 'Does it work on phones and tablets?',
    a: 'Yes. The prompter is touch-friendly: tap to pause and resume, drag to seek, and the controls adapt to small screens. It works in Safari and Chrome without installing anything.',
  },
  {
    q: 'What is mirror mode for?',
    a: 'Hardware teleprompter rigs reflect the screen in angled beam-splitter glass, which flips the text. Mirror mode pre-flips it horizontally (and vertically if needed) so it reads correctly in the glass.',
  },
  {
    q: 'How does voice follow work?',
    a: 'Turn on Voice follow and the scroll tracks your reading: the text advances as you speak and waits when you pause. Speech recognition runs entirely in your browser (Chrome, Edge and Safari) — no audio is recorded or uploaded.',
  },
  {
    q: 'What keyboard shortcuts are there?',
    a: 'Space plays and pauses. Up/Down arrows change speed. Left/Right arrows change text size. M toggles horizontal mirror, V vertical. R restarts. Esc exits.',
  },
  {
    q: 'How do I estimate how long my script takes to read?',
    a: 'PromptCue shows a word count and an estimated speaking time (at roughly 140 words per minute) under the editor as you type.',
  },
]

const FEATURES = [
  {
    icon: Zap,
    title: 'Instant, no signup',
    text: 'Paste your script and start prompting in seconds. No account, no install, no watermark on the scrolling view.',
  },
  {
    icon: Lock,
    title: 'Private by design',
    text: 'Scripts are stored only in your browser. Nothing is uploaded — safe for unreleased scripts and confidential notes.',
  },
  {
    icon: MonitorSmartphone,
    title: 'Any device',
    text: 'Desktop, tablet or phone. Touch controls on mobile, keyboard shortcuts on desktop, mirror mode for hardware rigs.',
  },
  {
    icon: ScrollText,
    title: 'No word limit',
    text: 'A 30-second ad read or a 90-minute lecture — the scroll stays smooth and free at any length.',
  },
  {
    icon: Clock,
    title: 'Speaking-time estimate',
    text: 'Word count and estimated duration update as you type, so your script fits the slot before you record.',
  },
  {
    icon: Eye,
    title: 'Eye-line guide',
    text: 'A subtle marker keeps the current line where your eyes naturally rest, near the camera lens.',
  },
  {
    icon: Mic,
    title: 'Voice follow',
    text: 'The scroll tracks your reading — speak and the text advances, pause and it waits. Recognition runs in your browser; no audio is uploaded.',
  },
  {
    icon: Upload,
    title: 'Import your script',
    text: 'Bring a .txt or .md file straight from your notes app — read locally in your browser, never uploaded.',
  },
  {
    icon: Save,
    title: 'Saved scripts',
    text: 'Keep up to 50 scripts on this device and reload them in one click — handy for recurring intros and set lists.',
  },
]

const STEPS = [
  {
    title: 'Paste your script',
    text: 'Type or paste anything — a speech, video script, lecture or lyrics. It autosaves locally as you type.',
  },
  {
    title: 'Set your pace',
    text: 'Pick a scroll speed and text size, add a countdown, and flip on mirror mode for a beam-splitter rig.',
  },
  {
    title: 'Press Start & read',
    text: 'Fullscreen, smooth scrolling with an eye-line guide. Space or tap to pause, arrows to fine-tune live.',
  },
]

const COMPARISON: { label: string; us: string | boolean; them: string | boolean }[] = [
  { label: 'Price', us: '100% free, no paid tier', them: 'Free trial, then subscription' },
  { label: 'Account required', us: false, them: true },
  { label: 'Watermark on output', us: false, them: 'Often on free plan' },
  { label: 'Script privacy', us: 'Never leaves your device', them: 'Uploaded to cloud' },
  { label: 'Word / script limit', us: 'Unlimited', them: 'Limited on free plan' },
  { label: 'Mirror & flip modes', us: true, them: true },
  { label: 'Voice-follow scrolling', us: true, them: 'Paid feature' },
  { label: 'Countdown + eye-line guide', us: true, them: 'Varies' },
  { label: 'Works without install', us: true, them: 'App download required' },
]

export default function Home() {
  const [text, setText] = useState<string>(() => loadCurrentText() || SAMPLE)
  const [settings, setSettings] = useState<PrompterSettings>(() => loadSettings())
  const [scripts, setScripts] = useState<SavedScript[]>(() => loadScripts())
  const [running, setRunning] = useState(false)
  const [saved, setSaved] = useState(false)
  const [importError, setImportError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const savedTimerRef = useRef<number | null>(null)
  const importErrorTimerRef = useRef<number | null>(null)

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

  const showImportError = (msg: string) => {
    setImportError(msg)
    if (importErrorTimerRef.current) window.clearTimeout(importErrorTimerRef.current)
    importErrorTimerRef.current = window.setTimeout(() => setImportError(null), 4000)
  }

  const importFile = (file: File) => {
    const reader = new FileReader()
    reader.onload = () => {
      const content = typeof reader.result === 'string' ? reader.result : ''
      if (!content.trim() || looksBinary(content)) {
        showImportError('That file doesn\u2019t look like a text script (.txt / .md).')
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
    const firstLine = text.trim().split('\n')[0].trim()
    const title =
      firstLine.length <= 60
        ? firstLine || 'Untitled script'
        : `${(firstLine.slice(0, 60).replace(/\s+\S*$/, '') || firstLine.slice(0, 59)).trimEnd()}…`
    const existing = scripts.find((s) => s.text === text)
    const next: SavedScript[] = existing
      ? [
          { ...existing, title, updatedAt: Date.now() },
          ...scripts.filter((s) => s.id !== existing.id),
        ]
      : [
          { id: crypto.randomUUID(), title, text, updatedAt: Date.now() },
          ...scripts,
        ].slice(0, 50)
    setScripts(next)
    saveScripts(next)
    setSaved(true)
    if (savedTimerRef.current) window.clearTimeout(savedTimerRef.current)
    savedTimerRef.current = window.setTimeout(() => setSaved(false), 1500)
    track('script_save')
  }

  const deleteScript = (id: string) => {
    const next = scripts.filter((s) => s.id !== id)
    setScripts(next)
    saveScripts(next)
  }

  return (
    <div id="top" className="flex min-h-svh flex-col">
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
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_310px]">
            {/* dark studio editor */}
            <div className="flex min-w-0 flex-col overflow-hidden rounded-3xl bg-neutral-900 shadow-xl ring-1 ring-black/10">
              <div className="flex items-center gap-2 border-b border-white/10 px-5 py-3">
                <span className="size-2.5 rounded-full bg-red-400/80" aria-hidden />
                <span className="size-2.5 rounded-full bg-amber-400/80" aria-hidden />
                <span className="size-2.5 rounded-full bg-emerald-400/80" aria-hidden />
                <span className="ml-2 text-xs font-medium tracking-wide text-white/50">
                  Your script
                </span>
                <span className="ml-auto text-xs text-white/50 tabular-nums">
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
              {importError && (
                <p className="border-b border-white/10 bg-red-500/15 px-5 py-2 text-xs text-red-300">
                  {importError}
                </p>
              )}
              <textarea
                aria-label="Your script"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Type or paste your script here…"
                className="min-h-72 w-full min-w-0 flex-1 resize-y bg-transparent px-5 py-4 text-base leading-relaxed text-white outline-none placeholder:text-white/40 sm:min-h-96 sm:text-lg"
              />
              <div className="flex items-center justify-between border-t border-white/10 px-5 py-2.5 text-xs text-white/40">
                <span>
                  Autosaved locally — nothing is uploaded · Need a script?{' '}
                  <a
                    href="https://speech.zalize.com"
                    className="underline hover:text-white/70"
                  >
                    Try SpeakEasy
                  </a>
                </span>
                <span className="max-sm:hidden">Space to pause · M mirror · Esc exit</span>
              </div>
            </div>

            {/* control deck */}
            <aside className="min-w-0 space-y-5 rounded-3xl border bg-white p-5 shadow-sm">
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
                  <FlipHorizontal2 /> Mirror
                </Button>
                <Button
                  type="button"
                  variant={settings.mirrorY ? 'default' : 'outline'}
                  size="sm"
                  onClick={() =>
                    updateSettings({ ...settings, mirrorY: !settings.mirrorY })
                  }
                >
                  <FlipVertical2 /> Flip
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

              <div>
                <Label className="font-semibold">Text color</Label>
                <div className="mt-1.5 flex gap-2">
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

              <Button
                className="w-full text-base font-bold shadow-md"
                size="lg"
                disabled={!text.trim()}
                onClick={() => setRunning(true)}
              >
                <Play /> Start teleprompter
              </Button>

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
            </aside>
          </div>
        </section>

        {/* how it works */}
        <section id="how-it-works" className="border-t bg-white">
          <div className="mx-auto max-w-6xl scroll-mt-20 px-4 py-16 sm:py-20">
            <h2 className="text-center text-3xl font-extrabold tracking-tight sm:text-4xl">
              On camera in three steps
            </h2>
            <div className="mt-10 grid gap-6 sm:grid-cols-3">
              {STEPS.map((s, i) => (
                <div key={s.title} className="rounded-2xl border p-6">
                  <span className="bg-primary text-primary-foreground flex size-9 items-center justify-center rounded-xl text-sm font-extrabold">
                    {i + 1}
                  </span>
                  <h3 className="mt-4 text-lg font-bold">{s.title}</h3>
                  <p className="text-muted-foreground mt-1.5 text-sm leading-relaxed">
                    {s.text}
                  </p>
                </div>
              ))}
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
                    <th className="text-muted-foreground px-4 py-3 font-medium" />
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
              <Play className="size-5" /> Start prompting — it&rsquo;s free
            </a>
          </div>
        </section>
      </main>

      <SiteFooter />

      {running && (
        <Prompter
          text={text}
          settings={settings}
          onSettingsChange={updateSettings}
          onClose={() => setRunning(false)}
        />
      )}
    </div>
  )
}
