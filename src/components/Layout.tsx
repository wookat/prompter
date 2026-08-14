import { Link } from 'react-router-dom'
import { MonitorPlay } from 'lucide-react'
import { USE_CASE_LINKS } from '@/lib/useCaseLinks'

export function SiteHeader() {
  return (
    <header className="border-border/60 bg-background/80 sticky top-0 z-40 border-b backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link to="/" className="flex items-center gap-2 text-lg font-extrabold tracking-tight">
          <span className="bg-foreground text-primary flex size-8 items-center justify-center rounded-lg">
            <MonitorPlay className="size-4.5" aria-hidden />
          </span>
          PromptCue
        </Link>
        <nav className="flex items-center gap-1 text-sm font-medium sm:gap-2">
          <a
            href="/#how-it-works"
            className="text-muted-foreground hover:text-foreground rounded-lg px-3 py-2 max-md:hidden"
          >
            How it works
          </a>
          <a
            href="/#use-cases"
            className="text-muted-foreground hover:text-foreground rounded-lg px-3 py-2 max-sm:hidden"
          >
            Use cases
          </a>
          <a
            href="/#faq"
            className="text-muted-foreground hover:text-foreground rounded-lg px-3 py-2 max-sm:hidden"
          >
            FAQ
          </a>
          <a
            href="/#top"
            className="bg-primary text-primary-foreground hover:bg-primary/90 ml-1 rounded-lg px-4 py-2 font-semibold shadow-sm"
          >
            Start free
          </a>
        </nav>
      </div>
    </header>
  )
}

export function SiteFooter() {
  return (
    <footer className="border-t bg-white">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-10 sm:grid-cols-[1.2fr_1fr_1fr]">
          <div>
            <Link
              to="/"
              className="flex items-center gap-2 text-lg font-extrabold tracking-tight"
            >
              <span className="bg-foreground text-primary flex size-8 items-center justify-center rounded-lg">
                <MonitorPlay className="size-4.5" aria-hidden />
              </span>
              PromptCue
            </Link>
            <p className="text-muted-foreground mt-3 max-w-sm text-sm leading-relaxed">
              A free browser teleprompter. Scripts are stored only in your browser&rsquo;s
              local storage and are never uploaded to our servers — no personal data, no
              cookies, no tracking of script content.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-bold">Use cases</h3>
            <ul className="mt-3 space-y-2 text-sm">
              {USE_CASE_LINKS.slice(0, 4).map((u) => (
                <li key={u.slug}>
                  <Link
                    to={u.path}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Teleprompter for {u.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-bold">More</h3>
            <ul className="mt-3 space-y-2 text-sm">
              {USE_CASE_LINKS.slice(4).map((u) => (
                <li key={u.slug}>
                  <Link
                    to={u.path}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Teleprompter for {u.name}
                  </Link>
                </li>
              ))}
              <li>
                <a
                  href="https://speech.zalize.com"
                  className="text-muted-foreground hover:text-foreground"
                >
                  SpeakEasy — AI speech writer
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="text-muted-foreground mt-10 border-t pt-6 text-xs leading-relaxed">
          <p>
            Provided &ldquo;as is&rdquo; without warranty of any kind — please rehearse
            and verify your material before any live or recorded use. We collect only
            anonymous aggregate usage counts (page views and prompter starts).
          </p>
          <p className="mt-2">
            <span className="font-medium">More from ZALIZE:</span>{' '}
            <a href="https://speech.zalize.com" className="hover:text-foreground">SpeakEasy Speech</a>
            {' · '}
            <a href="https://scribe.zalize.com" className="hover:text-foreground">ScribeFlow</a>
            {' · '}
            <a href="https://ext.zalize.com" className="hover:text-foreground">SnapMark</a>
            {' · '}
            <a href="https://qr.zalize.com" className="hover:text-foreground">HonestQR</a>
          </p>
          <p className="mt-2">
            © {new Date().getFullYear()} PromptCue · prompter.zalize.com — part of the
            Zalize tools family.
          </p>
        </div>
      </div>
    </footer>
  )
}
