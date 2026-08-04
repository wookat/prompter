import { useCallback, useEffect, useRef, useState } from 'react'
import {
  ALargeSmall,
  ChevronsDown,
  ChevronsUp,
  FlipHorizontal2,
  Minus,
  Pause,
  Play,
  Plus,
  RotateCcw,
  X,
} from 'lucide-react'
import { track } from '@/lib/track'
import { type PrompterSettings, speedToPxPerSecond } from '@/lib/store'

interface PrompterProps {
  text: string
  settings: PrompterSettings
  onSettingsChange: (next: PrompterSettings) => void
  onClose: () => void
}

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))

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

  const rootRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const offsetRef = useRef(0)
  const playingRef = useRef(false)
  const settingsRef = useRef(settings)
  const finishedRef = useRef(false)
  const hideTimerRef = useRef<number | null>(null)
  const dragRef = useRef<{ y: number; offset: number; moved: boolean } | null>(null)

  useEffect(() => {
    settingsRef.current = settings
  }, [settings])

  const maxOffset = useCallback(() => {
    const content = contentRef.current
    if (!content) return 0
    return Math.max(0, content.scrollHeight - window.innerHeight * 0.25)
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
          setCountdown(null)
          playingRef.current = true
          setPlaying(true)
        } else {
          setCountdown(left)
          window.setTimeout(tick, 1000)
        }
      }
      window.setTimeout(tick, 1000)
    } else {
      playingRef.current = true
      setPlaying(true)
    }
  }, [])

  const togglePlay = useCallback(() => {
    if (countdown !== null) return
    if (playingRef.current) {
      playingRef.current = false
      setPlaying(false)
    } else {
      startPlaying()
    }
    showControls()
  }, [countdown, startPlaying, showControls])

  const restart = useCallback(() => {
    playingRef.current = false
    setPlaying(false)
    finishedRef.current = false
    offsetRef.current = 0
    applyOffset()
    showControls()
  }, [applyOffset, showControls])

  // Scroll loop
  useEffect(() => {
    let raf = 0
    let last = performance.now()
    const loop = (now: number) => {
      const dt = (now - last) / 1000
      last = now
      if (playingRef.current) {
        const max = maxOffset()
        offsetRef.current += speedToPxPerSecond(settingsRef.current.speed) * dt
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
        case 'Escape':
          onClose()
          break
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [togglePlay, restart, onClose, onSettingsChange, showControls])

  // Fullscreen on open, restore on close
  useEffect(() => {
    const el = rootRef.current
    if (el?.requestFullscreen) {
      el.requestFullscreen().catch(() => undefined)
    }
    hideTimerRef.current = window.setTimeout(() => setControlsVisible(false), 3500)
    track('prompter_start')
    return () => {
      if (document.fullscreenElement) {
        void document.exitFullscreen().catch(() => undefined)
      }
    }
  }, [])

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

  const paragraphs = text.split(/\n+/).filter((p) => p.trim().length > 0)

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
          }}
        >
          {paragraphs.map((p, i) => (
            <p key={i} className="mb-[1em] font-semibold tracking-wide">
              {p}
            </p>
          ))}
        </div>
      </div>

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
          controlsVisible ? 'opacity-100' : 'pointer-events-none opacity-0'
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
              onSettingsChange({ ...settings, speed: clamp(settings.speed - 1, 1, 20) })
            }
            aria-label="Slower"
          >
            <ChevronsDown className="size-5" />
          </button>
          <span className="min-w-14 text-center text-xs text-white/70">
            speed {settings.speed}
          </span>
          <button
            className="rounded-xl p-2.5 hover:bg-white/10"
            onClick={() =>
              onSettingsChange({ ...settings, speed: clamp(settings.speed + 1, 1, 20) })
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
          <button
            className={`rounded-xl p-2.5 hover:bg-white/10 ${settings.mirrorX ? 'text-primary' : ''}`}
            onClick={() => {
              if (!settings.mirrorX) track('mirror_on')
              onSettingsChange({ ...settings, mirrorX: !settings.mirrorX })
            }}
            aria-label="Mirror horizontally"
          >
            <FlipHorizontal2 className="size-5" />
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
          Space play/pause · ↑↓ speed · ←→ text size · M mirror · R restart · Esc exit
        </p>
      </div>
    </div>
  )
}
