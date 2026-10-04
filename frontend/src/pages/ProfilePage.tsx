import { useMemo, useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Clock, User as UserIcon } from 'lucide-react'
import { fadeUp, staggerContainer } from '../animations/variants'
import { useAuth } from '../context/AuthContext'
import { useSaved } from '../context/SavedContext'
import { useAsync } from '../hooks/useAsync'
import { hackathonApi, viewedApi } from '../services/api'
import { initials } from '../utils/format'
import { CompactRow } from '../components/hackathon/CompactRow'
import { HackathonCard } from '../components/hackathon/HackathonCard'
import { StaggerGrid } from '../components/hackathon/StaggerGrid'
import { ButtonLink } from '../components/ui/Button'
import { Counter } from '../components/ui/Counter'
import { ProfileSkeleton } from '../components/ui/Skeletons'
import { EmptyState, ErrorState } from '../components/ui/States'

const ALLOWED_INTERESTS = [
  'AI / ML',
  'Web Development',
  'Mobile Development',
  'Cloud',
  'Cybersecurity',
  'Blockchain',
  'Data Science',
  'Open Source',
  'IoT',
  'Game Development',
]

// Placeholder until your backend tracks participation history.
const MOCK_COMPLETED = 3

export function ProfilePage() {
  const { user } = useAuth()
  const { savedIds } = useSaved()
  const [interests, setInterests] = useState<string[]>([])
  const [viewedIds, setViewedIds] = useState<string[]>([])
  const { data, loading, error, reload } = useAsync(() => hackathonApi.list(), [])

  const { saved, upcoming, recent } = useMemo(() => {
    const all = data ?? []
    const savedItems = savedIds.map((id) => all.find((h) => h.id === id)).filter((h): h is NonNullable<typeof h> => Boolean(h))
    return {
      saved: savedItems,
      upcoming: savedItems.filter((h) => new Date(h.startDate).getTime() > Date.now()).length,
      recent: viewedIds.map((id) => all.find((h) => h.id === id)).filter((h): h is NonNullable<typeof h> => Boolean(h)),
    }
  }, [data, savedIds, viewedIds])

  // Load user interests on mount when user changes
  useEffect(() => {
    if (user?.email) {
      fetch('/users/me', {
        headers: {
          'Content-Type': 'application/json',
        },
      }).then(async (res) => {
        if (res.ok) {
          const userData = await res.json()
          setInterests(userData.interests || [])
        }
      })
    }
  }, [user?.email])

  // Fetch viewed hackathons on mount
  useEffect(() => {
    const loadViewed = async () => {
      const result = await viewedApi.list()
      setViewedIds(result)
    }
    loadViewed()
  }, [])

  if (!user) {
    return (
      <div className="container-page pb-24 pt-32">
        <EmptyState
          icon={UserIcon}
          title="You're not logged in."
          description="Login to see your profile, saved hackathons and recent activity."
          action={
            <div className="flex gap-3">
              <ButtonLink to="/login">Login</ButtonLink>
              <ButtonLink to="/register" variant="secondary">
                Register
              </ButtonLink>
            </div>
          }
        />
      </div>
    )
  }

  const stats = [
    { label: 'Saved hackathons', value: savedIds.length },
    { label: 'Upcoming', value: upcoming },
    { label: 'Completed', value: MOCK_COMPLETED },
  ]

  return (
    <div className="container-page pb-24 pt-28 sm:pt-32">
      {loading ? (
        <ProfileSkeleton />
      ) : error ? (
        <ErrorState onRetry={reload} />
      ) : (
        <>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-5">
            <span className="grid h-20 w-20 shrink-0 place-items-center rounded-full bg-accent-strong text-2xl font-semibold text-white shadow-lift">
              {initials(user.name ? user.name : user.username ? user.username : 'U')}
            </span>
            <div className="min-w-0">
              <h1 className="truncate text-2xl font-semibold sm:text-3xl">{user.name}</h1>
              <p className="mt-1 truncate text-[15px] text-muted">{user.email}</p>
              {user.username && <p className="mt-0.5 font-mono text-sm text-faint">@{user.username}</p>}
            </div>
          </motion.div>

          <motion.dl variants={staggerContainer(0.08)} initial="hidden" animate="show" className="mt-10 grid gap-4 sm:grid-cols-3">
            {stats.map((s) => (
              <motion.div key={s.label} variants={fadeUp} className="surface p-5">
                <dd className="font-mono text-4xl font-medium">
                  <Counter to={s.value} />
                </dd>
                <dt className="mt-1.5 text-sm text-muted">{s.label}</dt>
              </motion.div>
            ))}
          </motion.dl>

          <section className="mt-14">
            <h2 className="mb-6 text-xl font-semibold">Your interests</h2>
            <p className="text-sm text-muted mb-3">Selected interests:</p>
            <div className="grid grid-cols-2 gap-2">
              {interests.map((interest) => (
                <span
                  key={interest}
                  className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-accent-strong bg-accent-strong/10"
                >
                  {interest}
                </span>
              ))}
              {ALLOWED_INTERESTS.filter((i) => !interests.includes(i)).map((interest) => (
                <span
                  key={interest}
                  className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-muted cursor-pointer hover:text-accent-strong hover:bg-accent-strong/10 transition-colors"
                  onClick={() => setInterests((prev) => [...prev, interest])}
                >
                  +{interest}
                </span>
              ))}
            </div>
          </section>

          <section className="mt-14">
            <div className="mb-6 flex items-end justify-between">
              <h2 className="text-xl font-semibold">Saved hackathons</h2>
              {saved.length > 0 && (
                <Link to="/saved" className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-ink">
                  View all <ArrowRight size={15} aria-hidden />
                </Link>
              )}
              {saved.length === 0 ? (
                <p className="surface px-5 py-8 text-center text-sm text-muted">No saved hackathons yet.</p>
              ) : (
                <StaggerGrid className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {saved.slice(0, 3).map((h) => (
                    <HackathonCard key={h.id} hackathon={h} />
                  ))}
                </StaggerGrid>
              )}
            </div>
          </section>

          <section className="mt-14">
            <h2 className="mb-6 text-xl font-semibold">Recently viewed</h2>
            {recent.length === 0 ? (
              <p className="surface flex items-center justify-center gap-2 px-5 py-8 text-sm text-muted">
                <Clock size={16} aria-hidden /> Hackathons you open will show up here.
              </p>
            ) : (
              <StaggerGrid as="ul" className="rounded-xl border border-line bg-surface px-2 sm:px-3">
                {recent.slice(0, 5).map((h) => (
                  <CompactRow key={h.id} hackathon={h} />
                ))}
              </StaggerGrid>
            )}
          </section>
        </>
      )}
    </div>
  )
}