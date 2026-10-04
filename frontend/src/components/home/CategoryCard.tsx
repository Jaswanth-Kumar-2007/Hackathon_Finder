import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowUpRight, Blocks, Brain, Cloud, Code, Database, GitBranch, Shield, Smartphone, type LucideIcon } from 'lucide-react'
import type { Category } from '../../types'
import { fadeUp } from '../../animations/variants'

const icons: Record<Category['icon'], LucideIcon> = {
  brain: Brain,
  code: Code,
  shield: Shield,
  blocks: Blocks,
  cloud: Cloud,
  git: GitBranch,
  database: Database,
  phone: Smartphone,
}

export function CategoryCard({ category, count }: { category: Category; count?: number }) {
  const Icon = icons[category.icon]
  return (
    <motion.div variants={fadeUp} whileHover={{ y: -3 }} transition={{ type: 'spring', stiffness: 380, damping: 30 }}>
      <Link
        to={`/explore?category=${category.id}`}
        className="group relative flex h-full flex-col rounded-xl border border-line bg-surface p-5 shadow-card transition-[border-color,box-shadow] duration-200 hover:border-accent/50 hover:shadow-lift"
      >
        <div className="flex items-start justify-between">
          <span className="grid h-10 w-10 place-items-center rounded-lg border border-line bg-raised text-muted transition-colors duration-200 group-hover:border-accent/40 group-hover:bg-accent-soft group-hover:text-accent">
            <Icon size={20} aria-hidden />
          </span>
          <ArrowUpRight
            size={18}
            aria-hidden
            className="text-faint opacity-0 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent group-hover:opacity-100"
          />
        </div>
        <h3 className="mt-5 text-[15px] font-semibold">{category.name}</h3>
        <p className="mt-1.5 text-sm leading-relaxed text-muted">{category.description}</p>
        {count !== undefined && (
          <p className="mt-4 font-mono text-xs text-faint">
            {count} open {count === 1 ? 'event' : 'events'}
          </p>
        )}
      </Link>
    </motion.div>
  )
}
