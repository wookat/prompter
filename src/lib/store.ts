export type TextColor = 'white' | 'yellow' | 'mint'

export interface PrompterSettings {
  /** Scroll speed step 1–20 (maps to px/s) */
  speed: number
  /** Font size in px */
  fontSize: number
  lineHeight: number
  mirrorX: boolean
  mirrorY: boolean
  align: 'left' | 'center'
  /** Countdown seconds before scrolling starts */
  countdown: number
  /** Eye-line guide indicator */
  guide: boolean
  /** Voice-follow mode: scroll follows speech recognition */
  voice: boolean
  textColor: TextColor
}

export const TEXT_COLORS: Record<TextColor, string> = {
  white: '#ffffff',
  yellow: '#ffd60a',
  mint: '#7ef0c8',
}

export interface SavedScript {
  id: string
  title: string
  text: string
  updatedAt: number
}

/** Default text size: smaller on narrow (phone) viewports so more lines fit. */
function defaultFontSize(): number {
  try {
    return window.innerWidth < 480 ? 32 : 48
  } catch {
    return 48
  }
}

export const DEFAULT_SETTINGS: PrompterSettings = {
  speed: 6,
  fontSize: 48,
  lineHeight: 1.6,
  mirrorX: false,
  mirrorY: false,
  align: 'left',
  countdown: 3,
  guide: true,
  voice: false,
  textColor: 'white',
}

const SETTINGS_KEY = 'promptcue:settings'
const SCRIPTS_KEY = 'promptcue:scripts'
const CURRENT_KEY = 'promptcue:current'

export function speedToPxPerSecond(speed: number): number {
  return 14 + speed * 11
}

/** Baseline speaking pace; speed 6 on the 1–20 scale maps to this. */
export const BASE_WPM = 140

export function speedToWpm(speed: number): number {
  return Math.round((BASE_WPM * speed) / 6)
}

export function loadSettings(): PrompterSettings {
  const defaults = { ...DEFAULT_SETTINGS, fontSize: defaultFontSize() }
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    if (!raw) return defaults
    return { ...defaults, ...(JSON.parse(raw) as Partial<PrompterSettings>) }
  } catch {
    return defaults
  }
}

export function saveSettings(s: PrompterSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(s))
  } catch {
    /* storage unavailable (private mode) — settings just won't persist */
  }
}

export function loadScripts(): SavedScript[] {
  try {
    const raw = localStorage.getItem(SCRIPTS_KEY)
    if (!raw) return []
    const list = JSON.parse(raw) as SavedScript[]
    return Array.isArray(list) ? list : []
  } catch {
    return []
  }
}

/** Returns false when storage is full or unavailable (private mode). */
export function saveScripts(list: SavedScript[]): boolean {
  try {
    localStorage.setItem(SCRIPTS_KEY, JSON.stringify(list))
    return true
  } catch {
    return false
  }
}

/**
 * Build the saved-scripts list after saving `text`: titles from the first
 * line (word-boundary truncated), dedupes by content, newest first, max 50.
 */
export function upsertScript(scripts: SavedScript[], text: string): SavedScript[] {
  const firstLine = text.trim().split('\n')[0].trim()
  const title =
    firstLine.length <= 60
      ? firstLine || 'Untitled script'
      : `${(firstLine.slice(0, 60).replace(/\s+\S*$/, '') || firstLine.slice(0, 59)).trimEnd()}…`
  const existing = scripts.find((s) => s.text === text)
  return existing
    ? [
        { ...existing, title, updatedAt: Date.now() },
        ...scripts.filter((s) => s.id !== existing.id),
      ]
    : [{ id: crypto.randomUUID(), title, text, updatedAt: Date.now() }, ...scripts].slice(
        0,
        50,
      )
}

export function loadCurrentText(): string {
  try {
    return localStorage.getItem(CURRENT_KEY) ?? ''
  } catch {
    return ''
  }
}

export function saveCurrentText(text: string): void {
  try {
    localStorage.setItem(CURRENT_KEY, text)
  } catch {
    /* ignore */
  }
}

/** Baseline speaking pace for CJK text, in characters per minute. */
export const CJK_CPM = 260

/** Single definition of "what counts as a CJK character" for pacing,
 * counting and voice tokenization (kana, CJK ideographs incl. ext. A,
 * compatibility ideographs, half-width katakana). */
export const CJK_CHAR =
  /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uff66-\uff9f]/

const CJK_CHAR_G = new RegExp(CJK_CHAR.source, 'g')

let segmenter: Intl.Segmenter | null | undefined

function getSegmenter(): Intl.Segmenter | null {
  if (segmenter === undefined) {
    try {
      segmenter = new Intl.Segmenter(undefined, { granularity: 'word' })
    } catch {
      segmenter = null
    }
  }
  return segmenter
}

/**
 * Counts spoken units in any script via Intl.Segmenter: CJK counts
 * per character (paced by CJK_CPM), everything else per word-like
 * segment (paced by BASE_WPM). Falls back to a Latin/CJK regex on
 * browsers without Intl.Segmenter.
 */
function countUnits(text: string): { words: number; cjkChars: number } {
  const seg = getSegmenter()
  if (seg) {
    let words = 0
    let cjkChars = 0
    for (const part of seg.segment(text)) {
      if (!part.isWordLike) continue
      if (CJK_CHAR.test(part.segment)) cjkChars += part.segment.length
      else words++
    }
    return { words, cjkChars }
  }
  const cjkChars = (text.match(CJK_CHAR_G) ?? []).length
  const words = (
    text.replace(CJK_CHAR_G, ' ').match(/[A-Za-z0-9''-]+/g) ?? []
  ).length
  return { words, cjkChars }
}

export function countWords(text: string): number {
  const { words, cjkChars } = countUnits(text)
  return words + cjkChars
}

/** Rough speaking time at the baseline pace */
export function estimateSeconds(text: string): number {
  const { words, cjkChars } = countUnits(text)
  return Math.round((words / BASE_WPM + cjkChars / CJK_CPM) * 60)
}

export function formatDuration(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60
  if (h > 0) return m === 0 ? `${h}h` : `${h}h ${m}m`
  if (m === 0) return `${s}s`
  return s === 0 ? `${m} min` : `${m} min ${s}s`
}
