import { useEffect } from 'react'
import { Link, Navigate, useLocation } from 'react-router-dom'
import { ArrowRight, Check, Lightbulb } from 'lucide-react'
import { SiteFooter, SiteHeader } from '@/components/Layout'
import { Button } from '@/components/ui/button'
import { USE_CASES } from '@/lib/useCases'

export default function UseCase() {
  const { pathname } = useLocation()
  const useCase = USE_CASES.find((u) => u.path === pathname)

  useEffect(() => {
    if (useCase) document.title = useCase.title
    return () => {
      document.title =
        'Free Online Teleprompter — No Signup, No Watermark | PromptCue'
    }
  }, [useCase])

  if (!useCase) return <Navigate to="/" replace />

  return (
    <div className="flex min-h-svh flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10">
        <p className="text-primary text-sm font-medium">
          Teleprompter for {useCase.name}
        </p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">
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

        <div className="bg-accent/50 mt-8 flex gap-3 rounded-xl border p-4">
          <Lightbulb className="text-primary mt-0.5 size-5 shrink-0" aria-hidden />
          <p className="text-sm leading-relaxed">{useCase.tip}</p>
        </div>

        <Button asChild size="lg" className="mt-8">
          <Link to="/">
            Open the free teleprompter <ArrowRight />
          </Link>
        </Button>

        <section className="mt-12 border-t pt-8">
          <h2 className="font-semibold">More use cases</h2>
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm">
            {USE_CASES.filter((u) => u.slug !== useCase.slug).map((u) => (
              <Link key={u.slug} to={u.path} className="text-primary hover:underline">
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
