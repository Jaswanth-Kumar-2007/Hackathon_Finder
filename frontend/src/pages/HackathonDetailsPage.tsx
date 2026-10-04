import { useEffect, type ReactNode } from 'react'
import { Link, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, ExternalLink, MapPin, SearchX, Trophy, Users, Globe, GraduationCap } from 'lucide-react'
import { categoryById } from '../data/categories'
import { fadeUp, staggerContainer } from '../animations/variants'
import { useAsync } from '../hooks/useAsync'
import { hackathonApi, viewedApi } from '../services/api'
import { formatRange, getStatus, registrationLabel } from '../utils/date'
import { DateTimeline } from '../components/hackathon/DateTimeline'
import { HackathonCard } from '../components/hackathon/HackathonCard'
import { SaveButton } from '../components/hackathon/SaveButton'
import { StaggerGrid } from '../components/hackathon/StaggerGrid'
import { ModeBadge, PlatformBadge, StatusText, Chip } from '../components/ui/Badges'
import { ButtonAnchor, ButtonLink } from '../components/ui/Button'
import { DetailsSkeleton } from '../components/ui/Skeletons'
import { EmptyState, ErrorState } from '../components/ui/States'

function Card({ title, children }: { title: string; children: ReactNode }) {
  return (
    <motion.section variants={fadeUp} className="surface p-5 sm:p-6">
      <h2 className="mb-4 text-lg font-semibold">{title}</h2>
      {children}
    </motion.section>
  )
}

export function HackathonDetailsPage() {
  const { id = '' } = useParams()
  const { data: h, loading, error, reload } = useAsync(() => hackathonApi.getById(id), [id])
  const all = useAsync(() => hackathonApi.list(), [])

  useEffect(() => {
    if (h) viewedApi.add(h.id)
  }, [h])

  if (loading) return <DetailsSkeleton />
  if (error)
    return (
      <div className="container-page pb-20 pt-32">
        <ErrorState onRetry={reload} />
      </div>
    )
  if (!h)
    return (
      <div className="container-page pb-20 pt-32">
        <EmptyState
          icon={SearchX}
          title="Hackathon not found."
          description="It may have been removed, or the link is incorrect."
          action={<ButtonLink to="/explore">Explore hackathons</ButtonLink>}
        />
      </div>
    )

  const status = getStatus(h)
  const related = (all.data ?? []).filter((x) => x.id !== h.id && x.categories.some((c) => h.categories.includes(c))).slice(0, 3)

  const facts = [
    { icon: Globe, label: 'Mode', value: <ModeBadge mode={h.mode} /> },
    { icon: MapPin, label: 'Location', value: h.location },
    { icon: Users, label: 'Team size', value: h.teamSize.min === h.teamSize.max ? `${h.teamSize.min} ${h.teamSize.min === 1 ? 'person' : 'people'}` : `${h.teamSize.min}–${h.teamSize.max} people` },
    { icon: GraduationCap, label: 'Eligibility', value: h.eligibility.join(', ') },
  ]

  return (
    <div className="container-page pb-24 pt-28 sm:pt-32">
      <Link to="/explore" className="mb-8 inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-ink">
        <ArrowLeft size={15} aria-hidden /> Back to explore
      </Link>

      <motion.header initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <PlatformBadge platform={h.platform} />
          <span className="text-[13px] text-faint">Organized by {h.organizer}</span>
        </div>
        <h1 className="mt-4 text-3xl font-semibold leading-tight sm:text-5xl">{h.title}</h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">{h.description}</p>
        <div className="mt-5 flex items-center gap-4">
          <StatusText status={status} />
          <span className="text-sm text-faint">{formatRange(h.startDate, h.endDate)}</span>
        </div>
      </motion.header>

      <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-10">
        <aside className="order-first lg:order-none lg:col-start-2 lg:row-start-1">
          <div className="surface p-5 lg:sticky lg:top-24">
            <p className="text-sm text-muted">Prize pool</p>
            <p className="mt-1 flex items-center gap-2 font-mono text-4xl font-medium">
              <Trophy size={26} className="text-amber" aria-hidden />
              {h.prizeLabel}
            </p>
            <p className="mt-4 rounded-lg border border-line bg-canvas px-3.5 py-3 text-sm text-muted">{registrationLabel(h)}</p>
            <div className="mt-5 grid gap-3">
              <ButtonAnchor href={h.url} target="_blank" rel="noreferrer noopener" size="lg">
                Visit official hackathon <ExternalLink size={17} aria-hidden />
              </ButtonAnchor>
              <SaveButton id={h.id} title={h.title} variant="full" className="w-full !h-12" />
            </div>
            <p className="mt-4 text-xs leading-relaxed text-faint">You will be taken to {h.platform} to register. Always confirm the details on the official page.</p>
          </div>
        </aside>

        <motion.div variants={staggerContainer(0.08)} initial="hidden" animate="show" className="space-y-6 lg:col-start-1 lg:row-start-1">
          <motion.section variants={fadeUp} className="surface">
            <dl className="grid divide-y divide-line sm:grid-cols-2 sm:divide-y-0">
              {facts.map((f, i) => (
                <div key={f.label} className={`flex items-start gap-3.5 p-5 ${i % 2 === 0 ? 'sm:border-r sm:border-line' : ''} ${i > 1 ? 'sm:border-t sm:border-line' : ''}`}>
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-line bg-raised text-muted">
                    <f.icon size={17} aria-hidden />
                  </span>
                  <div className="min-w-0">
                    <dt className="text-sm text-faint">{f.label}</dt>
                    <dd className="mt-1 text-[15px] font-medium">{f.value}</dd>
                  </div>
                </div>
              ))}
            </dl>
          </motion.section>

          <Card title="Important dates">
            <DateTimeline hackathon={h} />
          </Card>

          <Card title="About this hackathon">
            <div className="max-w-prose space-y-4 text-[15px] leading-relaxed text-muted">
              {h.longDescription.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </Card>

          <Card title="Categories and technologies">
            <div className="space-y-5">
              <div>
                <h3 className="mb-2.5 text-sm text-faint">Categories</h3>
                <div className="flex flex-wrap gap-2">
                  {h.categories.map((c) => (
                    <Link key={c} to={`/explore?category=${c}`} className="rounded-md border border-accent/30 bg-accent-soft px-2.5 py-1 text-[13px] text-accent transition-colors hover:border-accent/60">
                      {categoryById(c)?.name ?? c}
                    </Link>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="mb-2.5 text-sm text-faint">Technologies</h3>
                <div className="flex flex-wrap gap-2">
                  {h.technologies.map((t) => (
                    <Chip key={t}>{t}</Chip>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {related.length > 0 && (
        <section className="mt-20">
          <h2 className="mb-6 text-2xl font-semibold">Similar hackathons</h2>
          <StaggerGrid inView className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {related.map((r) => (
              <HackathonCard key={r.id} hackathon={r} />
            ))}
          </StaggerGrid>
        </section>
      )}
    </div>
  )
}
