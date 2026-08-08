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
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    if (!raw) return DEFAULT_SETTINGS
    return { ...DEFAULT_SETTINGS, ...(JSON.parse(raw) as Partial<PrompterSettings>) }
  } catch {
    return DEFAULT_SETTINGS
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

export function saveScripts(list: SavedScript[]): void {
  try {
    localStorage.setItem(SCRIPTS_KEY, JSON.stringify(list))
  } catch {
    /* ignore */
  }
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

export function countWords(text: string): number {
  const cjk = (text.match(/[\u4e00-\u9fff]/g) ?? []).length
  const latin = (text.replace(/[\u4e00-\u9fff]/g, ' ').match(/[A-Za-z0-9''-]+/g) ?? [])
    .length
  return cjk + latin
}

/** Rough speaking time at the baseline pace */
export function estimateSeconds(text: string): number {
  return Math.round((countWords(text) / BASE_WPM) * 60)
}

export function formatDuration(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  if (m === 0) return `${s}s`
  return s === 0 ? `${m} min` : `${m} min ${s}s`
}
