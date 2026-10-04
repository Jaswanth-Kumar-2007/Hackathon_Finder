/**
 * API layer for Hackathon Finder.
 *
 * Backend-connected:
 * - Search
 * - Login
 * - Register
 *
 * Still using frontend mock data:
 * - list()
 * - getById()
 * - getByIds()
 *
 * No database is used at this stage.
 */

import type { Hackathon, SearchParams, User, Platform, Eligibility, CategoryId } from '../types'

const baseUrl =
  import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'

/* ─────────────────────────────────────────────────────────────
   Hackathon API
   ───────────────────────────────────────────────────────────── */

export const hackathonApi = {
  /**
   * Search hackathons through FastAPI.
   *
   * React
   *   ↓
   * FastAPI
   *   ↓
   * SerpApi
   *   ↓
   * Gemini
   *   ↓
   * Normalization
   *   ↓
   * MongoDB dedup
   *   ↓
   * FastAPI response
   *   ↓
   * React
   *
   * Platform-specific queries:
   * - Devpost: site:devpost.com hackathon 2026
   * - HackerEarth: site:hackerearth.com hackathon 2026
   * - Unstop: site:unstop.com hackathon 2026
   * - Devfolio: site:devfolio.co hackathon 2026
   */
  async search(params: SearchParams): Promise<Hackathon[]> {
    const platform = params.filters?.platform?.[0] ?? undefined

    const response = await fetch(
      `${baseUrl}/hackathons/discover?platform=${platform || ''}`
    )

    if (!response.ok) {
      throw new Error('Search failed')
    }

    const data = await response.json()
    const backendHackathons = data.data?.hackathons || []

    return backendHackathons.map((item: any) => ({
      id: item.id,

      title: item.title || 'Untitled Hackathon',

      description: item.description || '',

      longDescription: [],

      platform: item.platform || 'Unknown' as Platform,

      organizer: item.organizer || '',

      mode:
        item.mode === 'Online'
          ? 'Online'
          : item.mode === 'Offline'
            ? 'Offline'
            : item.mode === 'Hybrid'
              ? 'Hybrid'
              : undefined,

      location: item.location || '',

      startDate: item.start_date || '',

      endDate: item.end_date || '',

      registrationDeadline: item.registration_deadline || '',

      prizeAmount: item.prize != null ? Number(item.prize) : 0,

      prizeLabel: item.prize || '' || '',

      eligibility: item.eligibility || [] as Eligibility[],

      teamSize: item.team_size
        ? { min: Number(item.team_size.min), max: Number(item.team_size.max) }
        : { min: 1, max: 1 },

      categories: item.categories || [] as CategoryId[],

      technologies: item.technologies || [],

      url: item.url || '#',

      addedAt: new Date().toISOString(),

      featured: false,

      trending: false,
    })) as Hackathon[]
  },

  /**
   * List hackathons through FastAPI.
   *
   * React
   *   ↓
   * FastAPI
   *   ↓
   * MongoDB
   *   ↓
   * FastAPI response
   *   ↓
   * React
   */
  async list(): Promise<Hackathon[]> {
    const response = await fetch(`${baseUrl}/hackathons/`)

    if (!response.ok) {
      throw new Error('List failed')
    }

    const data = await response.json()
    const backendHackathons = data.data?.hackathons || []

    return backendHackathons.map((item: any) => ({
      id: item.id,

      title: item.title || 'Untitled Hackathon',

      description: item.description || '',

      longDescription: [],

      platform: item.platform || 'Unknown' as Platform,

      organizer: item.organizer || '',

      mode:
        item.mode === 'Online'
          ? 'Online'
          : item.mode === 'Offline'
            ? 'Offline'
            : item.mode === 'Hybrid'
              ? 'Hybrid'
              : undefined,

      location: item.location || '',

      startDate: item.start_date || '',

      endDate: item.end_date || '',

      registrationDeadline: item.registration_deadline || '',

      prizeAmount: item.prize != null ? Number(item.prize) : 0,

      prizeLabel: item.prize || '' || '',

      eligibility: item.eligibility || [] as Eligibility[],

      teamSize: item.team_size
        ? { min: Number(item.team_size.min), max: Number(item.team_size.max) }
        : { min: 1, max: 1 },

      categories: item.categories || [] as CategoryId[],

      technologies: item.technologies || [],

      url: item.url || '#',

      addedAt: new Date().toISOString(),

      featured: false,

      trending: false,
    })) as Hackathon[]
  },

  /**
   * Temporary frontend mock details endpoint.
   *
   * Will use FastAPI + MongoDB.
   */
  async getById(id: string): Promise<Hackathon | null> {
    const response = await fetch(`${baseUrl}/hackathons/${id}`)

    if (!response.ok) {
      return null
    }

    const data = await response.json()
    const hackathon = data.data

    if (!hackathon) {
      return null
    }

    return {
      id: hackathon.id,

      title: hackathon.title || 'Untitled Hackathon',

      description: hackathon.description || '',

      longDescription: [],

      platform: hackathon.platform || 'Unknown' as Platform,

      organizer: hackathon.organizer || '',

      mode:
        hackathon.mode === 'Online'
          ? 'Online'
          : hackathon.mode === 'Offline'
            ? 'Offline'
            : hackathon.mode === 'Hybrid'
              ? 'Hybrid'
              : undefined,

      location: hackathon.location || '',

      startDate: hackathon.start_date || '',

      endDate: hackathon.end_date || '',

      registrationDeadline: hackathon.registration_deadline || '',

      prizeAmount: hackathon.prize != null ? Number(hackathon.prize) : 0,

      prizeLabel: hackathon.prize || '' || '',

      eligibility: hackathon.eligibility || [] as Eligibility[],

      teamSize: hackathon.team_size
        ? { min: Number(hackathon.team_size.min), max: Number(hackathon.team_size.max) }
        : { min: 1, max: 1 },

      categories: hackathon.categories || [] as CategoryId[],

      technologies: hackathon.technologies || [],

      url: hackathon.url || '#',

      addedAt: new Date().toISOString(),

      featured: false,

      trending: false,
    } as Hackathon
  },

  /**
   * Temporary frontend mock endpoint for multiple hackathons.
   *
   * Will use FastAPI + MongoDB.
   */
  async getByIds(ids: string[]): Promise<Hackathon[]> {
    if (ids.length === 0) {
      return []
    }

    // Fetch individual hackathons
    const results: Hackathon[] = []
    for (const id of ids) {
      const hackathon = await hackathonApi.getById(id)
      if (hackathon) {
        results.push(hackathon)
      }
    }
    return results
  },
}

