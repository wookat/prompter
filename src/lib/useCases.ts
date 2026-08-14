/**
 * Long-form use-case page copy. Loaded only by the lazy UseCase route
 * chunk and the build-time SEO script — keep it out of the main bundle.
 * Navigation link data (slug/path/name) lives in useCaseLinks.ts.
 */
import { CTA_START_FREE, SITE, USE_CASE_LINKS, type UseCaseLink } from './useCaseLinks.ts'

export { CTA_START_FREE, SITE }

export interface UseCase extends UseCaseLink {
  title: string
  description: string
  h1: string
  intro: string
  bullets: string[]
  tip: string
  /** Optional in-depth guide sections — unique, non-template page content */
  sections?: { h2: string; paragraphs: string[] }[]
  /** Optional page-specific FAQ (also emitted as FAQPage JSON-LD at build) */
  faq?: { q: string; a: string }[]
}

type UseCaseContent = Omit<UseCase, 'path' | 'name' | 'blurb'>

const CONTENT: UseCaseContent[] = [
  {
    slug: 'wedding-speech',
    title: 'Free Teleprompter for Wedding Speeches & Toasts | PromptCue',
    description:
      'Deliver your wedding speech or toast with confidence. Free online teleprompter — paste your speech, set a comfortable pace, and practice until it flows. No signup.',
    h1: 'Read your wedding speech with confidence',
    intro:
      'A wedding speech is one of the few talks most people ever give in front of a crowd — and nerves make it easy to lose your place. Put your speech on a slow, steady scroll: rehearse the pacing at home, then use your phone as a discreet prompt on the day. Large readable text, one tap to pause when the room laughs.',
    bullets: [
      'Practice with a countdown and a steady pace so the speech lands at the right length',
      'Tap anywhere to pause while the room reacts, tap again to continue',
      'Big adjustable font readable from a phone held at podium distance',
      'Your speech stays on your device — nothing is uploaded',
    ],
    tip: 'Still writing the speech? Our sister tool SpeakEasy drafts a personal wedding speech from your real stories: https://speech.zalize.com',
    sections: [
      {
        h2: 'How to set up the teleprompter for a wedding speech',
        paragraphs: [
          'Paste your speech and check the estimated speaking time in the editor header. The sweet spot for a best-man or maid-of-honour speech is three to five minutes — roughly 400 to 700 words. If the estimate reads longer than five minutes, cut before you rehearse: a shorter speech read calmly always lands better than a long one read fast.',
          'Set the speed lower than feels natural — around 110–130 words per minute instead of normal conversational pace. Wedding rooms are loud, guests react, and you will want to look up between lines. A slower scroll gives you that slack without losing your place. Bump the text size until you can read it comfortably with the phone held at waist height, so you are not visibly staring at a screen.',
          'Turn the countdown up to five or more seconds. That pause before the text moves is your moment to take a breath, look at the couple, and start on your own terms rather than chasing the scroll.',
        ],
      },
      {
        h2: 'On the day: phone in hand, eyes on the room',
        paragraphs: [
          'Rehearse at least three full runs at final speed — the first run tells you the pace is wrong, the second fixes it, the third makes it automatic. Practice tapping to pause where you expect laughter or an “aww”; resuming from a pause is one tap, so pausing generously costs nothing.',
          'On the day, load the speech before the reception (the page works offline once open), set the screen brightness high, and enable the phone’s do-not-disturb. Hold the phone like notes — nobody expects a speaker to be empty-handed — and glance down at the eye-line marker, not at the whole screen. The marker always holds your current line, so a glance is enough.',
        ],
      },
    ],
    faq: [
      {
        q: 'How long should a wedding speech be?',
        a: 'Three to five minutes — about 400–700 words at a calm pace. PromptCue shows the estimated speaking time as you paste, so you can trim before you rehearse.',
      },
      {
        q: 'Is it okay to read a wedding speech from a phone?',
        a: 'Yes — guests expect notes. A slow teleprompter scroll on a phone actually reads as more natural than paper, because you glance instead of shuffling pages, and one tap pauses while the room reacts.',
      },
      {
        q: 'What if I get interrupted by laughter or applause?',
        a: 'Tap anywhere to pause the scroll, and tap again to resume exactly where you left off. Rehearse the pause points so it feels automatic on the day.',
      },
    ],
  },
  {
    slug: 'presentation',
    title: 'Free Teleprompter for Presentations & Keynotes | PromptCue',
    description:
      'Keep your presentation on track with a free browser teleprompter. Scroll your talk track next to your slides — adjustable speed, keyboard control, no signup.',
    h1: 'Stay on script during presentations and keynotes',
    intro:
      'Great presenters rehearse a talk track, then panic-forget it in the room. Run PromptCue on a second screen, tablet or phone below your eye line: your speaker notes scroll at your pace while you keep eye contact with the audience. Space pauses, arrows fine-tune speed without breaking stride.',
    bullets: [
      'Runs alongside your slides on a second monitor, tablet or phone',
      'Keyboard shortcuts let you speed up or slow down mid-talk',
      'Eye-line marker keeps the current line where your eyes naturally rest',
      'Works offline once loaded — no conference wifi required',
    ],
    tip: 'Rehearse at the speed you actually speak: read one paragraph aloud, adjust the speed until the marker tracks you, then leave it alone.',
  },
  {
    slug: 'video-recording',
    title: 'Free Teleprompter for YouTube & Video Recording | PromptCue',
    description:
      'Record videos that sound natural without memorizing scripts. Free online teleprompter with mirror mode for camera rigs — no watermark, no signup, no word limit.',
    h1: 'Record to camera without memorizing a word',
    intro:
      'The trick to natural talking-head video is reading a script without looking like you are reading. Put your browser window as close to the lens as possible, size the text so you can read it at a glance, and scroll slightly slower than you speak. Mirror mode is built in for beam-splitter teleprompter rigs.',
    bullets: [
      'No watermark on the scrolling view — nothing branded ends up in your recording',
      'Horizontal and vertical mirror modes for beam-splitter glass rigs',
      'No word limit — a 20-minute video script scrolls just as smoothly',
      'Restart a take instantly with one key (R)',
    ],
    tip: 'Position the text as close to the camera lens as possible and keep the font just large enough to read — smaller text keeps your eye movement invisible.',
    sections: [
      {
        h2: 'Camera setup: keep your eyes near the lens',
        paragraphs: [
          'The single biggest factor in a natural on-camera read is the distance between the text and the lens. Shrink your browser window to a narrow column and dock it directly under (or beside) the camera — within about 10° of the lens axis, eye movement is invisible at typical vlogging distance. On a laptop, that means the top-centre of the screen, right below the built-in webcam.',
          'Then shrink the font. Big text feels easier to read, but it forces your eyes to travel further per line, which shows up on camera as a visible left-right sweep. Use the smallest size you can read at a glance and keep the window narrow — short lines keep your gaze effectively still.',
          'If you record with a beam-splitter rig, enable Mirror H and the text reads correctly through the glass. Both horizontal and vertical mirroring are built in, and a status pill reminds you when a mirror mode is active.',
        ],
      },
      {
        h2: 'A workflow for clean takes',
        paragraphs: [
          'Calibrate speed before the first take: read one paragraph aloud and adjust until the eye-line marker tracks your voice, then leave it alone — consistent pace across takes makes editing dramatically easier, because every take of a section runs the same length.',
          'Flubbed a line? Press R and the script restarts instantly from the top for a fresh take, or drag the text back a paragraph and re-enter from just before the mistake. Space pauses between sections so you can check framing or notes without losing your place. There is no watermark on the scrolling view, so nothing branded ever appears in a screen recording.',
          'Write for the ear, not the page: short sentences, contractions, and a blank line between beats. The prompter preserves your paragraph spacing, and those visual breaks double as natural places to breathe and reset your energy.',
        ],
      },
    ],
    faq: [
      {
        q: 'How do I stop my eyes from visibly reading on camera?',
        a: 'Move the text as close to the lens as possible, make the window narrow, and use a smaller font. Short lines near the lens keep eye travel below what viewers can perceive.',
      },
      {
        q: 'Does PromptCue work with a beam-splitter teleprompter rig?',
        a: 'Yes — Mirror H flips the text horizontally for the glass, and Mirror V handles rigs that also invert vertically. Press M or V to toggle while prompting.',
      },
      {
        q: 'Will a watermark appear in my recording?',
        a: 'No. The scrolling view is completely unbranded — no watermark, no logo overlay — so you can screen-record or point a camera at it freely.',
      },
    ],
  },
  {
    slug: 'podcast',
    title: 'Free Teleprompter for Podcasts & Voice-over | PromptCue',
    description:
      'Read podcast intros, ads and voice-over scripts at a steady pace. Free browser teleprompter with speaking-time estimate — no signup, scripts stay local.',
    h1: 'A steady read for podcasts and voice-over',
    intro:
      'Ad reads, sponsor messages, and scripted intros need consistent pacing — rushing is the most common tell of an amateur read. PromptCue estimates the speaking time of your script and scrolls it at a fixed pace, so every take comes out at the same length. Pause with the space bar between sentences to breathe.',
    bullets: [
      'Speaking-time estimate before you hit record',
      'Consistent scroll speed keeps every take the same length',
      'Silent operation — no clicks or sounds to bleed into your mic',
      'Drafts autosave locally so scripts survive a browser restart',
    ],
    tip: 'For a 30-second ad read, aim for roughly 70–80 words and set the speed so the scroll finishes just after you do.',
  },
  {
    slug: 'sermon',
    title: 'Free Teleprompter for Sermons & Worship | PromptCue',
    description:
      'Deliver sermons while keeping eye contact with the congregation. Free online teleprompter for churches — large text, tablet friendly, completely free.',
    h1: 'Preach with your eyes on the congregation',
    intro:
      'Many preachers move between full manuscripts and outlines. Either way, a tablet on the pulpit running a slow scroll beats shuffling paper: the text is always where you left it, the font is readable at arm\u2019s length, and one tap pauses when you depart from the script. Completely free — built for exactly this kind of use.',
    bullets: [
      'Large, high-contrast text readable at pulpit distance',
      'Tap to pause when you leave the manuscript, tap to resume',
      'Works on any tablet or laptop browser — nothing to install',
      'Free for churches and ministries, forever, no account needed',
    ],
    tip: 'Paste your manuscript with a blank line between paragraphs — PromptCue keeps the spacing, which makes it much easier to find your place again.',
  },
  {
    slug: 'lyrics',
    title: 'Free Lyrics Teleprompter for Singers & Musicians | PromptCue',
    description:
      'Scroll song lyrics on stage or in the studio. Free browser teleprompter for singers and musicians — adjustable speed, large text, works on any device.',
    h1: 'Lyrics that scroll while your hands play',
    intro:
      'Singers and musicians can\u2019t page through a binder mid-song. Paste your set\u2019s lyrics, set the scroll to match the tempo, and keep both hands on the instrument. Center alignment and generous line height make lyrics easy to track from a mic stand or keyboard.',
    bullets: [
      'Center-aligned mode built for lyric sheets',
      'Speed adjusts in fine steps to match slow ballads or fast numbers',
      'Wheel or drag to jump between songs in a set list',
      'Keep the whole set in one script — no page turns',
    ],
    tip: 'Separate songs with a few blank lines and a TITLE IN CAPS — easy to spot when you seek between songs mid-set.',
  },
  {
    slug: 'online-classes',
    title: 'Free Teleprompter for Online Classes & Lectures | PromptCue',
    description:
      'Teach smoother online lessons and recorded lectures. Free browser teleprompter for teachers — script scrolls near your webcam, no signup or install.',
    h1: 'Teach to the camera, not to your notes',
    intro:
      'Recorded lectures and live online classes fall flat when the teacher keeps glancing down at notes. Put your lesson script in a browser window right under your webcam: your delivery stays fluent and your eyes stay near the lens. Pause instantly when students ask questions, resume where you left off.',
    bullets: [
      'Position the window near your webcam for natural eye contact',
      'Space bar pauses instantly for questions, resumes in place',
      'No install — works on school laptops with just a browser',
      'Scripts autosave locally between lessons',
    ],
    tip: 'Shrink the browser window and dock it at the top of the screen directly below your camera — the closer the text is to the lens, the more natural you look.',
  },
  {
    slug: 'interview',
    title: 'Free Teleprompter for Interviews & Live Streams | PromptCue',
    description:
      'Keep talking points visible during interviews, webinars and live streams. Free discreet browser teleprompter — instant pause, no signup, fully private.',
    h1: 'Talking points on screen, confidence on camera',
    intro:
      'In live settings — job interviews, webinars, streams — you don\u2019t read a script verbatim, but a scrolling list of talking points keeps you from blanking. Run PromptCue in a narrow window beside your video call at a very slow speed, or paused, and nudge it along with the wheel as the conversation moves.',
    bullets: [
      'Runs in a small window beside any video call app',
      'Wheel and drag seeking for non-linear conversations',
      'Very slow speed settings for gradual talking-point scrolls',
      'Nothing is uploaded — your notes stay completely private',
    ],
    tip: 'For live conversation, keep the prompter paused and scroll manually with the wheel — you control the pace, not the clock.',
  },
]

export const USE_CASES: UseCase[] = USE_CASE_LINKS.map((link) => {
  const content = CONTENT.find((c) => c.slug === link.slug)
  if (!content) throw new Error(`Missing use-case content for ${link.slug}`)
  return { ...link, ...content }
})

export function useCaseBySlug(slug: string | undefined): UseCase | undefined {
  return USE_CASES.find((u) => u.slug === slug)
}
