import type { Hackathon } from '../types'

const DAY = 86_400_000

export function daysUntil(iso: string): number {
  return Math.ceil((new Date(iso).getTime() - Date.now()) / DAY)
}

export function formatDate(iso: string, withYear = false): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    ...(withYear ? { year: 'numeric' } : {}),
  })
}

export function formatRange(startIso: string, endIso: string): string {
  if (startIso.slice(0, 10) === endIso.slice(0, 10)) return formatDate(startIso, true)
  return `${formatDate(startIso)} – ${formatDate(endIso, true)}`
}

export interface Status {
  label: string
  tone: 'live' | 'soon' | 'upcoming' | 'ended'
}

export function getStatus(h: Hackathon): Status {
  const now = Date.now()
  if (new Date(h.endDate).getTime() < now) return { label: 'Ended', tone: 'ended' }
  if (new Date(h.startDate).getTime() <= now) return { label: 'Live now', tone: 'live' }
  const d = daysUntil(h.startDate)
  if (d <= 14) return { label: d <= 1 ? 'Starts tomorrow' : `Starts in ${d} days`, tone: 'soon' }
  return { label: `Starts in ${d} days`, tone: 'upcoming' }
}

export function registrationLabel(h: Hackathon): string {
  const d = daysUntil(h.registrationDeadline)
  if (d < 0) return 'Registration closed'
  if (d === 0) return 'Registration closes today'
  return `${d} ${d === 1 ? 'day' : 'days'} left to register`
}
