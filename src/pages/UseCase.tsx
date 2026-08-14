import { useEffect } from 'react'
import { Link, Navigate, useLocation } from 'react-router-dom'
import { ArrowRight, Check, Lightbulb } from 'lucide-react'
import { SiteFooter, SiteHeader } from '@/components/Layout'
import { Button } from '@/components/ui/button'
import { track } from '@/lib/track'
import { CTA_START_FREE, USE_CASES } from '@/lib/useCases'

export default function UseCase() {
  const { pathname } = useLocation()
  const useCase = USE_CASES.find((u) => u.path === pathname)

  useEffect(() => {
    if (useCase) {
      document.title = useCase.title
      track('usecase_view', useCase.slug)
    }
    return () => {
      document.title =
        'Free Online Teleprompter — No Signup, No Watermark | PromptCue'
    }
  }, [useCase])

  if (!useCase) return <Navigate to="/" replace />

  return (
    <div className="flex min-h-svh flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-12">
        <p className="bg-accent text-accent-foreground w-fit rounded-full px-3 py-1 text-xs font-semibold tracking-wide">
          Teleprompter for {useCase.name}
        </p>
        <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-balance sm:text-5xl">
          {useCase.h1}
        </h1>
        <p className="text-muted-foreground mt-4 leading-relaxed">{useCase.intro}</p>

        <ul className="mt-6 space-y-3">
          {useCase.bullets.map((b) => (
            <li key={b} className="flex gap-2.5">
              <Check className="text-primary mt-0.5 size-5 shrink-0" aria-hidden />
              <span className="text-sm leading-relaxed">{b}</span>
            </li>
          ))}
        </ul>

        <div className="bg-accent/50 mt-8 flex gap-3 rounded-2xl border p-5">
          <Lightbulb className="text-primary mt-0.5 size-5 shrink-0" aria-hidden />
          <p className="text-sm leading-relaxed">{useCase.tip}</p>
        </div>

        {useCase.sections?.map((s) => (
          <section key={s.h2} className="mt-10">
            <h2 className="text-xl font-extrabold tracking-tight sm:text-2xl">{s.h2}</h2>
            {s.paragraphs.map((p) => (
              <p key={p} className="text-muted-foreground mt-4 text-sm leading-relaxed sm:text-base">
                {p}
              </p>
            ))}
          </section>
        ))}

        {useCase.faq && (
          <section className="mt-10">
            <h2 className="text-xl font-extrabold tracking-tight sm:text-2xl">
              Frequently asked questions
            </h2>
            <div className="mt-4 space-y-3">
              {useCase.faq.map((f) => (
                <details key={f.q} className="group rounded-2xl border px-5 py-4 open:shadow-sm">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-bold [&::-webkit-details-marker]:hidden">
                    {f.q}
                    <span
                      className="text-muted-foreground transition-transform group-open:rotate-45"
                      aria-hidden
                    >
                      +
                    </span>
                  </summary>
                  <p className="text-muted-foreground mt-3 text-sm leading-relaxed">{f.a}</p>
                </details>
              ))}
            </div>
          </section>
        )}

        <Button asChild size="lg" className="mt-8 font-bold shadow-md">
          <Link to="/">
            {CTA_START_FREE} <ArrowRight />
          </Link>
        </Button>

        <section className="mt-12 border-t pt-8">
          <h2 className="font-bold">More use cases</h2>
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm">
            {USE_CASES.filter((u) => u.slug !== useCase.slug).map((u) => (
              <Link key={u.slug} to={u.path} className="font-medium underline-offset-2 hover:underline">
                {u.name}
              </Link>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
