import { AnimatePresence, motion } from 'framer-motion'
import { Bookmark } from 'lucide-react'
import { staggerContainer } from '../animations/variants'
import { useSaved } from '../context/SavedContext'
import { useAsync } from '../hooks/useAsync'
import { hackathonApi } from '../services/api'
import { HackathonCard } from '../components/hackathon/HackathonCard'
import { ButtonLink } from '../components/ui/Button'
import { CardGridSkeleton } from '../components/ui/Skeletons'
import { EmptyState, ErrorState } from '../components/ui/States'

export function SavedPage() {
  const { savedIds } = useSaved()
  // Fetch once, then derive the saved list locally so unsaving animates instead of refetching.
  const { data, loading, error, reload } = useAsync(() => hackathonApi.list(), [])
  const items = savedIds.map((id) => data?.find((h) => h.id === id)).filter((h): h is NonNullable<typeof h> => Boolean(h))

  return (
    <div className="container-page pb-24 pt-28 sm:pt-32">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-semibold sm:text-4xl">Saved hackathons</h1>
        <p className="mt-3 text-[15px] text-muted">
          {savedIds.length > 0 ? `${savedIds.length} saved ${savedIds.length === 1 ? 'hackathon' : 'hackathons'}` : 'Your shortlist lives here.'}
        </p>
      </motion.div>

      <div className="mt-10">
        {savedIds.length === 0 ? (
          <EmptyState
            icon={Bookmark}
            title="No saved hackathons yet."
            description="Save hackathons you're interested in and we'll keep them here."
            action={<ButtonLink to="/explore">Explore hackathons</ButtonLink>}
          />
        ) : error ? (
          <ErrorState onRetry={reload} />
        ) : loading ? (
          <CardGridSkeleton count={Math.min(savedIds.length, 6)} className="grid gap-4 md:grid-cols-2 lg:grid-cols-3" />
        ) : (
          <motion.div variants={staggerContainer(0.06)} initial="hidden" animate="show" className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence mode="popLayout" initial={false}>
              {items.map((h) => (
                <HackathonCard key={h.id} hackathon={h} />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  )
}
