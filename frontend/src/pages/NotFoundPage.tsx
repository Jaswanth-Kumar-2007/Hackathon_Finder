import { Compass } from 'lucide-react'
import { ButtonLink } from '../components/ui/Button'
import { EmptyState } from '../components/ui/States'

export function NotFoundPage() {
  return (
    <div className="container-page pb-24 pt-36">
      <EmptyState
        icon={Compass}
        title="Page not found."
        description="The page you are looking for does not exist or has moved."
        action={<ButtonLink to="/">Back to home</ButtonLink>}
      />
    </div>
  )
}
