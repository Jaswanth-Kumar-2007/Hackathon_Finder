import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { AlertTriangle, Check, Info, X } from 'lucide-react'

type ToastTone = 'success' | 'info' | 'error'
interface Toast {
  id: number
  message: string
  tone: ToastTone
}

interface ToastApi {
  toast: (message: string, tone?: ToastTone) => void
}

const ToastContext = createContext<ToastApi | null>(null)
let counter = 0

const toneStyles: Record<ToastTone, { icon: typeof Check; color: string }> = {
  success: { icon: Check, color: 'bg-mint/15 text-mint' },
  info: { icon: Info, color: 'bg-sky/15 text-sky' },
  error: { icon: AlertTriangle, color: 'bg-rose/15 text-rose' },
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const dismiss = useCallback((id: number) => setToasts((t) => t.filter((x) => x.id !== id)), [])

  const toast = useCallback(
    (message: string, tone: ToastTone = 'success') => {
      const id = ++counter
      setToasts((t) => [...t.slice(-2), { id, message, tone }])
      window.setTimeout(() => dismiss(id), 3600)
    },
    [dismiss],
  )

  const value = useMemo(() => ({ toast }), [toast])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-0 bottom-4 z-[70] flex flex-col items-center gap-2 px-4 sm:inset-x-auto sm:right-6 sm:items-end"
        role="region"
        aria-label="Notifications"
        aria-live="polite"
      >
        <AnimatePresence initial={false}>
          {toasts.map((t) => {
            const { icon: Icon, color } = toneStyles[t.tone]
            return (
              <motion.div
                key={t.id}
                layout
                initial={{ opacity: 0, y: 16, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.97, transition: { duration: 0.15 } }}
                transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                className="pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-xl border border-line-strong bg-raised px-3.5 py-3 shadow-pop"
                role="status"
              >
                <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full ${color}`}>
                  <Icon size={15} strokeWidth={2.5} aria-hidden />
                </span>
                <p className="flex-1 text-sm font-medium text-ink">{t.message}</p>
                <button
                  onClick={() => dismiss(t.id)}
                  className="grid h-7 w-7 place-items-center rounded-md text-faint transition-colors hover:bg-line hover:text-ink"
                  aria-label="Dismiss notification"
                >
                  <X size={14} />
                </button>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>')
  return ctx
}
