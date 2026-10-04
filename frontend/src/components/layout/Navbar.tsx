import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Bookmark, ChevronDown, LogOut, Search, User as UserIcon } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useSaved } from '../../context/SavedContext'
import { useScrolled } from '../../hooks/useScrolled'
import { modalPanel } from '../../animations/variants'
import { cn, initials } from '../../utils/format'
import { ButtonLink } from '../ui/Button'
import { GithubIcon, LogoMark } from '../ui/icons'
import { MobileMenu } from './MobileMenu'

export const navLinks = [
  { to: '/', label: 'Home', end: true },
  { to: '/explore', label: 'Explore', end: false },
  { to: '/saved', label: 'Saved', end: false },
]

function Hamburger({ open }: { open: boolean }) {
  const bar = 'absolute left-0 h-[2px] w-5 rounded bg-current'
  return (
    <span className="relative block h-5 w-5" aria-hidden>
      <motion.span className={bar} style={{ top: 3 }} animate={open ? { y: 6, rotate: 45 } : { y: 0, rotate: 0 }} transition={{ duration: 0.2 }} />
      <motion.span className={bar} style={{ top: 9 }} animate={{ opacity: open ? 0 : 1 }} transition={{ duration: 0.12 }} />
      <motion.span className={bar} style={{ top: 15 }} animate={open ? { y: -6, rotate: -45 } : { y: 0, rotate: 0 }} transition={{ duration: 0.2 }} />
    </span>
  )
}

function AvatarMenu() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  if (!user) return null
  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Account menu"
        className="flex h-10 items-center gap-2 rounded-lg pl-1 pr-2 transition-colors hover:bg-raised"
      >
<span className="grid h-8 w-8 place-items-center rounded-full bg-accent-strong text-xs font-semibold text-white">
          {initials(user.name ? user.name : user.username ? user.username : 'U')}
</span>
        <ChevronDown size={14} className={cn('text-faint transition-transform', open && 'rotate-180')} aria-hidden />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            variants={modalPanel}
            initial="hidden"
            animate="show"
            exit="exit"
            role="menu"
            className="absolute right-0 mt-2 w-60 origin-top-right rounded-xl border border-line-strong bg-surface p-1.5 shadow-pop"
          >
            <div className="px-3 py-2.5">
              <p className="truncate text-sm font-medium">{user.name}</p>
              <p className="truncate text-xs text-faint">{user.email}</p>
            </div>
            <div className="my-1 h-px bg-line" />
            <button
              role="menuitem"
              onClick={() => {
                setOpen(false)
                navigate('/profile')
              }}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted transition-colors hover:bg-raised hover:text-ink"
            >
              <UserIcon size={16} aria-hidden /> Profile
            </button>
            <button
              role="menuitem"
              onClick={() => {
                setOpen(false)
                logout()
              }}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted transition-colors hover:bg-raised hover:text-rose"
            >
              <LogOut size={16} aria-hidden /> Logout
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function Navbar({ onOpenPalette }: { onOpenPalette: () => void }) {
  const scrolled = useScrolled(12)
  const { user } = useAuth()
  const { savedIds } = useSaved()
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()

  useEffect(() => setMenuOpen(false), [location.pathname])

  return (
    <>
      <motion.header
        initial={false}
        animate={{
          backgroundColor: scrolled ? 'rgba(11,16,32,0.78)' : 'rgba(11,16,32,0)',
          borderBottomColor: scrolled ? 'rgba(35,44,77,1)' : 'rgba(35,44,77,0)',
        }}
        transition={{ duration: 0.25 }}
        className={cn('fixed inset-x-0 top-0 z-50 border-b', scrolled && 'backdrop-blur-md')}
      >
        <nav className="container-page flex h-16 items-center justify-between" aria-label="Main">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2.5 rounded-md" aria-label="Hackathon Finder home">
              <LogoMark />
              <span className="text-[15px] font-semibold tracking-tight">Hackathon Finder</span>
            </Link>
            <ul className="hidden items-center gap-1 md:flex">
              {navLinks.map((l) => (
                <li key={l.to}>
                  <NavLink
                    to={l.to}
                    end={l.end}
                    className={({ isActive }) =>
                      cn(
                        'relative rounded-md px-3 py-2 text-sm transition-colors',
                        isActive ? 'text-ink' : 'text-muted hover:text-ink',
                      )
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {l.label}
                        {l.to === '/saved' && savedIds.length > 0 && (
                          <span className="ml-1.5 rounded bg-accent-soft px-1.5 py-0.5 font-mono text-[11px] text-accent">
                            {savedIds.length}
                          </span>
                        )}
                        {isActive && (
                          <motion.span
                            layoutId="nav-underline"
                            className="absolute inset-x-3 -bottom-[13px] h-[2px] rounded bg-accent"
                            transition={{ type: 'spring', stiffness: 500, damping: 40 }}
                          />
                        )}
                      </>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={onOpenPalette}
              aria-label="Search hackathons"
              className="grid h-10 w-10 place-items-center rounded-lg text-muted transition-colors hover:bg-raised hover:text-ink"
            >
              <Search size={18} aria-hidden />
            </button>
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              aria-label="GitHub"
              className="hidden h-10 w-10 place-items-center rounded-lg text-muted transition-colors hover:bg-raised hover:text-ink sm:grid"
            >
              <GithubIcon className="h-[18px] w-[18px]" />
            </a>
            <div className="mx-1 hidden h-5 w-px bg-line md:block" />
            {user ? (
              <div className="hidden items-center gap-1 md:flex">
                <Link
                  to="/saved"
                  aria-label="Saved hackathons"
                  className="grid h-10 w-10 place-items-center rounded-lg text-muted transition-colors hover:bg-raised hover:text-ink"
                >
                  <Bookmark size={18} aria-hidden />
                </Link>
                <AvatarMenu />
              </div>
            ) : (
              <div className="hidden items-center gap-2 md:flex">
                <ButtonLink to="/login" variant="ghost" size="sm">
                  Login
                </ButtonLink>
                <ButtonLink to="/register" size="sm">
                  Register
                </ButtonLink>
              </div>
            )}
            <button
              onClick={() => setMenuOpen((o) => !o)}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
              className="relative z-[55] grid h-10 w-10 place-items-center rounded-lg text-ink transition-colors hover:bg-raised md:hidden"
            >
              <Hamburger open={menuOpen} />
            </button>
          </div>
        </nav>
      </motion.header>
      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  )
}
