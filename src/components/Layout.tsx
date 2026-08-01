import { Link } from 'react-router-dom'
import { MonitorPlay } from 'lucide-react'
import { USE_CASES } from '@/lib/useCases'

export function SiteHeader() {
  return (
    <header className="border-b">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
      <Link to="/" className="flex items-center gap-2 font-bold">
        <MonitorPlay className="text-primary size-5" aria-hidden />
        PromptCue
      </Link>
        <nav className="text-muted-foreground flex items-center gap-4 text-sm">
          <a href="/#use-cases" className="hover:text-foreground">
            Use cases
          </a>
          <a href="/#faq" className="hover:text-foreground max-sm:hidden">
            FAQ
          </a>
        </nav>
      </div>
    </header>
  )
}

export function SiteFooter() {
  return (
    <footer className="border-t">
      <div className="text-muted-foreground mx-auto max-w-5xl space-y-4 px-4 py-8 text-sm">
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          {USE_CASES.map((u) => (
            <Link key={u.slug} to={u.path} className="hover:text-foreground">
              Teleprompter for {u.name}
            </Link>
          ))}
        </div>
        <p>
          Writing a speech first? Try{' '}
          <a
            href="https://speech.zalize.com"
            className="text-primary underline underline-offset-2"
          >
            SpeakEasy — AI speech writer for weddings, toasts and life’s big moments
          </a>
          .
        </p>
        <p className="text-xs">
          PromptCue is a free browser teleprompter. Your scripts are stored only in your
          browser’s local storage and are never uploaded to our servers. Provided
          &ldquo;as is&rdquo; without warranty of any kind — please rehearse and verify
          your material before any live or recorded use. We collect only anonymous
          aggregate usage counts (page views and prompter starts); no personal data, no
          cookies, no tracking of script content.
        </p>
        <p className="text-xs">
          © {new Date().getFullYear()} PromptCue · prompter.zalize.com — part of the
          Zalize tools family.
        </p>
      </div>
    </footer>
  )
}
