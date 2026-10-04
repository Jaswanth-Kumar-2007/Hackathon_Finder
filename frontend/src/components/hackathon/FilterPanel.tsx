import { useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, ChevronDown } from 'lucide-react'
import { categories } from '../../data/categories'
import type { DateFilter, Eligibility, Filters, Mode, Platform, PrizeFilter } from '../../types'
import { countActiveFilters } from '../../utils/search'
import { cn } from '../../utils/format'

const modes: Mode[] = ['Online', 'Offline', 'Hybrid']
const platforms: Platform[] = ['Devpost', 'HackerEarth', 'Unstop', 'Devfolio', 'MLH']
const eligibilities: Eligibility[] = ['Students', 'Beginners', 'Open to all']
const dates: Array<{ value: DateFilter; label: string }> = [
  { value: 'any', label: 'Any time' },
  { value: 'soon', label: 'Starting soon' },
  { value: 'week', label: 'This week' },
  { value: 'month', label: 'This month' },
]
const prizes: Array<{ value: PrizeFilter; label: string }> = [
  { value: 'any', label: 'Any prize' },
  { value: '1000', label: '$1,000+' },
  { value: '5000', label: '$5,000+' },
  { value: '10000', label: '$10,000+' },
  { value: '20000', label: '$20,000+' },
]

export const dateLabel = (v: DateFilter) => dates.find((d) => d.value === v)?.label ?? ''
export const prizeLabel = (v: PrizeFilter) => prizes.find((p) => p.value === v)?.label ?? ''

function Section({ title, children, defaultOpen = true }: { title: string; children: ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border-b border-line py-4 last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between py-1 text-left text-sm font-semibold"
      >
        {title}
        <ChevronDown size={16} className={cn('text-faint transition-transform duration-200', open && 'rotate-180')} aria-hidden />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="space-y-0.5 pt-2">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function Option({
  type,
  name,
  checked,
  onChange,
  label,
}: {
  type: 'checkbox' | 'radio'
  name: string
  checked: boolean
  onChange: () => void
  label: string
}) {
  return (
    <label className="group flex min-h-[40px] cursor-pointer items-center gap-3 rounded-md px-1.5 py-1.5 text-sm text-muted transition-colors hover:bg-raised hover:text-ink">
      <input type={type} name={name} checked={checked} onChange={onChange} className="peer sr-only" />
      <span
        className={cn(
          'grid h-[18px] w-[18px] shrink-0 place-items-center border transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-accent/60',
          type === 'radio' ? 'rounded-full' : 'rounded-[5px]',
          checked ? 'border-accent-strong bg-accent-strong text-white' : 'border-line-strong bg-canvas group-hover:border-accent/60',
        )}
        aria-hidden
      >
        <AnimatePresence initial={false}>
          {checked && (
            <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} transition={{ duration: 0.12 }}>
              {type === 'radio' ? <span className="block h-1.5 w-1.5 rounded-full bg-white" /> : <Check size={12} strokeWidth={3} />}
            </motion.span>
          )}
        </AnimatePresence>
      </span>
      <span className={cn(checked && 'text-ink')}>{label}</span>
    </label>
  )
}

function toggle<T>(list: T[], item: T): T[] {
  return list.includes(item) ? list.filter((x) => x !== item) : [...list, item]
}

export function FilterPanel({
  filters,
  onChange,
  onClear,
}: {
  filters: Filters
  onChange: (f: Filters) => void
  onClear: () => void
}) {
  const active = countActiveFilters(filters)
  return (
    <div>
      <div className="flex items-center justify-between pb-2">
        <h2 className="text-[15px] font-semibold">Filters</h2>
        <button
          type="button"
          onClick={onClear}
          disabled={active === 0}
          className="text-sm text-accent transition-opacity hover:underline disabled:pointer-events-none disabled:opacity-40"
        >
          Clear all
        </button>
      </div>

      <Section title="Mode">
        {modes.map((m) => (
          <Option key={m} type="checkbox" name="mode" label={m} checked={filters.mode.includes(m)} onChange={() => onChange({ ...filters, mode: toggle(filters.mode, m) })} />
        ))}
      </Section>
      <Section title="Platform">
        {platforms.map((p) => (
          <Option key={p} type="checkbox" name="platform" label={p} checked={filters.platform.includes(p)} onChange={() => onChange({ ...filters, platform: toggle(filters.platform, p) })} />
        ))}
      </Section>
      <Section title="Category">
        {categories.map((c) => (
          <Option key={c.id} type="checkbox" name="category" label={c.name} checked={filters.category.includes(c.id)} onChange={() => onChange({ ...filters, category: toggle(filters.category, c.id) })} />
        ))}
      </Section>
      <Section title="Eligibility">
        {eligibilities.map((e) => (
          <Option key={e} type="checkbox" name="eligibility" label={e} checked={filters.eligibility.includes(e)} onChange={() => onChange({ ...filters, eligibility: toggle(filters.eligibility, e) })} />
        ))}
      </Section>
      <Section title="Start date">
        {dates.map((d) => (
          <Option key={d.value} type="radio" name="date" label={d.label} checked={filters.date === d.value} onChange={() => onChange({ ...filters, date: d.value })} />
        ))}
      </Section>
      <Section title="Prize" defaultOpen={false}>
        {prizes.map((p) => (
          <Option key={p.value} type="radio" name="prize" label={p.label} checked={filters.prize === p.value} onChange={() => onChange({ ...filters, prize: p.value })} />
        ))}
      </Section>
    </div>
  )
}
