export function HackathonCardSkeleton() {
  return (
    <div className="surface p-5" aria-hidden>
      <div className="flex items-center justify-between">
        <div className="skeleton h-4 w-24" />
        <div className="skeleton h-9 w-9 rounded-lg" />
      </div>
      <div className="skeleton mt-5 h-5 w-4/5" />
      <div className="skeleton mt-3 h-3.5 w-full" />
      <div className="skeleton mt-2 h-3.5 w-3/5" />
      <div className="mt-5 flex gap-2">
        <div className="skeleton h-6 w-16" />
        <div className="skeleton h-6 w-32" />
      </div>
      <div className="mt-5 flex items-center justify-between border-t border-line pt-4">
        <div className="skeleton h-5 w-16" />
        <div className="skeleton h-4 w-24" />
      </div>
    </div>
  )
}

export function CardGridSkeleton({ count = 6, className = 'grid gap-4 sm:grid-cols-2 xl:grid-cols-3' }: { count?: number; className?: string }) {
  return (
    <div className={className} role="status" aria-label="Loading hackathons">
      {Array.from({ length: count }).map((_, i) => (
        <HackathonCardSkeleton key={i} />
      ))}
    </div>
  )
}

export function DetailsSkeleton() {
  return (
    <div className="container-page pb-20 pt-28" role="status" aria-label="Loading hackathon">
      <div className="skeleton h-4 w-28" />
      <div className="skeleton mt-8 h-4 w-24" />
      <div className="skeleton mt-4 h-10 w-3/4 max-w-xl" />
      <div className="skeleton mt-4 h-4 w-48" />
      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <div className="skeleton h-40 w-full rounded-xl" />
          <div className="skeleton h-56 w-full rounded-xl" />
        </div>
        <div className="skeleton h-72 w-full rounded-xl" />
      </div>
    </div>
  )
}

export function ProfileSkeleton() {
  return (
    <div role="status" aria-label="Loading profile">
      <div className="flex items-center gap-5">
        <div className="skeleton h-20 w-20 rounded-full" />
        <div className="space-y-3">
          <div className="skeleton h-6 w-48" />
          <div className="skeleton h-4 w-56" />
        </div>
      </div>
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="skeleton h-24 rounded-xl" />
        ))}
      </div>
      <CardGridSkeleton count={3} className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3" />
    </div>
  )
}
