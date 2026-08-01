import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  AlignCenter,
  AlignLeft,
  Clock,
  Eye,
  FlipHorizontal2,
  FlipVertical2,
  FolderOpen,
  Lock,
  MonitorSmartphone,
  Play,
  Save,
  ScrollText,
  Trash2,
  Zap,
} from 'lucide-react'
import { SiteFooter, SiteHeader } from '@/components/Layout'
import Prompter from '@/components/Prompter'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  type PrompterSettings,
  type SavedScript,
  countWords,
  estimateSeconds,
  formatDuration,
  loadCurrentText,
  loadScripts,
  loadSettings,
  saveCurrentText,
  saveScripts,
  saveSettings,
} from '@/lib/store'
import { track } from '@/lib/track'
import { USE_CASES } from '@/lib/useCases'

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
    q: 'What keyboard shortcuts are there?',
    a: 'Space plays and pauses. Up/Down arrows change speed. Left/Right arrows change text size. M toggles mirror. R restarts. Esc exits.',
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
]

export default function Home() {
  const [text, setText] = useState<string>(() => loadCurrentText() || SAMPLE)
  const [settings, setSettings] = useState<PrompterSettings>(() => loadSettings())
  const [scripts, setScripts] = useState<SavedScript[]>(() => loadScripts())
  const [running, setRunning] = useState(false)

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
    const title =
      text
        .trim()
        .split('\n')[0]
        .slice(0, 60) || 'Untitled script'
    const next: SavedScript[] = [
      { id: crypto.randomUUID(), title, text, updatedAt: Date.now() },
      ...scripts,
    ].slice(0, 50)
    setScripts(next)
    saveScripts(next)
    track('script_save')
  }

  const deleteScript = (id: string) => {
    const next = scripts.filter((s) => s.id !== id)
    setScripts(next)
    saveScripts(next)
  }

  return (
    <div className="flex min-h-svh flex-col">
      <SiteHeader />

      <main className="flex-1">
        {/* hero + editor */}
        <section className="mx-auto max-w-5xl px-4 pt-10 pb-6">
          <div className="text-center">
            <h1 className="mx-auto max-w-3xl text-3xl font-bold tracking-tight sm:text-5xl">
              Free online teleprompter,
              <span className="text-primary"> right in your browser</span>
            </h1>
            <p className="text-muted-foreground mx-auto mt-3 max-w-2xl text-base sm:text-lg">
              Paste your script, press Start, and read at your own pace. No signup, no
              watermark, no word limit — and your script never leaves your device.
            </p>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_290px]">
            <div>
              <Textarea
                aria-label="Your script"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste or type your script here…"
                className="min-h-72 resize-y text-base leading-relaxed sm:min-h-96"
              />
              <div className="text-muted-foreground mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                <span>{words} words</span>
                <span>≈ {formatDuration(seconds)} spoken</span>
                <span className="max-sm:hidden">Autosaved locally</span>
              </div>
            </div>

            <aside className="space-y-4 rounded-xl border p-4">
              <div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="speed">Speed</Label>
                  <span className="text-muted-foreground text-sm">{settings.speed}</span>
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
                  className="accent-primary mt-1 w-full"
                />
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="fontSize">Text size</Label>
                  <span className="text-muted-foreground text-sm">
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
                  className="accent-primary mt-1 w-full"
                />
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="countdown">Countdown</Label>
                  <span className="text-muted-foreground text-sm">
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
                  className="accent-primary mt-1 w-full"
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
              </div>

              <Button
                className="w-full"
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
                  <Save /> Save script
                </Button>
              </div>

              {scripts.length > 0 && (
                <div>
                  <p className="text-muted-foreground mb-2 flex items-center gap-1.5 text-xs font-medium">
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

        {/* features */}
        <section className="border-t bg-neutral-50/60">
          <div className="mx-auto max-w-5xl px-4 py-12">
            <h2 className="text-center text-2xl font-bold">
              Everything a teleprompter should be — free
            </h2>
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map((f) => (
                <div key={f.title} className="rounded-xl border bg-white p-5">
                  <f.icon className="text-primary size-6" aria-hidden />
                  <h3 className="mt-3 font-semibold">{f.title}</h3>
                  <p className="text-muted-foreground mt-1 text-sm">{f.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* use cases */}
        <section id="use-cases" className="mx-auto max-w-5xl scroll-mt-6 px-4 py-12">
          <h2 className="text-center text-2xl font-bold">
            One prompter, every speaking moment
          </h2>
          <p className="text-muted-foreground mx-auto mt-2 max-w-2xl text-center text-sm">
            Guides for getting the most out of a browser teleprompter in your situation.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {USE_CASES.map((u) => (
              <Link
                key={u.slug}
                to={u.path}
                className="hover:border-primary/50 rounded-xl border p-4 transition-colors"
              >
                <h3 className="text-sm font-semibold">{u.name}</h3>
                <p className="text-muted-foreground mt-1 line-clamp-3 text-xs">
                  {u.intro}
                </p>
              </Link>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="border-t">
          <div className="mx-auto max-w-3xl scroll-mt-6 px-4 py-12">
            <h2 className="text-center text-2xl font-bold">Frequently asked questions</h2>
            <dl className="mt-8 space-y-6">
              {FAQ.map((f) => (
                <div key={f.q}>
                  <dt className="font-semibold">{f.q}</dt>
                  <dd className="text-muted-foreground mt-1 text-sm">{f.a}</dd>
                </div>
              ))}
            </dl>
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
