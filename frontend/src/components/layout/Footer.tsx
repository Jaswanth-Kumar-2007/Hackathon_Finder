import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { GithubIcon, LogoMark } from '../ui/icons'

const platforms = ['Devpost', 'HackerEarth', 'Unstop', 'Devfolio', 'MLH']

export function Footer() {
  return (
    <footer className="border-t border-line bg-canvas">
      <div className="container-page grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Link to="/" className="inline-flex items-center gap-2.5">
            <LogoMark className="h-6 w-6" />
            <span className="text-[15px] font-semibold">Hackathon Finder</span>
          </Link>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">
            One place to find hackathons from across the web, so you can spend your time building.
          </p>
        </div>
        <FooterColumn title="Product">
          <Link to="/explore">Explore</Link>
          <Link to="/saved">Saved</Link>
          <Link to="/about">About</Link>
        </FooterColumn>
        <FooterColumn title="Account">
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
          <Link to="/profile">Profile</Link>
        </FooterColumn>
        <FooterColumn title="Sources">
          {platforms.map((p) => (
            <span key={p} className="text-muted">
              {p}
            </span>
          ))}
        </FooterColumn>
      </div>
      <div className="border-t border-line">
        <div className="container-page flex flex-col items-start justify-between gap-3 py-6 text-sm text-faint sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} Hackathon Finder</p>
          <a href="https://github.com" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 transition-colors hover:text-ink">
            <GithubIcon className="h-4 w-4" /> Source on GitHub
          </a>
        </div>
      </div>
    </footer>
  )
}

function FooterColumn({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <h2 className="text-sm font-semibold">{title}</h2>
      <div className="mt-4 flex flex-col gap-2.5 text-sm text-muted [&>a]:w-fit [&>a]:transition-colors [&>a:hover]:text-ink">
        {children}
      </div>
    </div>
  )
}
