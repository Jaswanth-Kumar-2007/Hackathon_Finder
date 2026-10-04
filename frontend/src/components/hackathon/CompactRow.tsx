import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import type { Hackathon } from '../../types'
import { fadeUp } from '../../animations/variants'
import { formatDate, getStatus } from '../../utils/date'
import { ModeBadge, PlatformBadge, StatusText } from '../ui/Badges'
import { SaveButton } from './SaveButton'

/** Dense row used for "Starting soon" and "Recently added". */
export function CompactRow({ hackathon: h }: { hackathon: Hackathon }) {
  const status = getStatus(h)
  return (
    <motion.li
      variants={fadeUp}
      className="group relative flex items-center gap-4 border-b border-line px-1 py-4 last:border-b-0 sm:px-3"
    >
      <div className="hidden w-16 shrink-0 text-center sm:block">
        <div className="font-mono text-xl font-medium leading-none">{new Date(h.startDate).getDate()}</div>
        <div className="mt-1 text-xs text-faint">{new Date(h.startDate).toLocaleDateString('en-US', { month: 'short' })}</div>
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="truncate text-[15px] font-semibold">
          <Link to={`/hackathon/${h.id}`} className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none">
            {h.title}
          </Link>
        </h3>
        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
          <PlatformBadge platform={h.platform} />
          <ModeBadge mode={h.mode} />
          <span className="text-xs text-faint sm:hidden">{formatDate(h.startDate)}</span>
        </div>
      </div>
      <div className="hidden text-right sm:block">
        <div className="font-mono text-sm">{h.prizeLabel}</div>
        <StatusText status={status} />
      </div>
      <SaveButton id={h.id} title={h.title} />
      <ArrowUpRight
        size={18}
        aria-hidden
        className="hidden text-faint transition-all duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent sm:block"
      />
    </motion.li>
  )
}