/* ─────────────────────────────────────────────────────────────
   Saved Hackathons
   Temporary frontend-only implementation.
   Will later be replaced with FastAPI + MongoDB.
   ───────────────────────────────────────────────────────────── */

const SAVED_KEY = 'hackathon-finder-saved'

export const savedApi = {
  async list(): Promise<string[]> {
    const saved = localStorage.getItem(SAVED_KEY)

    if (!saved) {
      return []
    }

    try {
      return JSON.parse(saved)
    } catch {
      return []
    }
  },

  async save(id: string): Promise<void> {
    const ids = await this.list()

    if (!ids.includes(id)) {
      localStorage.setItem(
        SAVED_KEY,
        JSON.stringify([id, ...ids]),
      )
    }
  },

  async remove(id: string): Promise<void> {
    const ids = await this.list()

    const updatedIds = ids.filter(
      (savedId) => savedId !== id,
    )

    localStorage.setItem(
      SAVED_KEY,
      JSON.stringify(updatedIds),
    )
  },
}

const VIEWED_KEY = 'hackathon-finder-viewed'

export const viewedApi = {
  async list(): Promise<string[]> {
    const viewed = localStorage.getItem(VIEWED_KEY)

    if (!viewed) {
      return []
    }

    try {
      return JSON.parse(viewed)
    } catch {
      return []
    }
  },

  async add(id: string): Promise<void> {
    const ids = await this.list()

    if (!ids.includes(id)) {
      localStorage.setItem(
        VIEWED_KEY,
        JSON.stringify([id, ...ids])
      )
    }
  },

  async remove(id: string): Promise<void> {
    const ids = await this.list()

    const updatedIds = ids.filter(
      (viewedId) => viewedId !== id
    )

    localStorage.setItem(
      VIEWED_KEY,
      JSON.stringify(updatedIds)
    )
  },

  async clear(): Promise<void> {
    localStorage.removeItem(VIEWED_KEY)
  },
}

/* ─────────────────────────────────────────────────────────────
   Authentication
   ───────────────────────────────────────────────────────────── */

export interface LoginFormat {
  email: string
  password: string
}

export interface RegisterFormat {
  name: string
  email: string
  password: string
}

export const authApi = {
  /**
   * Get the current user session from localStorage.
   * This persists the authenticated user across page refreshes.
   */
  getSession(): User | null {
    try {
      const stored = localStorage.getItem('hackathon-finder-user')
      if (stored) {
        return JSON.parse(stored)
      }
    } catch {
      // Ignore localStorage errors
    }
    return null
  },

  /**
   * Login through FastAPI.
   *
   * POST /auth/login
   */
  async login(
    email: string,
    password: string
  ): Promise<User> {
    const response = await fetch(
      `${baseUrl}/auth/login`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      }
    )

    if (!response.ok) {
      let message = 'Login failed'

      try {
        const errorData = await response.json()
        message = errorData.detail || message
      } catch {
        // Keep default error message
      }

      throw new Error(message)
    }

    const user = await response.json()
    
    // Store user in localStorage for session persistence
    try {
      localStorage.setItem('hackathon-finder-user', JSON.stringify(user))
    } catch {
      // Ignore localStorage errors
    }

    return user
  },

  /**
   * Register through FastAPI.
   *
   * POST /auth/register
   */
  async register(
    input: RegisterFormat
  ): Promise<User> {
    const response = await fetch(
      `${baseUrl}/auth/register`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: input.name,
          email: input.email,
          password: input.password,
        }),
      }
    )

    if (!response.ok) {
      let message = 'Registration failed'

      try {
        const errorData = await response.json()
        message = errorData.detail || message
      } catch {
        // Keep default error message
      }

      throw new Error(message)
    }

    const user = await response.json()
    
    // Store user in localStorage for session persistence
    try {
      localStorage.setItem('hackathon-finder-user', JSON.stringify(user))
    } catch {
      // Ignore localStorage errors
    }

    return user
  },

  /**
   * OAuth is not implemented yet.
   *
   * Do not use this until Google/GitHub authentication
   * is actually implemented by the FastAPI backend.
   */
  async loginWithProvider(
    _provider: 'Google' | 'GitHub'
  ): Promise<User> {
    throw new Error(
      'OAuth login is not implemented yet.'
    )
  },

  /**
   * Logout is currently a frontend no-op.
   *
   * Proper backend session/token revocation will be
   * implemented later.
   */
  async logout(): Promise<void> {
    // Clear the user from localStorage
    try {
      localStorage.removeItem('hackathon-finder-user')
    } catch {
      // Ignore localStorage errors
    }
    return
  },
}