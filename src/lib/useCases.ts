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
    sections: [
      {
        h2: 'Speaker notes on a second screen, slides on the first',
        paragraphs: [
          'The setup that works in real conference rooms: slides on the projector or shared screen, PromptCue in a browser window on your laptop or a tablet lying flat below your eye line. Write the talk track as short spoken paragraphs — one per slide or beat — with a blank line between them, so a single glance tells you where you are. The eye-line marker holds your current line at a fixed height, which means you look down for a fraction of a second, not scan a page.',
          'Resist scripting word-for-word unless the talk is timed to the second. For most presentations, a scroll of full first sentences plus bullet fragments reads better: the first sentence launches you into the point in your natural voice, and the fragments keep the supporting facts at hand. Set the speed low — you will speak around slides, questions, and demos, and a slow scroll plus the occasional wheel nudge stays honest to the room.',
          'Rehearse once with the actual clock: the editor shows an estimated speaking time as you write, so if your slot is 20 minutes and the estimate says 28, you know before the room does. Trim the script, not your speaking pace.',
        ],
      },
      {
        h2: 'Mid-talk control without breaking stride',
        paragraphs: [
          'Everything you need mid-talk is on the keyboard: Space pauses for questions or a demo and resumes in place, ↑/↓ nudges the speed if you find yourself ahead of or behind the scroll, and the wheel seeks instantly when a question pulls you three slides ahead. None of it requires looking at anything but the text.',
          'Conference wifi is not part of the plan: once the page is open, PromptCue runs entirely offline — the script, the scroll, and your settings all live in the browser. Load it before you leave the speaker room and it will still be there when the venue network is not.',
        ],
      },
    ],
    faq: [
      {
        q: 'Should I script my presentation word-for-word?',
        a: 'Usually no. Script the openings of each point in full and keep the rest as fragments — you get a confident launch into every beat while still sounding like you, not like a read. Fully script only tightly-timed talks.',
      },
      {
        q: 'How do I handle audience questions mid-presentation?',
        a: 'Press Space to pause the scroll, answer, and press Space again to resume exactly where you stopped. If the question jumps you ahead, seek with the mouse wheel or by dragging the text.',
      },
      {
        q: 'Does it work without internet at the venue?',
        a: 'Yes. Once the page is loaded, the teleprompter runs entirely in your browser — script, settings, and scroll all work offline, and nothing depends on the venue network.',
      },
    ],
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
    sections: [
      {
        h2: 'Dialing in a broadcast-consistent pace',
        paragraphs: [
          'Timed reads live and die by word count. A relaxed broadcast pace is around 140 words per minute, so a 30-second spot is roughly 70–80 words and a 60-second spot 140–150. Paste the copy and check the estimated speaking time in the editor header before you touch the mic — if the estimate overshoots the slot, cut copy rather than speeding up, because a rushed ad read is the most audible tell of an amateur production.',
          'Then calibrate once: read the first paragraph aloud at your natural pace and adjust the speed until the eye-line marker tracks your voice. From that point every take of the same copy runs the same length, which is exactly what editors and ad slots need. The scroll is the metronome; your job is just to stay with it.',
          'PromptCue is silent by design — no clicks, ticks, or UI sounds — so it can sit on the same desk as a condenser mic without bleeding into the recording.',
        ],
      },
      {
        h2: 'Session workflow for intros, ads, and retakes',
        paragraphs: [
          'Keep a whole session in one script: intro, sponsor reads, segment links, outro, separated by blank lines. The scroll preserves your spacing, so each block reads as its own beat and the wheel jumps you between them instantly. Space pauses between blocks while you check levels or re-read the brief.',
          'For retakes, R restarts the scroll from the top at the same calibrated speed — so take five is the same length as take one, and the editor can cut between them freely. Drafts autosave locally, which means the sponsor copy you pasted on Monday is still there for Thursday’s session, even after a browser restart.',
        ],
      },
    ],
    faq: [
      {
        q: 'How many words is a 30-second or 60-second ad read?',
        a: 'At a relaxed 140 wpm broadcast pace: about 70–80 words for 30 seconds and 140–150 for 60 seconds. PromptCue shows the estimated speaking time as you paste, so you can trim to fit before recording.',
      },
      {
        q: 'How do I keep every take the same length?',
        a: 'Calibrate the speed once against your natural read, then restart takes with R. The scroll runs at a fixed pace, so every take of the same copy comes out the same length — which makes editing and slot-fitting trivial.',
      },
      {
        q: 'Will the teleprompter make noise my microphone picks up?',
        a: 'No. The scroll is completely silent — no clicks or sounds — and it runs in the browser on the machine you already have in the booth, so there is no extra fan or device noise.',
      },
    ],
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
    sections: [
      {
        h2: 'From manuscript to pulpit tablet',
        paragraphs: [
          'Whether you preach from a full manuscript or an expanded outline, the setup is the same: paste it with a blank line between paragraphs or points, put a tablet flat on the pulpit, and bump the font until it reads clearly at arm’s length — most preachers land around 36–48px on a 10-inch tablet. The eye-line marker keeps your current line at a fixed spot, so re-finding your place after looking up at the congregation takes a glance, not a search.',
          'Set the scroll slower than your speaking pace. Preaching is not linear reading — you repeat for emphasis, pause, and depart from the page — and a slow scroll with generous taps to pause fits that rhythm far better than a scroll that chases you. Turn the screen brightness up and enable do-not-disturb before the service; a banner notification mid-sermon helps nobody.',
          'A 30-minute sermon is roughly 4,000 words — well within what the prompter handles smoothly, with the estimated speaking time shown as you paste so you can check the length against the service plan.',
        ],
      },
      {
        h2: 'Leaving the script — and finding your way back',
        paragraphs: [
          'The moments that make a sermon are usually off-script. Tap once and the text holds exactly where you left it while you follow the thought; tap again and the manuscript is waiting at the same line. If a detour ran long, drag the text or use the wheel to skip ahead to where you actually are — seeking is instant and silent.',
          'Everything stays on your device: the manuscript autosaves locally in the browser, nothing is uploaded to any server, and the tool is genuinely free — no accounts, trials, or watermarks. It works the same on the church tablet, a personal laptop, or a borrowed machine with nothing to install.',
        ],
      },
    ],
    faq: [
      {
        q: 'What font size works at pulpit distance?',
        a: 'On a 10-inch tablet lying on the pulpit, most preachers read comfortably at 36–48px — use the arrow keys or the size buttons to adjust live, and pick the smallest size you can read at a glance so more context stays on screen.',
      },
      {
        q: 'What happens when I depart from the manuscript?',
        a: 'Tap once to pause — the text holds your exact place while you speak freely. Tap again to resume, or drag/scroll to jump to wherever the detour took you. Pausing generously is the intended way to preach with it.',
      },
      {
        q: 'Is it really free for churches?',
        a: 'Yes — completely free, no account, no trial, no watermark. It runs in the browser on any tablet or laptop, and sermons never leave the device, which also keeps unpublished manuscripts private.',
      },
    ],
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
    sections: [
      {
        h2: 'Building a set list that scrolls',
        paragraphs: [
          'Put the whole set in one script: each song under a TITLE IN CAPS, a few blank lines between songs, verses and choruses separated the way you think of them. Center alignment (in the settings panel) is the natural mode for lyrics — it reads like a lyric sheet, and short centered lines are easy to track from a mic stand a metre away.',
          'Songs are not spoken word: a fixed scroll speed will drift against verses, holds, and instrumental breaks. The reliable approach on stage is a slow base speed plus the pause as your main control — tap (or hit Space) at the end of a section, play the break, tap to roll the next verse in. Between songs, a flick of the wheel or a drag jumps to the next title instantly.',
          'Match the font size to your stage distance: bigger than you think for a stand across the stage, smaller for a music-stand tablet, and the generous line height keeps dense lyric lines from blurring together under stage lighting.',
        ],
      },
      {
        h2: 'On stage and in the studio',
        paragraphs: [
          'Live, the screen stays awake while the scroll runs — no dimming mid-song — and the whole thing works offline once loaded, so a venue with no wifi changes nothing. Load the set at soundcheck, leave the tab open, and it is exactly where you left it at showtime.',
          'In the studio, the same set list doubles as a tracking sheet: pause between takes, drag back to the top of a verse for a punch-in, and keep both hands free for the instrument. Lyrics autosave locally and never upload anywhere — unreleased material stays on your machine.',
        ],
      },
    ],
    faq: [
      {
        q: 'Can the scroll follow the tempo of a song?',
        a: 'Use a slow base speed and treat pause as your main control: tap at section ends, play the break, tap to continue. Fine speed steps help the scroll shadow a verse, but for holds and solos, pausing beats any fixed speed.',
      },
      {
        q: 'How do I jump between songs mid-set?',
        a: 'Keep the whole set in one script with each song under a TITLE IN CAPS and blank lines between songs, then flick the mouse wheel or drag the text — seeking is instant, and the caps titles are easy to spot while scrolling.',
      },
      {
        q: 'Will the screen dim or sleep during a long song?',
        a: 'No — while the prompter is scrolling it keeps the screen awake, and the page works offline once loaded, so it survives venue wifi. Just turn off notifications before the set.',
      },
    ],
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
    sections: [
      {
        h2: 'Recorded lectures: read the script, keep the eye contact',
        paragraphs: [
          'For recorded lessons, the goal is a script that does not look scripted. Dock a narrow PromptCue window at the top-centre of the screen, directly under the webcam, and shrink the font to the smallest size you read comfortably — short lines close to the lens keep your eye movement invisible to students. Write the script the way you actually talk in class: contractions, direct questions to the viewer, one idea per paragraph.',
          'Calibrate the speed against one paragraph read aloud, then record the whole lesson in one pass, pressing Space at section boundaries to reset your energy or check the slide you are narrating. If a take goes wrong, R restarts the script instantly — and because the pace is fixed, re-recorded segments match the original length, which keeps editing painless.',
          'The editor shows estimated speaking time as you write: a target of 6–8 minutes per video segment is easy to hit when you can see the estimate before recording.',
        ],
      },
      {
        h2: 'Live classes: notes that follow the lesson',
        paragraphs: [
          'In a live class you cannot read verbatim — students ask questions, discussions wander. Run the lesson plan as a slow scroll (or keep it paused) in a window beside the video call, and nudge it along with the wheel as the lesson actually progresses. Space pauses instantly when a hand goes up; the plan waits at exactly the same line until you are ready to move on.',
          'It works on anything with a browser — school laptops, locked-down machines, tablets — with nothing to install and no account to create. Lesson scripts autosave locally between classes, and nothing is uploaded, which keeps you clear of both IT restrictions and student-data concerns.',
        ],
      },
    ],
    faq: [
      {
        q: 'How do I look at the camera instead of my notes?',
        a: 'Dock the prompter window directly under your webcam and keep it narrow with small text. When the text sits that close to the lens, glancing at it is indistinguishable from looking at the camera.',
      },
      {
        q: 'Can I use it during a live class, not just recordings?',
        a: 'Yes — keep it paused or on a very slow scroll beside the call window, and advance it with the mouse wheel as the lesson moves. Space pauses instantly for questions and resumes in place.',
      },
      {
        q: 'Does it work on school laptops with restricted installs?',
        a: 'Yes — it is just a web page. Nothing installs, no account is needed, and scripts save locally in the browser, so it runs on locked-down school machines exactly like on your own.',
      },
    ],
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
    sections: [
      {
        h2: 'Talking points, not a script',
        paragraphs: [
          'Live conversation punishes verbatim reading — an interviewer hears a read answer instantly. What works is a prompt sheet: your key points as short fragments, each on its own line, with the phrases you must say exactly (numbers, names, the answer to “why this company”) written out in full. Blank lines between topics make each block a glanceable unit.',
          'Keep the prompter paused and drive it manually: a wheel flick or a drag moves you to the topic the conversation actually reached, in whatever order it happens. This is the one use case where the scroll speed barely matters — pause is the default state and seeking is the main gesture. If you prefer some motion, the slowest speeds crawl gently enough to shadow a long answer.',
          'Size the window like a sticky note: a narrow column beside the video call, close to the camera, with text small enough that your gaze shift is imperceptible on a webcam. Your eyes stay near the lens, and the other side sees attention, not reading.',
        ],
      },
      {
        h2: 'Webinars and live streams',
        paragraphs: [
          'For webinars and streams, the mix shifts: scripted segments (the intro, the sponsor read, the wrap-up) run as a normal slow scroll, while Q&A and discussion segments sit paused. Put the whole show in one script in running order and move between segments with the wheel — the same document carries you from a scripted cold-open to free-form chat and back.',
          'Everything stays private: notes are never uploaded, so talking points about a job interview, an off-record briefing, or an unannounced product stay on your machine. And because it is a browser tab, it sits invisibly beside any call app — Zoom, Meet, Teams, OBS — with no overlay software or screen-share risk.',
        ],
      },
    ],
    faq: [
      {
        q: 'Will the interviewer notice I’m using notes?',
        a: 'Not if you use fragments instead of sentences and keep the window narrow, near the camera, with small text. You glance at a keyword and speak naturally — the failure mode is reading full sentences, not having notes.',
      },
      {
        q: 'How do I follow a conversation that jumps between topics?',
        a: 'Keep the scroll paused and seek with the mouse wheel or by dragging — blank lines between topic blocks make each one easy to spot. The prompter moves at the conversation’s pace because you move it.',
      },
      {
        q: 'Are my interview notes private?',
        a: 'Completely. Notes are stored only in your browser’s local storage and never uploaded — there is no account and no server-side copy, so preparation for sensitive conversations stays on your device.',
      },
    ],
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
