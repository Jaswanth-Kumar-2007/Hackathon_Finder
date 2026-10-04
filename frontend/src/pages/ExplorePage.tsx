import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { AnimatePresence,  motion } from 'framer-motion'
import { ArrowRight, SearchX, SlidersHorizontal, TrendingUp } from 'lucide-react'
import { categories, categoryById, popularSearches } from '../data/categories'
import { fadeUp, staggerContainer } from '../animations/variants'
import { useAsync } from '../hooks/useAsync'
import { hackathonApi } from '../services/api'
import type { CategoryId, Filters, Hackathon, Platform, SortKey } from '../types'
import { countActiveFilters, emptyFilters } from '../utils/search'
import { CompactRow } from '../components/hackathon/CompactRow'
import { FilterDrawer } from '../components/hackathon/FilterDrawer'
import { FilterPanel } from '../components/hackathon/FilterPanel'
import { HackathonCard } from '../components/hackathon/HackathonCard'
import { StaggerGrid } from '../components/hackathon/StaggerGrid'
import { CategoryCard } from '../components/home/CategoryCard'
import { Button } from '../components/ui/Button'
import { SectionHeader } from '../components/ui/SectionHeader'
import { CardGridSkeleton } from '../components/ui/Skeletons'
import { EmptyState, ErrorState } from '../components/ui/States'

const sortOptions: Array<{ value: SortKey; label: string }> = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'starting-soon', label: 'Starting soon' },
  { value: 'deadline', label: 'Registration deadline' },
  { value: 'prize', label: 'Highest prize' },
  { value: 'newest', label: 'Recently added' },
]

const trendingSearches = [...popularSearches.map((p) => ({ label: p.label, query: p.query })), { label: 'Web3 Hackathons', query: 'web3' }, { label: 'Security Hackathons', query: 'security' }, { label: 'Student Hackathons', query: 'students' }]

