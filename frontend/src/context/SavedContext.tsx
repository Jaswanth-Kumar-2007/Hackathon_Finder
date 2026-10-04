import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useToast } from './ToastContext'
import { useAuth } from './AuthContext'


interface SavedState {
  savedIds: string[]
  isSaved: (id: string) => boolean
  toggle: (id: string) => void
}

const SavedContext = createContext<SavedState | null>(null)

/**
 * Saved hackathons state using backend MongoDB with user authentication.
 * Removed localStorage persistence; all operations go through the backend.
 */
export function SavedProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast()
  const { user } = useAuth()
  const [savedIds, setSavedIds] = useState<string[]>([])

  useEffect(() => {
    // Fetch saved hackathons from backend on mount, using user email for identification
    fetchSavedHackathons()
  }, [user?.email])

  const fetchSavedHackathons = async () => {
    if (!user?.email) {
      setSavedIds([])
      return
    }

    try {
      const response = await fetch(`/users/me/saved?email=${user.email}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        toast('Failed to load saved hackathons', 'error')
        setSavedIds([])
        return
      }

      const data = await response.json()
      setSavedIds(data.savedIds || [])
    } catch {
      toast('Failed to load saved hackathons', 'error')
      setSavedIds([])
    }
  }

  const toggle = useCallback(
    async (id: string) => {
      const already = savedIds.includes(id)

      if (!user?.email) {
        toast('Login required to save hackathons', 'info')
        return
      }

      try {
        const method = already ? 'DELETE' : 'POST'
        const response = await fetch(`/hackathons/${id}/save`, {
          method,
          headers: {
            'Content-Type': 'application/json',
          },
          // Include user email as part of the request body so the backend
          // can associate the saved hackathon with the correct user
          body: JSON.stringify({ user_email: user.email }),
        })

        if (!response.ok) {
          throw new Error('Failed to update saved status')
        }

        // Refetch saved list after toggle
        await fetchSavedHackathons()

        toast(already ? 'Hackathon removed from saved' : 'Hackathon saved', already ? 'info' : 'success')
      } catch (err) {
        toast(err instanceof Error ? err.message : 'Failed to update saved status', 'error')
      }
    },
    [user?.email, savedIds, toast],
  )

  const isSaved = useCallback(
    (id: string) => savedIds.includes(id),
    [savedIds],
  )

  const value = useMemo(
    () => ({ savedIds, isSaved, toggle }),
    [savedIds, isSaved, toggle],
  )
  return <SavedContext.Provider value={value}>{children}</SavedContext.Provider>
}

export function useSaved(): SavedState {
  const ctx = useContext(SavedContext)
  if (!ctx) throw new Error('useSaved must be used inside <SavedProvider>')
  return ctx
}