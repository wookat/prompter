/**
 * Static marketing content for the home page (sample script, FAQ,
 * feature grid, how-it-works steps, comparison table). Pure data —
 * no component logic — mirroring lib/useCases.ts for the pSEO pages.
 */

import {
  Clock,
  Eye,
  Lock,
  Mic,
  MonitorSmartphone,
  Save,
  ScrollText,
  Upload,
  Video,
  Zap,
  type LucideIcon,
} from 'lucide-react'

export const SAMPLE = `Welcome to PromptCue, your free online teleprompter.

Paste your script here — a speech, a video script, lecture notes, lyrics — anything you need to read out loud.

Press Start and the text scrolls at a steady pace, like this. Press the space bar (or tap the screen) to pause and resume. Use the up and down arrows to change speed, and the left and right arrows to change the text size.

Everything runs in your browser. Your script never leaves your device, there is no watermark, no word limit, and no account. Break a leg!`

export const FAQ: { q: string; a: string }[] = [
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
    q: 'Can I record myself while reading?',
    a: 'Yes. Inside the prompter, tap the camera button to record video and audio while you read. The recording is saved directly to your device when you stop — it is never uploaded and has no watermark.',
  },
  {
    q: 'What keyboard shortcuts are there?',
    a: 'Space plays and pauses. Up/Down arrows change speed. Left/Right arrows change text size. M toggles Mirror H (horizontal), V toggles Mirror V (vertical). R restarts. Esc exits.',
  },
  {
    q: 'How do I estimate how long my script takes to read?',
    a: 'PromptCue shows a word count and an estimated speaking time (at roughly 140 words per minute) under the editor as you type.',
  },
]

export const FEATURES: { icon: LucideIcon; title: string; text: string }[] = [
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
    icon: Video,
    title: 'Record yourself',
    text: 'Capture camera and mic while you read — the take saves straight to your device. Nothing is uploaded, no watermark.',
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

export const STEPS: { title: string; text: string }[] = [
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

export const COMPARISON: { label: string; us: string | boolean; them: string | boolean }[] = [
  { label: 'Price', us: '100% free, no paid tier', them: 'Free trial, then subscription' },
  { label: 'Account required', us: false, them: true },
  { label: 'Watermark on output', us: false, them: 'Often on free plan' },
  { label: 'Script privacy', us: 'Never leaves your device', them: 'Uploaded to cloud' },
  { label: 'Word / script limit', us: 'Unlimited', them: 'Limited on free plan' },
  { label: 'Mirror modes (H & V)', us: true, them: true },
  { label: 'Voice-follow scrolling', us: true, them: 'Paid feature' },
  { label: 'Camera recording (local, private)', us: true, them: 'Cloud upload or paid' },
  { label: 'Countdown + eye-line guide', us: true, them: 'Varies' },
  { label: 'Works without install', us: true, them: 'App download required' },
]
