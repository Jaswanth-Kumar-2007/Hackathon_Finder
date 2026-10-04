import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Search, Tag, TrendingUp } from 'lucide-react'
import { modalPanel, overlay } from '../../animations/variants'
import { categories, popularSearches } from '../../data/categories'
import { useEscape } from '../../hooks/useEscape'
import { useLockBody } from '../../hooks/useLockBody'
import { cn } from '../../utils/format'

interface Item {
  key: string
  label: string
  hint: string
  icon: typeof Search
  go: () => void
}

export function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  useLockBody(open)
  useEscape(open, onClose)

  useEffect(() => {
    if (open) {
      setQuery('')
      setActive(0)
      // wait for the panel to mount
      const t = window.setTimeout(() => inputRef.current?.focus(), 30)
      return () => window.clearTimeout(t)
    }
  }, [open])

  const items = useMemo<Item[]>(() => {
    const q = query.trim()
    const run = (path: string) => () => {
      onClose()
      navigate(path)
    }
    const list: Item[] = []
    if (q) {
      list.push({
        key: 'search',
        label: `Search for “${q}”`,
        hint: 'Search all hackathons',
        icon: Search,
        go: run(`/explore?q=${encodeURIComponent(q)}`),
      })
    }
    const needle = q.toLowerCase()
    popularSearches
      .filter((p) => !needle || p.label.toLowerCase().includes(needle))
      .forEach((p) =>
        list.push({ key: `p-${p.label}`, label: p.label, hint: 'Popular search', icon: TrendingUp, go: run(`/explore?q=${encodeURIComponent(p.query)}`) }),
      )
    categories
      .filter((c) => !needle || c.name.toLowerCase().includes(needle))
      .forEach((c) =>
        list.push({ key: `c-${c.id}`, label: c.name, hint: 'Category', icon: Tag, go: run(`/explore?category=${c.id}`) }),
      )
    return list.slice(0, 9)
  }, [query, navigate, onClose])

  useEffect(() => setActive(0), [query])

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive((a) => (a + 1) % Math.max(items.length, 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((a) => (a - 1 + items.length) % Math.max(items.length, 1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      items[active]?.go()
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[60] flex items-start justify-center px-4 pt-[12vh]" onKeyDown={onKeyDown}>
          <motion.div
            variants={overlay}
            initial="hidden"
            animate="show"
            exit="exit"
            className="absolute inset-0 bg-canvas/80 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden
          />
          <motion.div
            variants={modalPanel}
            initial="hidden"
            animate="show"
            exit="exit"
            role="dialog"
            aria-modal="true"
            aria-label="Search hackathons"
            className="relative w-full max-w-xl overflow-hidden rounded-xl border border-line-strong bg-surface shadow-pop"
          >
            <div className="flex items-center gap-3 border-b border-line px-4">
              <Search size={18} className="text-faint" aria-hidden />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search hackathons, topics, categories"
                aria-label="Search"
                className="h-14 flex-1 bg-transparent text-base text-ink placeholder:text-faint focus:outline-none"
              />
              <kbd className="kbd">Esc</kbd>
            </div>
            <ul className="max-h-80 overflow-y-auto p-2" role="listbox">
              {items.map((item, i) => (
                <li key={item.key} role="option" aria-selected={i === active}>
                  <button
                    type="button"
                    onMouseEnter={() => setActive(i)}
                    onClick={item.go}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors',
                      i === active ? 'bg-raised text-ink' : 'text-muted',
                    )}
                  >
                    <item.icon size={16} className={i === active ? 'text-accent' : 'text-faint'} aria-hidden />
                    <span className="flex-1 truncate text-[15px]">{item.label}</span>
                    <span className="text-xs text-faint">{item.hint}</span>
                  </button>
                </li>
              ))}
              {items.length === 0 && <li className="px-3 py-6 text-center text-sm text-muted">No suggestions.</li>}
            </ul>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
