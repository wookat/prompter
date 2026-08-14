/**
 * Lightweight use-case link data for navigation (routes, header/footer,
 * homepage links). The long-form page copy lives in useCases.ts, which is
 * only loaded with the lazy UseCase route chunk.
 */
export interface UseCaseLink {
  slug: string
  path: string
  name: string
  /** One-line teaser shown on the homepage use-case cards */
  blurb: string
}

export const SITE = 'https://prompter.zalize.com'

export const USE_CASE_LINKS: UseCaseLink[] = [
  {
    slug: 'wedding-speech',
    path: '/teleprompter-for-wedding-speech',
    name: 'Wedding Speeches & Toasts',
    blurb: 'Rehearse the pacing at home, then use your phone as a discreet prompt on the day — one tap to pause when the room laughs.',
  },
  {
    slug: 'presentation',
    path: '/teleprompter-for-presentations',
    name: 'Presentations & Talks',
    blurb: 'Your speaker notes scroll on a second screen or phone below your eye line while you keep eye contact with the audience.',
  },
  {
    slug: 'video-recording',
    path: '/teleprompter-for-video-recording',
    name: 'YouTube & Video Recording',
    blurb: "Read a script without looking like you're reading — mirror mode included for beam-splitter camera rigs, no watermark.",
  },
  {
    slug: 'podcast',
    path: '/teleprompter-for-podcast',
    name: 'Podcasts & Voice-over',
    blurb: 'Consistent pacing for ad reads and intros: speaking-time estimate before you record, every take the same length.',
  },
  {
    slug: 'sermon',
    path: '/teleprompter-for-sermon',
    name: 'Sermons & Worship',
    blurb: 'A tablet on the pulpit running a slow scroll beats shuffling paper — large text, one tap to pause, free for churches.',
  },
  {
    slug: 'lyrics',
    path: '/teleprompter-for-lyrics',
    name: 'Song Lyrics & Music',
    blurb: "Paste your set's lyrics, match the scroll to the tempo, and keep both hands on the instrument.",
  },
  {
    slug: 'online-classes',
    path: '/teleprompter-for-online-classes',
    name: 'Online Classes & Lectures',
    blurb: 'Put your lesson script right under your webcam so your delivery stays fluent and your eyes stay near the lens.',
  },
  {
    slug: 'interview',
    path: '/teleprompter-for-interviews',
    name: 'Interviews & Live Streams',
    blurb: 'A scrolling list of talking points beside your video call keeps you from blanking in live conversations.',
  },
]
