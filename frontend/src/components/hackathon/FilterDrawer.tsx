import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import type { Filters } from '../../types'
import { drawerBottom, overlay } from '../../animations/variants'
import { useEscape } from '../../hooks/useEscape'
import { useLockBody } from '../../hooks/useLockBody'
import { Button } from '../ui/Button'
import { FilterPanel } from './FilterPanel'

/** Mobile/tablet bottom sheet wrapping the same FilterPanel used in the desktop sidebar. */
export function FilterDrawer({
  open,
  onClose,
  filters,
  onChange,
  onClear,
  resultCount,
}: {
  open: boolean
  onClose: () => void
  filters: Filters
  onChange: (f: Filters) => void
  onClear: () => void
  resultCount: number | null
}) {
  useLockBody(open)
  useEscape(open, onClose)

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[58] lg:hidden">
          <motion.div variants={overlay} initial="hidden" animate="show" exit="exit" className="absolute inset-0 bg-canvas/80 backdrop-blur-sm" onClick={onClose} aria-hidden />
          <motion.div
            variants={drawerBottom}
            initial="hidden"
            animate="show"
            exit="exit"
            role="dialog"
            aria-modal="true"
            aria-label="Filters"
            className="absolute inset-x-0 bottom-0 flex max-h-[88vh] flex-col rounded-t-2xl border-t border-line-strong bg-surface"
          >
            <div className="mx-auto mt-2.5 h-1 w-10 rounded-full bg-line-strong" aria-hidden />
            <div className="flex items-center justify-between px-5 pb-1 pt-3">
              <span className="text-base font-semibold">Filter hackathons</span>
              <button onClick={onClose} aria-label="Close filters" className="grid h-10 w-10 place-items-center rounded-lg text-muted hover:bg-raised hover:text-ink">
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 pb-4">
              <FilterPanel filters={filters} onChange={onChange} onClear={onClear} />
            </div>
            <div className="border-t border-line p-4">
              <Button size="lg" className="w-full" onClick={onClose}>
                {resultCount === null ? 'Show results' : `Show ${resultCount} ${resultCount === 1 ? 'result' : 'results'}`}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
