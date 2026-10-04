import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Reveal } from './Reveal'

export function SectionHeader({
  title,
  description,
  to,
  linkLabel = 'View all',
  action,
}: {
  title: string
  description?: string
  to?: string
  linkLabel?: string
  action?: ReactNode
}) {
  return (
    <Reveal className="mb-8 flex items-end justify-between gap-4">
      <div>
        <h2 className="text-2xl font-semibold sm:text-[28px]">{title}</h2>
        {description && <p className="mt-2 max-w-xl text-[15px] text-muted">{description}</p>}
      </div>
      {to && (
        <Link
          to={to}
          className="group hidden shrink-0 items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-ink sm:inline-flex"
        >
          {linkLabel}
          <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" aria-hidden />
        </Link>
      )}
      {action}
    </Reveal>
  )
}