export function ExplorePage() {
  const [params, setParams] = useSearchParams()
  const categoryParam = params.get('category')
  const platformParam = params.get('platform')

  const [filters, setFilters] = useState<Filters>(() => ({
    ...emptyFilters,
    category: categoryParam && categoryById(categoryParam) ? [categoryParam as CategoryId] : [],
    platform: platformParam ? [platformParam as Platform] : [],
  }))
  const [sort, setSort] = useState<SortKey>('relevance')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [view] = useState<'grid' | 'list'>('grid')

  const activeCount = countActiveFilters(filters)
  const searching = activeCount > 0

  const overview = useAsync(() => hackathonApi.list(), [])
  const results = useAsync(
    () => (searching ? hackathonApi.search({ query: '', filters, sort }) : Promise.resolve<Hackathon[]>([])),
    [searching, JSON.stringify(filters), sort],
  )

  const resetAll = () => {
    setFilters(emptyFilters)
    setSort('relevance')
    setParams({})
  }
  const clearFilters = () => {
    setFilters(emptyFilters)
    if (categoryParam) {
      const next = new URLSearchParams(params)
      next.delete('category')
      setParams(next)
    }
    if (platformParam) {
      const next = new URLSearchParams(params)
      next.delete('platform')
      setParams(next)
    }
  }

  /* ───────────── Discovery view ───────────── */
  if (!searching) {
    const all = overview.data ?? []
    const upcoming = all.filter((h) => new Date(h.startDate).getTime() > Date.now())
    const soon = [...upcoming].sort((a, b) => +new Date(a.startDate) - +new Date(b.startDate)).slice(0, 3)
    const recent = [...all].sort((a, b) => +new Date(b.addedAt) - +new Date(a.addedAt)).slice(0, 4)
    const featured = all.filter((h) => h.featured).slice(0, 3)

    return (
      <div className="container-page pb-24 pt-28 sm:pt-32">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl">
          <h1 className="text-3xl font-semibold sm:text-4xl">Explore hackathons</h1>
          <p className="mt-3 text-[15px] text-muted sm:text-base">Use filters to narrow down by platform, category, mode, and more.</p>
        </motion.div>

        <section className="mt-14">
          <SectionHeader title="Popular categories" />
          <StaggerGrid inView className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((c) => (
              <CategoryCard key={c.id} category={c} count={overview.data ? all.filter((h) => h.categories.includes(c.id)).length : undefined} />
            ))}
          </StaggerGrid>
        </section>

        <section className="mt-16">
          <SectionHeader title="Trending searches" />
          <motion.div
            variants={staggerContainer(0.05)}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="flex flex-wrap gap-2.5"
          >
            {trendingSearches.map((s) => (
              <motion.div key={s.label} variants={fadeUp}>
                <Link
                  to={`/explore?q=${encodeURIComponent(s.query)}`}
                  className="group inline-flex items-center gap-2 rounded-lg border border-line bg-surface px-3.5 py-2 text-sm text-muted transition-colors hover:border-accent/50 hover:text-ink"
                >
                  <TrendingUp size={14} className="text-faint transition-colors group-hover:text-accent" aria-hidden />
                  {s.label}
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {overview.error ? (
          <div className="mt-16">
            <ErrorState onRetry={overview.reload} />
          </div>
        ) : (
          <>
            <section className="mt-16">
              <SectionHeader title="Starting soon" description="The next events to kick off." />
              {overview.loading ? (
                <CardGridSkeleton count={3} className="grid gap-4 md:grid-cols-2 lg:grid-cols-3" />
              ) : (
                <StaggerGrid inView className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {soon.map((h) => (
                    <HackathonCard key={h.id} hackathon={h} />
                  ))}
                </StaggerGrid>
              )}
            </section>

            <section className="mt-16">
              <SectionHeader title="Featured hackathons" description="Larger prizes and well-run events." />
              {overview.loading ? (
                <CardGridSkeleton count={3} className="grid gap-4 md:grid-cols-2 lg:grid-cols-3" />
              ) : (
                <StaggerGrid inView className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {featured.map((h) => (
                    <HackathonCard key={h.id} hackathon={h} />
                  ))}
                </StaggerGrid>
              )}
            </section>

            <section className="mt-16">
              <SectionHeader title="Recently added" />
              {overview.loading ? (
                <div className="space-y-3" role="status" aria-label="Loading">
                  {[0, 1, 2, 3].map((i) => (
                    <div key={i} className="skeleton h-16 w-full rounded-lg" />
                  ))}
                </div>
              ) : (
                <StaggerGrid as="ul" inView className="rounded-xl border border-line bg-surface px-2 sm:px-3">
                  {recent.map((h) => (
                    <CompactRow key={h.id} hackathon={h} />
                  ))}
                </StaggerGrid>
              )}
            </section>
          </>
        )}

        <div className="mt-14 flex justify-center">
          <Button variant="secondary" size="lg" onClick={() => setParams({ browse: '1' })}>
            Browse all hackathons <ArrowRight size={18} aria-hidden />
          </Button>
        </div>
      </div>
    )
  }

  /* ───────────── Results view ───────────── */
  const list = results.data ?? []
  const title = filters.category.length === 1 ? categoryById(filters.category[0])?.name ?? 'Hackathons' : 'All hackathons'

  return (
    <div className="container-page pb-24 pt-28 sm:pt-32">
      <div className="mb-8">
        <button onClick={resetAll} className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-ink">
          <ArrowRight size={14} className="rotate-180" aria-hidden /> Explore
        </button>
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold sm:text-3xl">{title}</h1>
            <p className="mt-2 text-sm text-muted" aria-live="polite">
              {results.loading ? 'Searching…' : results.error ? 'Search failed' : `${list.length} ${list.length === 1 ? 'hackathon' : 'hackathons'} found`}
            </p>
          </div>
          <div className="relative ml-auto flex items-center gap-3">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="h-9 cursor-pointer appearance-none rounded-lg border border-line-strong bg-raised pl-3 pr-9 text-sm text-ink transition-colors hover:border-accent/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
            >
              {sortOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  Sort: {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-10">
        <aside className="hidden lg:block" aria-label="Filters">
          <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto rounded-xl border border-line bg-surface p-4 pr-3">
            <FilterPanel filters={filters} onChange={setFilters} onClear={clearFilters} />
          </div>
        </aside>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="secondary" size="sm" className="lg:hidden" onClick={() => setDrawerOpen(true)}>
              <SlidersHorizontal size={16} aria-hidden /> Filters
              {activeCount > 0 && <span className="rounded bg-accent-strong px-1.5 font-mono text-[11px] text-white">{activeCount}</span>}
            </Button>
          </div>

          <div className="mt-6">
            {results.error ? (
              <ErrorState onRetry={results.reload} />
            ) : results.loading ? (
              <CardGridSkeleton count={6} className={view === 'grid' ? 'grid gap-4 sm:grid-cols-2 xl:grid-cols-3' : 'grid gap-4'} />
            ) : list.length === 0 ? (
              <EmptyState
                icon={SearchX}
                title="No hackathons found."
                description="Try changing your search or filters."
                action={
                  <Button variant="secondary" onClick={resetAll}>
                    Clear search and filters
                  </Button>
                }
              />
            ) : (
              <motion.div
                key={view}
                variants={staggerContainer(0.05)}
                initial="hidden"
                animate="show"
                className={view === 'grid' ? 'grid gap-4 sm:grid-cols-2 xl:grid-cols-3' : 'grid gap-4'}
              >
                <AnimatePresence mode="popLayout" initial={false}>
                  {list.map((h) => (
                    <HackathonCard key={h.id} hackathon={h} layout={view} />
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      <FilterDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        filters={filters}
        onChange={setFilters}
        onClear={clearFilters}
        resultCount={results.loading || results.error ? null : list.length}
      />
    </div>
  )
}