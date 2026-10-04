import { motion } from 'framer-motion'
import { CalendarClock, Layers, SlidersHorizontal } from 'lucide-react'
import { fadeUp } from '../animations/variants'
import { StaggerGrid } from '../components/hackathon/StaggerGrid'
import { CtaSection } from '../components/home/CtaSection'

const sections = [
  { icon: Layers, title: 'One search, many sources', text: 'We bring listings from Devpost, HackerEarth, Unstop, Devfolio and MLH into one searchable place, so you do not have to check each site.' },
  { icon: SlidersHorizontal, title: 'Filters that match how you choose', text: 'Narrow by online or in-person events, topic, eligibility, prize and start date. Find the few that fit instead of scrolling through hundreds.' },
  { icon: CalendarClock, title: 'Deadlines you can see', text: 'Registration deadlines and event dates sit at the top of every listing, and you can save events to come back to before they close.' },
]

export function AboutPage() {
  return (
    <>
      <div className="container-page pb-16 pt-28 sm:pt-36">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl">
          <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">Hackathons, without the tab overload.</h1>
          <p className="mt-6 text-lg leading-relaxed text-muted">
            Hackathon Finder helps developers and students discover hackathons without manually searching multiple websites.
          </p>
        </motion.div>

        <StaggerGrid className="mt-14 grid gap-4 md:grid-cols-3">
          {sections.map((s) => (
            <motion.article key={s.title} variants={fadeUp} className="surface p-6">
              <span className="grid h-10 w-10 place-items-center rounded-lg border border-line bg-raised text-accent">
                <s.icon size={19} aria-hidden />
              </span>
              <h2 className="mt-5 text-[17px] font-semibold">{s.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">{s.text}</p>
            </motion.article>
          ))}
        </StaggerGrid>
      </div>
      <CtaSection />
    </>
  )
}
