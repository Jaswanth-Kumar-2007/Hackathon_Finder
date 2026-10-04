import { motion } from 'framer-motion'
import type { Hackathon } from '../../types'
import { daysUntil } from '../../utils/date'
import { cn } from '../../utils/format'

function relative(iso: string): string {
  const d = daysUntil(iso)
  if (d < 0) return 'Passed'
  if (d === 0) return 'Today'
  if (d === 1) return 'Tomorrow'
  return `In ${d} days`
}

const full = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' })

export function DateTimeline({ hackathon: h }: { hackathon: Hackathon }) {
  const items = [
    { label: 'Registration deadline', iso: h.registrationDeadline },
    { label: 'Start date', iso: h.startDate },
    { label: 'End date', iso: h.endDate },
  ]
  const nextIndex = items.findIndex((i) => daysUntil(i.iso) >= 0)

  return (
    <ol className="relative">
      <motion.span
        aria-hidden
        className="absolute bottom-3 left-[7px] top-3 w-px origin-top bg-line-strong"
        initial={{ scaleY: 0 }}
        whileInView={{ scaleY: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      />
      {items.map((item, i) => {
        const passed = daysUntil(item.iso) < 0
        const next = i === nextIndex
        return (
          <li key={item.label} className="relative flex items-start gap-5 py-3.5">
            <span
              aria-hidden
              className={cn(
                'relative z-10 mt-1 h-[15px] w-[15px] shrink-0 rounded-full border-2 bg-surface',
                passed ? 'border-line-strong bg-line-strong' : next ? 'border-accent bg-accent' : 'border-line-strong',
              )}
            >
              {next && <span className="absolute -inset-1 animate-ping rounded-full bg-accent/30" />}
            </span>
            <div className="flex flex-1 flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <div>
                <p className={cn('text-[15px] font-medium', passed && 'text-muted')}>{item.label}</p>
                <p className="text-sm text-muted">{full(item.iso)}</p>
              </div>
              <span className={cn('font-mono text-[13px]', next ? 'text-accent' : 'text-faint')}>{relative(item.iso)}</span>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
