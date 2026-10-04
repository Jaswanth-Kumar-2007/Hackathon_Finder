import { Reveal } from '../ui/Reveal'

const platforms = ['Devpost', 'HackerEarth', 'Unstop', 'Devfolio', 'MLH']

export function PlatformsStrip() {
  return (
    <section className="border-y border-line bg-surface/40" aria-label="Supported platforms">
      <Reveal className="container-page flex flex-col items-center justify-between gap-5 py-7 md:flex-row">
        <p className="text-sm text-faint">Listings gathered from</p>
        <ul className="flex flex-wrap items-center justify-center gap-x-10 gap-y-3">
          {platforms.map((p) => (
            <li key={p} className="text-lg font-semibold tracking-tight text-muted/80 transition-colors hover:text-ink">
              {p}
            </li>
          ))}
        </ul>
      </Reveal>
    </section>
  )
}
