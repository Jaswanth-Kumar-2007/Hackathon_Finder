import type { ReactNode } from 'react'
import type { Mode, Platform } from '../../types'
import type { Status } from '../../utils/date'
import { cn } from '../../utils/format'

const platformColor: Record<Platform, string> = {
  Devpost: '#5EC3FF',
  HackerEarth: '#7B8CFF',
  Unstop: '#F5B84B',
  Devfolio: '#5EE0A8',
  MLH: '#FF7A90',
}

export function PlatformBadge({ platform, className }: { platform: Platform; className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-2 text-[13px] font-medium text-muted', className)}>
      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: platformColor[platform] }} aria-hidden />
      {platform}
    </span>
  )
}

const modeStyle: Record<Mode, string> = {
  Online: 'border-mint/30 bg-mint/10 text-mint',
  Offline: 'border-sky/30 bg-sky/10 text-sky',
  Hybrid: 'border-amber/30 bg-amber/10 text-amber',
}

export function ModeBadge({ mode }: { mode: Mode }) {
  return (
    <span className={cn('inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium', modeStyle[mode])}>
      {mode}
    </span>
  )
}

const statusStyle: Record<Status['tone'], string> = {
  live: 'text-mint',
  soon: 'text-amber',
  upcoming: 'text-muted',
  ended: 'text-faint',
}

export function StatusText({ status }: { status: Status }) {
  return (
    <span className={cn('inline-flex items-center gap-1.5 text-xs font-medium', statusStyle[status.tone])}>
      {status.tone === 'live' && <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-mint" aria-hidden />}
      {status.label}
    </span>
  )
}

export function Chip({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span className={cn('inline-flex items-center rounded-md border border-line bg-raised/60 px-2.5 py-1 text-[13px] text-muted', className)}>
      {children}
    </span>
  )
}
