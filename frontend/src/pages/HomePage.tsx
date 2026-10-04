import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { categories } from '../data/categories'
import { hackathonApi } from '../services/api'
import { useAsync } from '../hooks/useAsync'
import { CompactRow } from '../components/hackathon/CompactRow'
import { HackathonCard } from '../components/hackathon/HackathonCard'
import { StaggerGrid } from '../components/hackathon/StaggerGrid'
import { CategoryCard } from '../components/home/CategoryCard'
import { CtaSection } from '../components/home/CtaSection'
import { Hero } from '../components/home/Hero'
import { PlatformsStrip } from '../components/home/PlatformsStrip'
import { WhySection } from '../components/home/WhySection'
import { SectionHeader } from '../components/ui/SectionHeader'
import { ErrorState } from '../components/ui/States'
import { CardGridSkeleton } from '../components/ui/Skeletons'

export function HomePage() {
  const { data, loading, error, reload } = useAsync(() => hackathonApi.list(), [])

  const { trending, soon, counts } = useMemo(() => {
    const all = data ?? []
    const upcoming = all.filter((h) => new Date(h.startDate).getTime() > Date.now())
    return {
      trending: all.filter((h) => h.trending).slice(0, 3),
      soon: [...upcoming].sort((a, b) => +new Date(a.startDate) - +new Date(b.startDate)).slice(0, 5),
      counts: Object.fromEntries(categories.map((c) => [c.id, all.filter((h) => h.categories.includes(c.id)).length])),
    }
  }, [data])

  return (
    <>
      <Hero />  {/* Removed SearchBox from here - Home has no general search */}

      <PlatformsStrip />

      <section className="container-page py-20 sm:py-24">
        <SectionHeader title="Popular categories" description="Start from the kind of thing you want to build." to="/explore" linkLabel="Browse all" />
        <StaggerGrid inView className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((c) => (
            <CategoryCard key={c.id} category={c} count={data ? counts[c.id] : undefined} />
          ))}
        </StaggerGrid>
      </section>

      <section className="container-page pb-20 sm:pb-24">
        <SectionHeader title="Trending hackathons" description="Events people are saving and sharing right now." to="/explore" />
        {error ? (
          <ErrorState onRetry={reload} />
        ) : loading ? (
          <CardGridSkeleton count={3} className="grid gap-4 md:grid-cols-2 lg:grid-cols-3" />
        ) : (
          <StaggerGrid className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {trending.map((h) => (
              <HackathonCard key={h.id} hackathon={h} />
            ))}
          </StaggerGrid>
        )}
      </section>

      <section className="border-y border-line bg-surface/40">
        <div className="container-page py-20 sm:py-24">
          <SectionHeader title="Starting soon" description="Registration is open for these. Deadlines come quickly." to="/explore" />
          {loading ? (
            <div className="space-y-4" role="status" aria-label="Loading">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="skeleton h-16 w-full rounded-lg" />
              ))}
            </div>
          ) : (
            <StaggerGrid as="ul" inView className="rounded-xl border border-line bg-surface px-2 sm:px-3">
              {soon.map((h) => (
                <CompactRow key={h.id} hackathon={h} />
              ))}
            </StaggerGrid>
          )}
          <div className="mt-6 sm:hidden">
            <Link to="/explore" className="inline-flex items-center gap-1.5 text-sm font-medium text-accent">
              View all hackathons <ArrowRight size={16} aria-hidden />
            </Link>
          </div>
        </div>
      </section>

      <WhySection />
      <CtaSection />
    </>
  )
}
