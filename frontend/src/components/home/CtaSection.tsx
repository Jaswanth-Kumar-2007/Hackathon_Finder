import { ArrowRight } from 'lucide-react'
import { ButtonLink } from '../ui/Button'
import { Reveal } from '../ui/Reveal'

export function CtaSection() {
  return (
    <section className="container-page pb-20 sm:pb-28">
      <Reveal>
        <div className="relative overflow-hidden rounded-2xl border border-line-strong bg-surface px-6 py-14 text-center sm:px-12 sm:py-20">
          <div className="pointer-events-none absolute inset-0" aria-hidden>
            <div className="bg-grid absolute inset-0 opacity-70" />
            <div className="absolute left-1/2 top-0 h-56 w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent-strong/25 blur-[90px]" />
          </div>
          <div className="relative">
            <h2 className="text-3xl font-semibold sm:text-5xl">Ready to build something?</h2>
            <p className="mx-auto mt-4 max-w-md text-base text-muted sm:text-lg">Find your next hackathon.</p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <ButtonLink to="/explore" size="lg" className="w-full sm:w-auto">
                Explore hackathons <ArrowRight size={18} aria-hidden />
              </ButtonLink>
              <ButtonLink to="/register" variant="secondary" size="lg" className="w-full sm:w-auto">
                Create free account
              </ButtonLink>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  )
}
