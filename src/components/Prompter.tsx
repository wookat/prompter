import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  ALargeSmall,
  ChevronsDown,
  ChevronsUp,
  FlipHorizontal2,
  FlipVertical2,
  Mic,
  MicOff,
  Minus,
  Pause,
  Play,
  Plus,
  RotateCcw,
  X,
} from 'lucide-react'
import { track } from '@/lib/track'
import {
  TEXT_COLORS,
  type PrompterSettings,
  estimateSeconds,
  speedToPxPerSecond,
  speedToWpm,
} from '@/lib/store'
import {
  advanceMatch,
  getSpeechRecognition,
  tokenizeScript,
  tokenizeSpeech,
  voiceSupported,
} from '@/lib/voice'

interface PrompterProps {
  text: string
  settings: PrompterSettings
  onSettingsChange: (next: PrompterSettings) => void
  onClose: () => void
}

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))

/** Above this size the initial text render takes long enough to need a loading state. */
const LARGE_TEXT_CHARS = 100_000

const coarsePointer = () => {
  try {
    return window.matchMedia('(pointer: coarse)').matches
  } catch {
    return false
  }
}

export default function Prompter({
  text,
  settings,
  onSettingsChange,
  onClose,
}: PrompterProps) {
  const [playing, setPlaying] = useState(false)
  const [countdown, setCountdown] = useState<number | null>(null)
  const [progress, setProgress] = useState(0)
  const [controlsVisible, setControlsVisible] = useState(true)
  const [voiceError, setVoiceError] = useState(false)

  const rootRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const offsetRef = useRef(0)
  const playingRef = useRef(false)
  const settingsRef = useRef(settings)
  const finishedRef = useRef(false)
  const hideTimerRef = useRef<number | null>(null)
  const countdownTimerRef = useRef<number | null>(null)
  const dragRef = useRef<{ y: number; offset: number; moved: boolean } | null>(null)
  const matchIdxRef = useRef(-1)
  const voiceTargetRef = useRef<number | null>(null)
  const voiceErrorRef = useRef(false)

  // Very large scripts block the main thread while React renders the
  // paragraphs; paint a lightweight “Preparing…” frame first.
  const [ready, setReady] = useState(() => text.length < LARGE_TEXT_CHARS)

  const touch = useMemo(() => coarsePointer(), [])
  const voiceActive = settings.voice && voiceSupported() && !voiceError
  const estSecs = useMemo(() => estimateSeconds(text), [text])
  const estSecsRef = useRef(estSecs)

  useEffect(() => {
    estSecsRef.current = estSecs
  }, [estSecs])

  useEffect(() => {
    settingsRef.current = settings
  }, [settings])

  // Scroll ends when the last line reaches the eye-line (25vh): the
  // content's 25vh top + 80vh bottom paddings are excluded, so the
  // distance equals the text's own height.
  const maxOffset = useCallback(() => {
    const content = contentRef.current
    if (!content) return 0
    return Math.max(0, content.scrollHeight - window.innerHeight * 1.05)
  }, [])

  const applyOffset = useCallback(() => {
    const content = contentRef.current
    if (!content) return
    const max = maxOffset()
    offsetRef.current = clamp(offsetRef.current, 0, max)
    content.style.transform = `translateY(${-offsetRef.current}px)`
    setProgress(max === 0 ? 0 : offsetRef.current / max)
  }, [maxOffset])

  const showControls = useCallback(() => {
    setControlsVisible(true)
    if (hideTimerRef.current) window.clearTimeout(hideTimerRef.current)
    hideTimerRef.current = window.setTimeout(() => setControlsVisible(false), 3500)
  }, [])

  const startPlaying = useCallback(() => {
    const secs = settingsRef.current.countdown
    if (offsetRef.current === 0 && secs > 0) {
      setCountdown(secs)
      let left = secs
      const tick = () => {
        left -= 1
        if (left <= 0) {
          countdownTimerRef.current = null
          setCountdown(null)
          playingRef.current = true
          setPlaying(true)
        } else {
          setCountdown(left)
          countdownTimerRef.current = window.setTimeout(tick, 1000)
        }
      }
      countdownTimerRef.current = window.setTimeout(tick, 1000)
    } else {
      playingRef.current = true
      setPlaying(true)
    }
  }, [])

  const cancelCountdown = useCallback(() => {
    if (countdownTimerRef.current !== null) {
      window.clearTimeout(countdownTimerRef.current)
      countdownTimerRef.current = null
    }
    setCountdown(null)
  }, [])

  const togglePlay = useCallback(() => {
    if (countdown !== null) {
      cancelCountdown()
      showControls()
      return
    }
    if (!playingRef.current && maxOffset() > 0 && offsetRef.current >= maxOffset()) {
      showControls()
      return
    }
    if (playingRef.current) {
      playingRef.current = false
      setPlaying(false)
    } else {
      startPlaying()
    }
    showControls()
  }, [countdown, cancelCountdown, maxOffset, startPlaying, showControls])

  const restart = useCallback(() => {
    cancelCountdown()
    playingRef.current = false
    setPlaying(false)
    finishedRef.current = false
    offsetRef.current = 0
    matchIdxRef.current = -1
    voiceTargetRef.current = null
    applyOffset()
    showControls()
  }, [applyOffset, cancelCountdown, showControls])

  // Voice-follow: browser speech recognition drives the scroll target
  useEffect(() => {
    voiceErrorRef.current = voiceError
  }, [voiceError])

  useEffect(() => {
    if (!(voiceActive && playing)) return
    const Ctor = getSpeechRecognition()
    if (!Ctor) return
    const { words } = tokenizeScript(text)
    const consumed = new Map<number, number>()
    let stopped = false
    const rec = new Ctor()
    rec.lang = navigator.language || 'en-US'
    rec.continuous = true
    rec.interimResults = true
    rec.onresult = (e) => {
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const tokens = tokenizeSpeech(e.results[i][0].transcript)
        const fresh = tokens.slice(consumed.get(i) ?? 0)
        if (fresh.length > 0) {
          matchIdxRef.current = advanceMatch(words, matchIdxRef.current, fresh)
          consumed.set(i, tokens.length)
          const el = contentRef.current?.querySelector<HTMLElement>(
            `[data-wi="${matchIdxRef.current}"]`,
          )
          if (el) {
            voiceTargetRef.current = Math.max(
              0,
              el.offsetTop - window.innerHeight * 0.25,
            )
          }
        }
      }
    }
    rec.onerror = (e) => {
      if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
        setVoiceError(true)
      }
    }
    rec.onend = () => {
      if (!stopped && playingRef.current) {
        try {
          rec.start()
        } catch {
          /* already started */
        }
      }
    }
    try {
      rec.start()
      track('voice_on')
    } catch {
      queueMicrotask(() => setVoiceError(true))
    }
    return () => {
      stopped = true
      rec.onend = null
      rec.stop()
    }
  }, [voiceActive, playing, text])

  // Keep the screen awake while scrolling (phone propped next to the camera)
  useEffect(() => {
    if (!playing || !('wakeLock' in navigator)) return
    let lock: WakeLockSentinel | null = null
    let active = true
    const acquire = () => {
      navigator.wakeLock
        .request('screen')
        .then((l) => {
          if (active) lock = l
          else void l.release().catch(() => undefined)
        })
        .catch(() => undefined)
    }
    const onVisibility = () => {
      if (document.visibilityState === 'visible') acquire()
    }
    acquire()
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      active = false
      document.removeEventListener('visibilitychange', onVisibility)
      void lock?.release().catch(() => undefined)
    }
  }, [playing])

  // Scroll loop
  useEffect(() => {
    let raf = 0
    let last = performance.now()
    const loop = (now: number) => {
      const dt = (now - last) / 1000
      last = now
      if (playingRef.current) {
        const max = maxOffset()
        const target = voiceTargetRef.current
        if (settingsRef.current.voice && !voiceErrorRef.current && target !== null) {
          const delta = target - offsetRef.current
          if (Math.abs(delta) > 1) {
            offsetRef.current += delta * Math.min(1, dt * 3)
          }
        } else if (!(settingsRef.current.voice && !voiceErrorRef.current)) {
          // Pace-calibrated scroll: at speed 6 the script text takes the
          // spoken-time estimate; other speeds scale linearly. maxOffset is
          // the text's own height, so the pace matches the wpm label.
          const baseSecs = estSecsRef.current
          const pace = settingsRef.current.speed / 6
          const pps =
            baseSecs > 4 && max > 0
              ? (max / baseSecs) * pace
              : speedToPxPerSecond(settingsRef.current.speed)
          offsetRef.current += pps * dt
        }
        if (offsetRef.current >= max) {
          offsetRef.current = max
          playingRef.current = false
          setPlaying(false)
          if (!finishedRef.current) {
            finishedRef.current = true
            track('prompter_finish')
          }
        }
        applyOffset()
      }
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [applyOffset, maxOffset])

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const s = settingsRef.current
      switch (e.key) {
        case ' ':
          e.preventDefault()
          togglePlay()
          break
        case 'ArrowUp':
          e.preventDefault()
          onSettingsChange({ ...s, speed: clamp(s.speed + 1, 1, 20) })
          showControls()
          break
        case 'ArrowDown':
          e.preventDefault()
          onSettingsChange({ ...s, speed: clamp(s.speed - 1, 1, 20) })
          showControls()
          break
        case 'ArrowRight':
          e.preventDefault()
          onSettingsChange({ ...s, fontSize: clamp(s.fontSize + 4, 20, 120) })
          showControls()
          break
        case 'ArrowLeft':
          e.preventDefault()
          onSettingsChange({ ...s, fontSize: clamp(s.fontSize - 4, 20, 120) })
          showControls()
          break
        case 'Home':
        case 'r':
        case 'R':
          e.preventDefault()
          restart()
          break
        case 'm':
        case 'M':
          onSettingsChange({ ...s, mirrorX: !s.mirrorX })
          showControls()
          break
        case 'v':
        case 'V':
          onSettingsChange({ ...s, mirrorY: !s.mirrorY })
          showControls()
          break
        case 'Escape':
          onClose()
          break
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [togglePlay, restart, onClose, onSettingsChange, showControls])

  // Fullscreen on open, auto-start (countdown → scroll), restore on close
  useEffect(() => {
    const el = rootRef.current
    if (el?.requestFullscreen) {
      el.requestFullscreen().catch(() => undefined)
    }
    hideTimerRef.current = window.setTimeout(() => setControlsVisible(false), 3500)
    track('prompter_start')
    return () => {
      if (countdownTimerRef.current !== null) {
        window.clearTimeout(countdownTimerRef.current)
      }
      if (document.fullscreenElement) {
        void document.exitFullscreen().catch(() => undefined)
      }
    }
  }, [])

  // Render the heavy text one frame after the “Preparing…” paint, then
  // auto-start (countdown → scroll)
  const startedRef = useRef(false)
  useEffect(() => {
    if (!ready) {
      const raf = requestAnimationFrame(() =>
        requestAnimationFrame(() => setReady(true)),
      )
      return () => cancelAnimationFrame(raf)
    }
    if (!startedRef.current) {
      startedRef.current = true
      startPlaying()
    }
  }, [ready, startPlaying])

  // Wheel to seek
  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      offsetRef.current += e.deltaY
      applyOffset()
      showControls()
    }
    const el = rootRef.current
    el?.addEventListener('wheel', onWheel, { passive: false })
    return () => el?.removeEventListener('wheel', onWheel)
  }, [applyOffset, showControls])

  // Touch/pointer: tap toggles play, drag seeks
  const onPointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest('[data-controls]')) return
    dragRef.current = { y: e.clientY, offset: offsetRef.current, moved: false }
  }
  const onPointerMove = (e: React.PointerEvent) => {
    const d = dragRef.current
    if (!d) return
    const delta = d.y - e.clientY
    if (Math.abs(delta) > 8) d.moved = true
    if (d.moved) {
      offsetRef.current = d.offset + delta
      applyOffset()
    }
  }
  const onPointerUp = () => {
    const d = dragRef.current
    dragRef.current = null
    if (d && !d.moved) togglePlay()
  }

  const transform = [
    settings.mirrorX ? 'scaleX(-1)' : '',
    settings.mirrorY ? 'scaleY(-1)' : '',
  ]
    .join(' ')
    .trim()

  const { paragraphs } = useMemo(
    () => (ready ? tokenizeScript(text) : { paragraphs: [] }),
    [ready, text],
  )

  return (
    <div
      ref={rootRef}
      className="fixed inset-0 z-50 touch-none overflow-hidden bg-black text-white select-none"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      role="application"
      aria-label="Teleprompter"
    >
      {/* progress bar */}
      <div className="absolute top-0 right-0 left-0 z-30 h-1 bg-white/10">
        <div
          className="bg-primary h-full transition-[width] duration-150"
          style={{ width: `${progress * 100}%` }}
        />
      </div>

      {/* eye-line guide */}
      {settings.guide && (
        <div className="pointer-events-none absolute top-[25vh] right-0 left-0 z-20 flex items-center">
          <div className="border-l-primary ml-1 h-0 w-0 border-y-8 border-l-12 border-y-transparent" />
          <div className="bg-primary/30 h-px flex-1" />
        </div>
      )}

      {/* scrolling text */}
      <div className="absolute inset-0" style={{ transform: transform || undefined }}>
        <div
          ref={contentRef}
          className="mx-auto max-w-4xl px-6 will-change-transform sm:px-10"
          style={{
            paddingTop: '25vh',
            paddingBottom: '80vh',
            fontSize: settings.fontSize,
            lineHeight: settings.lineHeight,
            textAlign: settings.align,
            color: TEXT_COLORS[settings.textColor] ?? TEXT_COLORS.white,
          }}
        >
          {ready &&
            paragraphs.map((chunks, i) => (
              <p key={i} className="mb-[1em] font-semibold tracking-wide">
                {chunks.map((c, j) =>
                  c.wi === null ? (
                    c.text
                  ) : (
                    <span key={j} data-wi={c.wi}>
                      {c.text}
                    </span>
                  ),
                )}
              </p>
            ))}
        </div>
      </div>

      {/* preparing overlay for very large scripts */}
      {!ready && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-black">
          <span className="animate-pulse text-lg text-white/70">
            Preparing your script…
          </span>
        </div>
      )}

      {/* paused hint */}
      {ready && !playing && countdown === null && (
        <div className="pointer-events-none absolute inset-x-0 bottom-[22vh] z-20 flex justify-center">
          <span className="rounded-full border border-white/25 bg-neutral-900 px-4 py-1.5 text-sm text-white shadow-lg">
            {progress >= 1
              ? touch
                ? 'Finished — tap ↻ to restart or ✕ to exit'
                : 'Finished — press R to restart · Esc to exit'
              : progress > 0
                ? touch
                  ? 'Paused — tap to resume'
                  : 'Paused — tap or press Space to resume'
                : touch
                  ? 'Tap to start'
                  : 'Tap or press Space to start'}
          </span>
        </div>
      )}

      {/* countdown overlay */}
      {countdown !== null && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/80">
          <span className="text-[20vh] font-bold tabular-nums">{countdown}</span>
        </div>
      )}

      {/* control bar */}
      <div
        data-controls
        className={`absolute right-0 bottom-0 left-0 z-30 transition-opacity duration-300 ${
          controlsVisible || (progress >= 1 && !playing)
            ? 'opacity-100'
            : 'pointer-events-none opacity-0'
        }`}
        onPointerDown={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-[max(0.75rem,env(safe-area-inset-bottom))] flex w-fit max-w-full flex-wrap items-center justify-center gap-1 rounded-2xl border border-white/15 bg-black/70 px-2 py-1.5 backdrop-blur sm:gap-2 sm:px-3">
          <button
            className="rounded-xl p-2.5 hover:bg-white/10"
            onClick={togglePlay}
            aria-label={playing ? 'Pause' : 'Play'}
          >
            {playing ? <Pause className="size-5" /> : <Play className="size-5" />}
          </button>
          <button
            className="rounded-xl p-2.5 hover:bg-white/10"
            onClick={restart}
            aria-label="Restart"
          >
            <RotateCcw className="size-5" />
          </button>
          <span className="mx-1 h-6 w-px bg-white/15" />
          <button
            className="rounded-xl p-2.5 hover:bg-white/10"
            onClick={() =>
              onSettingsChange({
                ...settings,
                speed: clamp(settings.speed - 1, 1, 20),
              })
            }
            aria-label="Slower"
          >
            <ChevronsDown className="size-5" />
          </button>
          <span className="min-w-16 text-center text-xs text-white/70">
            ≈{speedToWpm(settings.speed)} wpm
          </span>
          <button
            className="rounded-xl p-2.5 hover:bg-white/10"
            onClick={() =>
              onSettingsChange({
                ...settings,
                speed: clamp(settings.speed + 1, 1, 20),
              })
            }
            aria-label="Faster"
          >
            <ChevronsUp className="size-5" />
          </button>
          <span className="mx-1 h-6 w-px bg-white/15" />
          <button
            className="rounded-xl p-2.5 hover:bg-white/10"
            onClick={() =>
              onSettingsChange({
                ...settings,
                fontSize: clamp(settings.fontSize - 4, 20, 120),
              })
            }
            aria-label="Smaller text"
          >
            <Minus className="size-5" />
          </button>
          <ALargeSmall className="size-5 text-white/70" aria-hidden />
          <button
            className="rounded-xl p-2.5 hover:bg-white/10"
            onClick={() =>
              onSettingsChange({
                ...settings,
                fontSize: clamp(settings.fontSize + 4, 20, 120),
              })
            }
            aria-label="Larger text"
          >
            <Plus className="size-5" />
          </button>
          <span className="mx-1 h-6 w-px bg-white/15" />
          {voiceSupported() && (
            <button
              className={`rounded-xl p-2.5 hover:bg-white/10 ${settings.voice && !voiceError ? 'text-primary' : ''}`}
              onClick={() => {
                setVoiceError(false)
                onSettingsChange({ ...settings, voice: !settings.voice })
              }}
              aria-label={
                settings.voice ? 'Disable voice follow' : 'Enable voice follow'
              }
              title="Voice follow — the scroll tracks your reading"
            >
              {settings.voice && !voiceError ? (
                <Mic className="size-5" />
              ) : (
                <MicOff className="size-5" />
              )}
            </button>
          )}
          <button
            className={`rounded-xl p-2.5 hover:bg-white/10 ${settings.mirrorX ? 'text-primary' : ''}`}
            onClick={() => {
              if (!settings.mirrorX) track('mirror_on')
              onSettingsChange({ ...settings, mirrorX: !settings.mirrorX })
            }}
            aria-label="Mirror H (horizontal)"
          >
            <FlipHorizontal2 className="size-5" />
          </button>
          <button
            className={`rounded-xl p-2.5 hover:bg-white/10 ${settings.mirrorY ? 'text-primary' : ''}`}
            onClick={() => {
              if (!settings.mirrorY) track('mirror_on')
              onSettingsChange({ ...settings, mirrorY: !settings.mirrorY })
            }}
            aria-label="Mirror V (vertical)"
          >
            <FlipVertical2 className="size-5" />
          </button>
          <span className="mx-1 h-6 w-px bg-white/15" />
          <button
            className="rounded-xl p-2.5 hover:bg-white/10"
            onClick={onClose}
            aria-label="Exit teleprompter"
          >
            <X className="size-5" />
          </button>
        </div>
        <p className="pb-2 text-center text-[11px] text-white/40 max-sm:hidden">
          Space play/pause · ↑↓ speed · ←→ text size · M/V mirror · R restart · Esc exit
        </p>
      </div>

      {/* status pills (rendered outside the mirrored transform so they stay readable) */}
      <div className="pointer-events-none absolute top-3 left-1/2 z-30 flex -translate-x-1/2 flex-col items-center gap-1.5">
        {(settings.mirrorX || settings.mirrorY) && (
          <span className="rounded-full bg-black/70 px-3 py-1 text-xs text-white/80">
            Mirror {settings.mirrorX && settings.mirrorY ? 'H+V' : settings.mirrorX ? 'H' : 'V'} on
            {touch ? ' \u2014 tap \u21c4 to turn off' : ' \u2014 press M/V to toggle'}
          </span>
        )}
        {voiceActive && playing && (
          <span className="flex items-center gap-1.5 rounded-full bg-black/70 px-3 py-1 text-xs text-white/80">
            <Mic className="text-primary size-3.5 animate-pulse" /> Voice follow —
            listening (audio stays in your browser)
          </span>
        )}
        {settings.voice && voiceError && (
          <span className="rounded-full bg-black/70 px-3 py-1 text-xs text-amber-300">
            Microphone unavailable — using timed scroll
          </span>
        )}
      </div>
    </div>
  )
}
