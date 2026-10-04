import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { CalendarClock, Trophy } from 'lucide-react'
import { easeOut, staggerContainer } from '../../animations/variants'

const preview = [
  { name: 'GenAI for Good', platform: 'Devfolio', dot: '#5EE0A8', meta: 'Registration closes today', prize: '$20,000' },
  { name: 'ML Pipeline Challenge', platform: 'HackerEarth', dot: '#7B8CFF', meta: '2 days left to register', prize: '$7,500' },
  { name: 'Reactive 2026', platform: 'Devpost', dot: '#5EC3FF', meta: '5 days left to register', prize: '$6,000' },
]

export function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="flex items-center justify-center px-4 pb-16 pt-28 sm:px-8">
        <motion.div variants={staggerContainer(0.06, 0.05)} initial="hidden" animate="show" className="w-full max-w-md">
          <motion.div variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: easeOut } } }}>
            <h1 className="text-3xl font-semibold">{title}</h1>
            <p className="mt-2 text-[15px] text-muted">{subtitle}</p>
          </motion.div>
          <div className="mt-8 space-y-5">{children}</div>
        </motion.div>
      </div>

      <aside className="relative hidden overflow-hidden border-l border-line bg-surface/50 lg:flex lg:items-center lg:justify-center" aria-hidden>
        <div className="bg-grid absolute inset-0 opacity-60" />
        <div className="absolute left-1/3 top-1/4 h-72 w-72 animate-drift rounded-full bg-accent-strong/20 blur-[100px]" />
        <div className="relative w-full max-w-sm px-6">
          <p className="mb-6 text-xl font-semibold leading-snug">Keep every deadline in one place.</p>
          <motion.div
            variants={staggerContainer(0.12, 0.4)}
            initial="hidden"
            animate="show"
            className="space-y-3"
          >
            {preview.map((p) => (
              <motion.div
                key={p.name}
                variants={{ hidden: { opacity: 0, x: 24 }, show: { opacity: 1, x: 0, transition: { duration: 0.5, ease: easeOut } } }}
                className="rounded-xl border border-line-strong bg-surface p-4 shadow-card"
              >
                <div className="flex items-center gap-2 text-xs text-muted">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: p.dot }} />
                  {p.platform}
                </div>
                <p className="mt-2 text-[15px] font-semibold">{p.name}</p>
                <div className="mt-2.5 flex items-center justify-between text-[13px] text-muted">
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarClock size={13} className="text-faint" /> {p.meta}
                  </span>
                  <span className="inline-flex items-center gap-1.5 font-mono text-ink">
                    <Trophy size={13} className="text-amber" /> {p.prize}
                  </span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </aside>
    </div>
  )
}
