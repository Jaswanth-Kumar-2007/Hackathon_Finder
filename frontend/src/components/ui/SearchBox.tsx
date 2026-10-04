import { useState, type FormEvent } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Search } from 'lucide-react'
import { isMac } from '../../hooks/usePlatform'
import { cn } from '../../utils/format'

interface Props {
  defaultValue?: string
  size?: 'lg' | 'md'
  placeholder?: string
  /** Marks the input so the global Ctrl/⌘ K shortcut focuses it instead of opening the palette. */
  heroTarget?: boolean
  onSearch: (query: string) => void
  className?: string
}

export function SearchBox({
  defaultValue = '',
  size = 'lg',
  placeholder = 'Search for AI, Web, ML, Blockchain hackathons...',
  heroTarget,
  onSearch,
  className,
}: Props) {
  const [value, setValue] = useState(defaultValue)
  const [focused, setFocused] = useState(false)

  const submit = (e: FormEvent) => {
    e.preventDefault()
    onSearch(value.trim())
  }

  return (
    <form onSubmit={submit} role="search" className={className}>
      <motion.div
        animate={{
          boxShadow: focused
            ? '0 0 0 1px rgba(123,140,255,0.9), 0 0 0 6px rgba(123,140,255,0.14), 0 18px 50px -20px rgba(91,109,255,0.55)'
            : '0 0 0 1px rgba(54,66,111,1), 0 12px 40px -24px rgba(0,0,0,0.8)',
          scale: focused && size === 'lg' ? 1.008 : 1,
        }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        className={cn(
          'flex items-center gap-3 rounded-xl bg-surface',
          size === 'lg' ? 'h-14 pl-4 pr-2 sm:h-16 sm:pl-5' : 'h-11 pl-3.5 pr-1.5',
        )}
      >
        <Search size={size === 'lg' ? 20 : 17} className={cn('shrink-0 transition-colors', focused ? 'text-accent' : 'text-faint')} aria-hidden />
        <label htmlFor={heroTarget ? 'hero-search' : undefined} className="sr-only">
          Search hackathons
        </label>
        <input
          id={heroTarget ? 'hero-search' : undefined}
          data-hero-search={heroTarget ? '' : undefined}
          type="search"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          autoComplete="off"
          className={cn(
            'min-w-0 flex-1 bg-transparent text-ink placeholder:text-faint focus:outline-none [&::-webkit-search-cancel-button]:hidden',
            size === 'lg' ? 'text-base sm:text-lg' : 'text-[15px]',
          )}
        />
        {size === 'lg' && (
          <span className="mr-1 hidden items-center gap-1 sm:flex" aria-hidden>
            <kbd className="kbd">{isMac() ? '⌘' : 'Ctrl'}</kbd>
            <kbd className="kbd">K</kbd>
          </span>
        )}
        <button
          type="submit"
          className={cn(
            'grid shrink-0 place-items-center rounded-lg bg-accent-strong text-white transition-all duration-150 hover:bg-[#6C7CFF] active:scale-95',
            size === 'lg' ? 'h-11 w-11 sm:h-12 sm:w-12' : 'h-8 w-8',
          )}
          aria-label="Search"
        >
          <ArrowRight size={size === 'lg' ? 20 : 16} aria-hidden />
        </button>
      </motion.div>
    </form>
  )
}
