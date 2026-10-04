import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { CalendarClock, Globe, Trophy } from 'lucide-react'
import { easeOut } from '../../animations/variants'
import { popularSearches } from '../../data/categories'

interface FloatCardProps {
  title: string
  platform: string
  dot: string
  lines: Array<{ icon: typeof Trophy; text: string }>
  className: string
  delay: number
  duration: number
  rotate: number
}

function FloatCard({ title, platform, dot, lines, className, delay, duration, rotate }: FloatCardProps) {
  return (
    <motion.div
      aria-hidden
      className={`pointer-events-none absolute hidden w-[232px] min-[1360px]:block ${className}`}
      initial={{ opacity: 0, y: 24, rotate }}
      animate={{ opacity: 1, y: 0, rotate }}
      transition={{ duration: 0.8, delay: 0.5 + delay, ease: easeOut }}
    >
      <motion.div
        animate={{ y: [0, -9, 0] }}
        transition={{ duration, repeat: Infinity, ease: 'easeInOut', delay }}
        className="rounded-xl border border-line-strong bg-surface/95 p-4 shadow-pop"
      >
        <div className="flex items-center gap-2 text-xs text-muted">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: dot }} />
          {platform}
        </div>
        <p className="mt-2.5 text-[15px] font-semibold">{title}</p>
        <div className="mt-3 space-y-1.5">
          {lines.map(({ icon: Icon, text }) => (
            <p key={text} className="flex items-center gap-2 text-[13px] text-muted">
              <Icon size={13} className="text-faint" />
              {text}
            </p>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}

export function Hero() {
  const navigate = useNavigate()
  const go = (q: string) => navigate(q ? `/explore?q=${encodeURIComponent(q)}` : '/explore')

  return (
    <section className="relative overflow-hidden pb-20 pt-32 sm:pb-28 sm:pt-40">
      {/* Background: faint grid + two slow-drifting light sources */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="bg-grid absolute inset-0" />
        <div className="absolute -top-24 left-[12%] h-[380px] w-[380px] animate-drift rounded-full bg-accent-strong/20 blur-[110px]" />
        <div className="absolute -top-10 right-[10%] h-[320px] w-[320px] animate-drift-slow rounded-full bg-sky/[0.12] blur-[110px]" />
      </div>

      <FloatCard
        title="AI Hackathon"
        platform="Online"
        dot="#5EE0A8"
        className="left-[3%] top-[34%] 2xl:left-[8%]"
        rotate={-3}
        delay={0}
        duration={7}
        lines={[
          { icon: Trophy, text: '$10,000 Prize' },
          { icon: CalendarClock, text: '12 days left' },
        ]}
      />
      <FloatCard
        title="React Hackathon"
        platform="Devpost"
        dot="#5EC3FF"
        className="right-[3%] top-[30%] 2xl:right-[8%]"
        rotate={2.5}
        delay={0.6}
        duration={8}
        lines={[
          { icon: Globe, text: 'Online' },
          { icon: Trophy, text: '$6,000 Prize' },
        ]}
      />
      <FloatCard
        title="ML Challenge"
        platform="HackerEarth"
        dot="#7B8CFF"
        className="right-[9%] top-[62%] 2xl:right-[14%]"
        rotate={-2}
        delay={1.2}
        duration={6.5}
        lines={[{ icon: CalendarClock, text: 'Starts soon' }]}
      />

      <div className="container-page relative">
        <div className="mx-auto max-w-3xl text-center">
          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: easeOut }}
            className="text-[40px] font-semibold leading-[1.05] tracking-tight sm:text-6xl lg:text-[68px]"
          >
            Find Hackathons Worth Building For.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.12, ease: easeOut }}
            className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-muted sm:text-lg"
          >
            Discover hackathons from across the web and find opportunities that match what you want to build.
          </motion.p>

          <motion.div
            initial="hidden"
            animate="show"
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06, delayChildren: 0.5 } } }}
            className="mt-6 flex flex-wrap items-center justify-center gap-2"
          >
            <span className="mr-1 text-sm text-faint">Popular:</span>
            {popularSearches.map((p) => (
              <motion.button
                key={p.label}
                variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: easeOut } } }}
                whileHover={{ y: -2 }}
                onClick={() => go(p.query)}
                className="rounded-md border border-line bg-surface/70 px-3 py-1.5 text-[13px] text-muted transition-colors hover:border-accent/50 hover:text-ink"
              >
                {p.label}
              </motion.button>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
