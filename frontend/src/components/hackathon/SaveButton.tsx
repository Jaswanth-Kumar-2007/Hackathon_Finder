import { AnimatePresence, motion } from 'framer-motion'
import { Bookmark, BookmarkCheck } from 'lucide-react'
import { useSaved } from '../../context/SavedContext'
import { cn } from '../../utils/format'

interface Props {
  id: string
  title: string
  /** "icon" is the compact card button, "full" is the labelled button used on details pages */
  variant?: 'icon' | 'full'
  className?: string
}

export function SaveButton({ id, title, variant = 'icon', className }: Props) {
  const { isSaved, toggle } = useSaved()
  const saved = isSaved(id)

  const icon = (
    <span className="relative grid h-5 w-5 place-items-center">
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={saved ? 'on' : 'off'}
          initial={{ scale: 0.4, rotate: -20, opacity: 0 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          exit={{ scale: 0.4, opacity: 0, transition: { duration: 0.1 } }}
          transition={{ type: 'spring', stiffness: 520, damping: 22 }}
          className="absolute"
        >
          {saved ? <BookmarkCheck size={18} aria-hidden /> : <Bookmark size={18} aria-hidden />}
        </motion.span>
      </AnimatePresence>
      {saved && (
        <motion.span
          key="ring"
          initial={{ scale: 0.6, opacity: 0.7 }}
          animate={{ scale: 2, opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="pointer-events-none absolute h-5 w-5 rounded-full border border-accent"
          aria-hidden
        />
      )}
    </span>
  )

  if (variant === 'full') {
    return (
      <button
        type="button"
        onClick={() => toggle(id)}
        aria-pressed={saved}
        className={cn(
          'inline-flex h-11 items-center justify-center gap-2 rounded-lg border px-4 text-[15px] font-medium transition-all duration-150 active:scale-[0.97]',
          saved
            ? 'border-accent/50 bg-accent-soft text-accent'
            : 'border-line-strong bg-raised text-ink hover:border-accent/60',
          className,
        )}
      >
        {icon}
        {saved ? 'Saved' : 'Save hackathon'}
      </button>
    )
  }

  return (
    <motion.button
      type="button"
      onClick={() => toggle(id)}
      aria-pressed={saved}
      aria-label={saved ? `Remove ${title} from saved` : `Save ${title}`}
      whileTap={{ scale: 0.88 }}
      className={cn(
        'relative z-10 grid h-9 w-9 place-items-center rounded-lg border transition-colors duration-150',
        saved
          ? 'border-accent/40 bg-accent-soft text-accent'
          : 'border-transparent text-faint hover:border-line-strong hover:bg-raised hover:text-ink',
        className,
      )}
    >
      {icon}
    </motion.button>
  )
}
