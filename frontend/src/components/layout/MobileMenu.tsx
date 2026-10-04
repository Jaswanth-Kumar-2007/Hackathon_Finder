import { AnimatePresence, motion } from 'framer-motion'
import { Link, NavLink } from 'react-router-dom'
import { LogOut, User as UserIcon } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { drawerRight, overlay, easeOut } from '../../animations/variants'
import { useEscape } from '../../hooks/useEscape'
import { useLockBody } from '../../hooks/useLockBody'
import { cn, initials } from '../../utils/format'
import { ButtonLink } from '../ui/Button'
import { GithubIcon } from '../ui/icons'

const links = [
  { to: '/', label: 'Home', end: true },
  { to: '/explore', label: 'Explore', end: false },
  { to: '/saved', label: 'Saved', end: false },
  { to: '/about', label: 'About', end: false },
]

export function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user, logout } = useAuth()
  useLockBody(open)
  useEscape(open, onClose)

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[52] md:hidden">
          <motion.div
            variants={overlay}
            initial="hidden"
            animate="show"
            exit="exit"
            className="absolute inset-0 bg-canvas/80 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden
          />
          <motion.aside
            variants={drawerRight}
            initial="hidden"
            animate="show"
            exit="exit"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
            className="absolute right-0 top-0 flex h-full w-[86%] max-w-sm flex-col border-l border-line bg-surface px-5 pb-6 pt-20"
          >
            <motion.ul
              initial="hidden"
              animate="show"
              variants={{ hidden: {}, show: { transition: { staggerChildren: 0.05, delayChildren: 0.1 } } }}
              className="space-y-1"
            >
              {links.map((l) => (
                <motion.li
                  key={l.to}
                  variants={{ hidden: { opacity: 0, x: 16 }, show: { opacity: 1, x: 0, transition: { duration: 0.3, ease: easeOut } } }}
                >
                  <NavLink
                    to={l.to}
                    end={l.end}
                    className={({ isActive }) =>
                      cn(
                        'flex h-12 items-center rounded-lg px-3 text-lg font-medium transition-colors',
                        isActive ? 'bg-raised text-ink' : 'text-muted hover:bg-raised hover:text-ink',
                      )
                    }
                  >
                    {l.label}
                  </NavLink>
                </motion.li>
              ))}
            </motion.ul>

            <div className="mt-auto space-y-3 border-t border-line pt-5">
              {user ? (
                <>
                  <Link to="/profile" className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-raised">
                    <span className="grid h-10 w-10 place-items-center rounded-full bg-accent-strong text-sm font-semibold text-white">
                      {initials(user.name ? user.name : user.username ? user.username : 'U')}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium">{user.name}</span>
                      <span className="flex items-center gap-1 text-xs text-faint">
                        <UserIcon size={12} aria-hidden /> View profile
                      </span>
                    </span>
                  </Link>
                  <button
                    onClick={() => {
                      onClose()
                      logout()
                    }}
                    className="flex h-12 w-full items-center gap-2 rounded-lg px-3 text-muted transition-colors hover:bg-raised hover:text-rose"
                  >
                    <LogOut size={18} aria-hidden /> Logout
                  </button>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <ButtonLink to="/login" variant="secondary" size="lg">
                    Login
                  </ButtonLink>
                  <ButtonLink to="/register" size="lg">
                    Register
                  </ButtonLink>
                </div>
              )}
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="flex h-12 items-center gap-2 rounded-lg px-3 text-muted transition-colors hover:bg-raised hover:text-ink"
              >
                <GithubIcon className="h-[18px] w-[18px]" /> GitHub
              </a>
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  )
}
