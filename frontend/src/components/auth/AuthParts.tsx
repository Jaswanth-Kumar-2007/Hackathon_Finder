import { useState, type InputHTMLAttributes, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Eye, EyeOff } from 'lucide-react'
import { cn } from '../../utils/format'
import { fadeUp } from '../../animations/variants'

/* ───────────── Field with animated validation message ───────────── */

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  hint?: string
  optional?: boolean
  right?: ReactNode
}

export function Field({ label, error, hint, optional, id, className, right, ...rest }: FieldProps) {
  const inputId = id ?? rest.name ?? label
  const errId = `${inputId}-error`
  return (
    <motion.div variants={fadeUp}>
      <div className="mb-1.5 flex items-center justify-between">
        <label htmlFor={inputId} className="text-sm font-medium">
          {label}
          {optional && <span className="ml-1.5 font-normal text-faint">Optional</span>}
        </label>
        {right}
      </div>
      <input
        id={inputId}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errId : undefined}
        className={cn('input', error && 'input-error', className)}
        {...rest}
      />
      <FieldMessage id={errId} error={error} hint={hint} />
    </motion.div>
  )
}

export function FieldMessage({ id, error, hint }: { id?: string; error?: string; hint?: string }) {
  return (
    <AnimatePresence initial={false} mode="wait">
      {error ? (
        <motion.p
          key="err"
          id={id}
          role="alert"
          initial={{ opacity: 0, height: 0, y: -4 }}
          animate={{ opacity: 1, height: 'auto', y: 0 }}
          exit={{ opacity: 0, height: 0 }}
          className="overflow-hidden pt-1.5 text-[13px] text-rose"
        >
          {error}
        </motion.p>
      ) : hint ? (
        <p key="hint" className="pt-1.5 text-[13px] text-faint">
          {hint}
        </p>
      ) : null}
    </AnimatePresence>
  )
}

/* ───────────── Password input with show/hide ───────────── */

interface PasswordFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string
  error?: string
  right?: ReactNode
  below?: ReactNode
}

export function PasswordField({ label, error, id, right, below, className, ...rest }: PasswordFieldProps) {
  const [visible, setVisible] = useState(false)
  const inputId = id ?? rest.name ?? label
  const errId = `${inputId}-error`
  return (
    <motion.div variants={fadeUp}>
      <div className="mb-1.5 flex items-center justify-between">
        <label htmlFor={inputId} className="text-sm font-medium">
          {label}
        </label>
        {right}
      </div>
      <div className="relative">
        <input
          id={inputId}
          type={visible ? 'text' : 'password'}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errId : undefined}
          className={cn('input pr-11', error && 'input-error', className)}
          {...rest}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? 'Hide password' : 'Show password'}
          aria-pressed={visible}
          className="absolute right-1 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-md text-faint transition-colors hover:text-ink"
        >
          {visible ? <EyeOff size={17} /> : <Eye size={17} />}
        </button>
      </div>
      <FieldMessage id={errId} error={error} />
      {below}
    </motion.div>
  )
}

/* ───────────── Password strength meter ───────────── */

export function passwordScore(pw: string): number {
  if (!pw) return 0
  let score = 0
  if (pw.length >= 8) score++
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++
  if (/\d/.test(pw)) score++
  if (/[^A-Za-z0-9]/.test(pw)) score++
  return Math.max(score, pw.length > 0 ? 1 : 0)
}

const strengthMeta = [
  { label: '', color: 'bg-line' },
  { label: 'Weak', color: 'bg-rose' },
  { label: 'Fair', color: 'bg-amber' },
  { label: 'Good', color: 'bg-sky' },
  { label: 'Strong', color: 'bg-mint' },
]

export function PasswordStrength({ password }: { password: string }) {
  const score = passwordScore(password)
  const meta = strengthMeta[score]
  return (
    <div className="pt-2.5" aria-live="polite">
      <div className="flex gap-1.5" aria-hidden>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-1 flex-1 overflow-hidden rounded-full bg-line">
            <motion.div
              className={cn('h-full rounded-full', meta.color)}
              initial={false}
              animate={{ width: score >= i ? '100%' : '0%' }}
              transition={{ duration: 0.25 }}
            />
          </div>
        ))}
      </div>
      <p className="mt-1.5 h-4 text-[13px] text-muted">
        {password ? `Password strength: ${meta.label}` : 'Use 8+ characters with letters, numbers and symbols.'}
      </p>
    </div>
  )
}

/* ───────────── Social buttons (mock OAuth) ───────────── */

// export function SocialButtons() {
//   const { loginWithProvider } = useAuth()
//   const navigate = useNavigate()
//   const [busy, setBusy] = useState<'Google' | 'GitHub' | null>(null)

//   const run = async (provider: 'Google' | 'GitHub') => {
//     setBusy(provider)
//     try {
//       await loginWithProvider(provider)
//       navigate('/')
//     } finally {
//       setBusy(null)
//     }
//   }

//   const btn =
//     'inline-flex h-11 w-full items-center justify-center gap-2.5 rounded-lg border border-line-strong bg-raised text-[15px] font-medium transition-all duration-150 hover:border-accent/60 active:scale-[0.98] disabled:opacity-60'
//   return (
//     <motion.div variants={fadeUp} className="grid gap-3 sm:grid-cols-2">
//       <button type="button" className={btn} disabled={busy !== null} onClick={() => run('Google')}>
//         <GoogleIcon className="h-[18px] w-[18px]" /> {busy === 'Google' ? 'Connecting…' : 'Continue with Google'}
//       </button>
//       <button type="button" className={btn} disabled={busy !== null} onClick={() => run('GitHub')}>
//         <GithubIcon className="h-[18px] w-[18px]" /> {busy === 'GitHub' ? 'Connecting…' : 'Continue with GitHub'}
//       </button>
//     </motion.div>
//   )
// }

export function OrDivider() {
  return (
    <motion.div variants={fadeUp} className="flex items-center gap-3 text-xs text-faint" role="separator">
      <span className="h-px flex-1 bg-line" /> or <span className="h-px flex-1 bg-line" />
    </motion.div>
  )
}
