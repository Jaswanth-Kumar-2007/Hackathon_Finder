import type { Filters, Hackathon, SearchParams, SortKey } from '../types'
import { categories } from '../data/categories'
import { daysUntil } from './date'

export const emptyFilters: Filters = {
  mode: [],
  platform: [],
  category: [],
  eligibility: [],
  date: 'any',
  prize: 'any',
}

export function countActiveFilters(f: Filters): number {
  return (
    f.mode.length +
    f.platform.length +
    f.category.length +
    f.eligibility.length +
    (f.date !== 'any' ? 1 : 0) +
    (f.prize !== 'any' ? 1 : 0)
  )
}

const STOP_WORDS = new Set(['hackathon', 'hackathons', 'hack', 'hacks', 'events', 'event', 'for', 'the', 'a', 'in'])

function haystack(h: Hackathon): { text: string; words: Set<string> } {
  const catKeywords = h.categories.flatMap((id) => categories.find((c) => c.id === id)?.keywords ?? [])
  const text = [
    h.title,
    h.description,
    h.platform,
    h.organizer,
    h.mode,
    h.location,
    ...h.eligibility,
    ...h.technologies,
    ...catKeywords,
  ]
    .join(' ')
    .toLowerCase()
  return { text, words: new Set(text.split(/[^a-z0-9+#.]+/).filter(Boolean)) }
}

/** Returns -1 when a token doesn't match, otherwise a positive score. */
function relevance(h: Hackathon, tokens: string[]): number {
  if (tokens.length === 0) return 0
  const title = h.title.toLowerCase()
  const { text, words } = haystack(h)
  let score = 0
  for (const t of tokens) {
    // Short tokens like "ai" or "ml" must match a whole word, or "html" would match "ml".
    let hit: boolean
    if (t.length <= 3) {
      hit = words.has(t)
    } else {
      // Substring match, plus prefix match so "beginner" finds "Beginners".
      hit = text.includes(t) || Array.from(words).some((w) => w.startsWith(t))
    }
    if (!hit) return -1
    score += title.includes(t) ? 3 : 1
  }
  return score
}

function matchesFilters(h: Hackathon, f: Filters): boolean {
  if (f.mode.length && !f.mode.includes(h.mode)) return false
  if (f.platform.length && !f.platform.includes(h.platform)) return false
  if (f.category.length && !h.categories.some((c) => f.category.includes(c))) return false
  if (f.eligibility.length && !h.eligibility.some((e) => f.eligibility.includes(e))) return false
  if (f.prize !== 'any' && h.prizeAmount < Number(f.prize)) return false
  if (f.date !== 'any') {
    const d = daysUntil(h.startDate)
    const limit = f.date === 'soon' ? 14 : f.date === 'week' ? 7 : 30
    if (d < 0 || d > limit) return false
  }
  return true
}

const sorters: Record<SortKey, (a: Hackathon, b: Hackathon) => number> = {
  relevance: () => 0,
  'starting-soon': (a, b) => +new Date(a.startDate) - +new Date(b.startDate),
  prize: (a, b) => b.prizeAmount - a.prizeAmount,
  newest: (a, b) => +new Date(b.addedAt) - +new Date(a.addedAt),
  deadline: (a, b) => +new Date(a.registrationDeadline) - +new Date(b.registrationDeadline),
}

/** Pure search/filter/sort used by the mock API. Your backend will do this server-side. */
export function searchHackathons(all: Hackathon[], { query, filters, sort }: SearchParams): Hackathon[] {
  const tokens = query
    .toLowerCase()
    .split(/\s+/)
    .map((t) => t.replace(/[^a-z0-9+#.]/g, ''))
    .filter((t) => t && !STOP_WORDS.has(t))

  const scored = all
    .filter((h) => matchesFilters(h, filters))
    .map((h) => ({ h, score: relevance(h, tokens) }))
    .filter((x) => tokens.length === 0 || x.score >= 0)

  const key: SortKey = sort === 'relevance' && tokens.length === 0 ? 'starting-soon' : sort
  scored.sort((a, b) => (key === 'relevance' ? b.score - a.score : sorters[key](a.h, b.h)))
  return scored.map((x) => x.h)
}
