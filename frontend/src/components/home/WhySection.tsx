import { CalendarClock, Bookmark, Compass, Layers, SlidersHorizontal } from 'lucide-react'
import { Counter } from '../ui/Counter'
import { Reveal } from '../ui/Reveal'
import { StaggerGrid } from '../hackathon/StaggerGrid'
import { motion } from 'framer-motion'
import { fadeUp } from '../../animations/variants'

const features = [
  { icon: Layers, title: 'Search across sources', text: 'One search covers Devpost, HackerEarth, Unstop, Devfolio and MLH.' },
  { icon: SlidersHorizontal, title: 'Smart filtering', text: 'Narrow by mode, platform, topic, eligibility, dates and prize size.' },
  { icon: CalendarClock, title: 'Important dates', text: 'Registration deadlines, start dates and end dates are always up front.' },
  { icon: Bookmark, title: 'Save opportunities', text: 'Keep a shortlist of events you want to come back to.' },
  { icon: Compass, title: 'Discover relevant events', text: 'Browse by category to find hackathons that fit what you like to build.' },
]

// Placeholder numbers for the demo. Replace with real stats from your API.
const stats = [
  { value: 12400, suffix: '+', label: 'Hackathons indexed' },
  { value: 5, label: 'Platforms searched' },
  { value: 38, label: 'Countries covered' },
  { value: 4, prefix: '$', suffix: 'M+', label: 'In listed prizes' },
]

export function WhySection() {
  return (
    <section className="container-page py-20 sm:py-28">
      <div className="grid gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
        <Reveal className="lg:sticky lg:top-28 lg:self-start">
          <h2 className="text-3xl font-semibold sm:text-4xl">Why Hackathon Finder?</h2>
          <p className="mt-4 max-w-md text-[15px] leading-relaxed text-muted">
            Great hackathons are scattered across many websites, each with its own layout and filters. We bring them
            together so you can compare them in one place.
          </p>
          <dl className="mt-10 grid grid-cols-2 gap-x-6 gap-y-8">
            {stats.map((s) => (
              <div key={s.label}>
                <dd className="font-mono text-3xl font-medium">
                  <Counter to={s.value} prefix={s.prefix} suffix={s.suffix} />
                </dd>
                <dt className="mt-1 text-sm text-muted">{s.label}</dt>
              </div>
            ))}
          </dl>
        </Reveal>

        <StaggerGrid as="ul" inView className="divide-y divide-line rounded-xl border border-line bg-surface">
          {features.map((f) => (
            <motion.li key={f.title} variants={fadeUp} className="group flex gap-4 p-5 sm:p-6">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-line bg-raised text-accent transition-colors group-hover:border-accent/40 group-hover:bg-accent-soft">
                <f.icon size={19} aria-hidden />
              </span>
              <div>
                <h3 className="text-[15px] font-semibold">{f.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted">{f.text}</p>
              </div>
            </motion.li>
          ))}
        </StaggerGrid>
      </div>
    </section>
  )
}
