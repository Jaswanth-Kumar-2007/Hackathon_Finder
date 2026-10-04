import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, RotateCcw, type LucideIcon } from 'lucide-react'
import { Button } from './Button'

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon
  title: string
  description: string
  action?: ReactNode
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center rounded-xl border border-dashed border-line-strong px-6 py-16 text-center"
    >
      <div className="mb-5 grid h-12 w-12 place-items-center rounded-xl border border-line bg-raised text-accent">
        <Icon size={22} aria-hidden />
      </div>
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="mt-1.5 max-w-sm text-sm text-muted">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </motion.div>
  )
}

export function ErrorState({
  title = 'Something went wrong.',
  message = 'Please try again.',
  onRetry,
}: {
  title?: string
  message?: string
  onRetry?: () => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center rounded-xl border border-rose/25 bg-rose/[0.04] px-6 py-14 text-center"
      role="alert"
    >
      <div className="mb-5 grid h-12 w-12 place-items-center rounded-xl border border-rose/30 bg-rose/10 text-rose">
        <AlertTriangle size={22} aria-hidden />
      </div>
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="mt-1.5 max-w-sm text-sm text-muted">{message}</p>
      {onRetry && (
        <Button variant="secondary" className="mt-6" onClick={onRetry}>
          <RotateCcw size={16} aria-hidden /> Try again
        </Button>
      )}
    </motion.div>
  )
}
