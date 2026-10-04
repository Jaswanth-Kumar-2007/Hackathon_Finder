import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowUpRight, CalendarDays, MapPin, Trophy } from 'lucide-react'
import type { Hackathon } from '../../types'
import { fadeUp } from '../../animations/variants'
import { formatRange, getStatus } from '../../utils/date'
import { ModeBadge, PlatformBadge, StatusText } from '../ui/Badges'
import { SaveButton } from './SaveButton'

interface Props {
  hackathon: Hackathon
  layout?: 'grid' | 'list'
}

/**
 * The whole card is clickable through the title link's ::after overlay,
 * while the Save button stays independently focusable above it.
 */
export function HackathonCard({ hackathon: h, layout = 'grid' }: Props) {
  const status = getStatus(h)
  const isList = layout === 'list'

  return (
    <motion.article
      layout
      variants={fadeUp}
      exit="exit"
      whileHover={{ y: -3 }}
      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
      className={`group relative overflow-hidden rounded-xl border border-line bg-surface shadow-card transition-[border-color,box-shadow] duration-200 hover:border-accent/50 hover:shadow-lift ${
        isList ? 'flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:gap-6' : 'flex flex-col p-5'
      }`}
    >
      <div className={isList ? 'min-w-0 flex-1' : 'flex-1'}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <PlatformBadge platform={h.platform} />
            <span className="truncate text-[13px] text-faint">{h.organizer}</span>
          </div>
          {!isList && <SaveButton id={h.id} title={h.title} />}
        </div>

        <h3 className="mt-4 text-[17px] font-semibold leading-snug">
          <Link
            to={`/hackathon/${h.id}`}
            className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none"
          >
            {h.title}
          </Link>
        </h3>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted">{h.description}</p>

        <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-[13px] text-muted">
          <ModeBadge mode={h.mode} />
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays size={14} className="text-faint" aria-hidden />
            {formatRange(h.startDate, h.endDate)}
          </span>
          {isList && (
            <span className="inline-flex items-center gap-1.5">
              <MapPin size={14} className="text-faint" aria-hidden />
              {h.location}
            </span>
          )}
        </div>
      </div>

      <div
        className={
          isList
            ? 'flex items-center justify-between gap-6 border-t border-line pt-4 sm:w-52 sm:flex-col sm:items-end sm:gap-3 sm:border-l sm:border-t-0 sm:pl-6 sm:pt-0'
            : 'mt-5 flex items-center justify-between border-t border-line pt-4'
        }
      >
        <div className={isList ? 'sm:text-right' : ''}>
          <div className="inline-flex items-center gap-1.5 font-mono text-[15px] font-medium text-ink">
            <Trophy size={14} className="text-amber" aria-hidden />
            {h.prizeLabel}
          </div>
          <div className="mt-1">
            <StatusText status={status} />
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isList && <SaveButton id={h.id} title={h.title} />}
          <span className="inline-flex items-center gap-1 text-sm font-medium text-accent">
            View details
            <ArrowUpRight
              size={16}
              aria-hidden
              className="transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            />
          </span>
        </div>
      </div>
    </motion.article>
  )
}
