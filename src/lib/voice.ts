/**
 * Voice-follow support: browser speech recognition (Web Speech API).
 * Audio is processed by the browser's built-in recognizer — nothing is
 * sent to our servers.
 */

import { CJK_CHAR } from '@/lib/store'

const CJK_CHAR_G = new RegExp(CJK_CHAR.source, 'g')

interface SpeechRecognitionAlternativeLike {
  transcript: string
}
interface SpeechRecognitionResultLike {
  0: SpeechRecognitionAlternativeLike
  isFinal: boolean
}
interface SpeechRecognitionEventLike {
  resultIndex: number
  results: {
    length: number
    [index: number]: SpeechRecognitionResultLike
  }
}
export interface SpeechRecognitionLike {
  lang: string
  continuous: boolean
  interimResults: boolean
  onresult: ((e: SpeechRecognitionEventLike) => void) | null
  onend: (() => void) | null
  onerror: ((e: { error: string }) => void) | null
  start: () => void
  stop: () => void
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognitionLike
}

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor
    webkitSpeechRecognition?: SpeechRecognitionConstructor
  }
}

export function getSpeechRecognition(): SpeechRecognitionConstructor | null {
  if (typeof window === 'undefined') return null
  return window.SpeechRecognition ?? window.webkitSpeechRecognition ?? null
}

export function voiceSupported(): boolean {
  return getSpeechRecognition() !== null
}

/** Lowercase and strip punctuation so spoken words match script words. */
export function normalizeWord(w: string): string {
  return w.toLowerCase().replace(/[^\p{L}\p{N}]/gu, '')
}

export function tokenizeSpeech(transcript: string): string[] {
  const out: string[] = []
  for (const chunk of transcript.split(/\s+/)) {
    const cjk = chunk.match(CJK_CHAR_G)
    if (cjk) out.push(...cjk)
    const latin = normalizeWord(chunk.replace(CJK_CHAR_G, ''))
    if (latin) out.push(latin)
  }
  return out
}

export interface ScriptChunk {
  text: string
  /** Word index for matching, or null for whitespace */
  wi: number | null
}

/**
 * Split a script into paragraphs of chunks (words + whitespace, whitespace
 * preserved for rendering) plus the flat normalized word list used for
 * matching. Word indices are shared between rendering (`data-wi`) and
 * matching.
 */
export function tokenizeScript(text: string): {
  paragraphs: ScriptChunk[][]
  words: string[]
} {
  const words: string[] = []
  const paragraphs = text
    .split(/\n+/)
    .filter((p) => p.trim().length > 0)
    .map((p) =>
      p.split(/(\s+)/).map((chunk): ScriptChunk => {
        if (!chunk.trim()) return { text: chunk, wi: null }
        const wi = words.length
        words.push(normalizeWord(chunk))
        return { text: chunk, wi }
      }),
    )
  return { paragraphs, words }
}

/**
 * Advance the match pointer through the script words given newly recognized
 * speech tokens. Looks ahead a small window so skipped or misheard words
 * don't stall the scroll. Returns the new pointer (index of last matched word).
 */
export function advanceMatch(
  scriptWords: string[],
  pointer: number,
  spoken: string[],
  lookahead = 14,
): number {
  let p = pointer
  for (const token of spoken) {
    if (!token) continue
    const end = Math.min(scriptWords.length, p + 1 + lookahead)
    for (let i = p + 1; i < end; i++) {
      const w = scriptWords[i]
      if (!w) continue
      if (w === token || (w.length > 3 && (w.includes(token) || token.includes(w)))) {
        p = i
        break
      }
    }
  }
  return p
}
