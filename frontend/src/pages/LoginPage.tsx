import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { AlertTriangle } from 'lucide-react'
import { fadeUp } from '../animations/variants'
import { AuthShell } from '../components/auth/AuthShell'
import { Field,PasswordField} from '../components/auth/AuthParts'
import { Button } from '../components/ui/Button'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function LoginPage() {
  const { login } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(true)
  const [touched, setTouched] = useState({ email: false, password: false })
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')

  const errors = {
    email: !email ? 'Enter your email.' : !emailRe.test(email) ? 'Enter a valid email address.' : '',
    password: !password ? 'Enter your password.' : '',
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setTouched({ email: true, password: true })
    setFormError('')
    if (errors.email || errors.password) return
    setSubmitting(true)
    try {
      await login(email, password) // remember-me is a no-op in the mock: sessions always persist
      navigate('/')
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Login failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthShell title="Login" subtitle="Welcome back. Pick up where you left off.">
      {/*<SocialButtons />
      <OrDivider />*/}
      <motion.form variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06 } } }} onSubmit={onSubmit} noValidate className="space-y-5">
        <AnimatePresence>
          {formError && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
              role="alert"
            >
              <div className="flex items-start gap-2.5 rounded-lg border border-rose/30 bg-rose/10 px-3.5 py-3 text-sm text-rose">
                <AlertTriangle size={16} className="mt-0.5 shrink-0" aria-hidden /> {formError}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <Field
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={() => setTouched((t) => ({ ...t, email: true }))}
          error={touched.email ? errors.email : ''}
        />
        <PasswordField
          label="Password"
          name="password"
          autoComplete="current-password"
          placeholder="Your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onBlur={() => setTouched((t) => ({ ...t, password: true }))}
          error={touched.password ? errors.password : ''}
          right={
            <button
              type="button"
              onClick={() => toast('Password reset needs the backend, so it is not available yet.', 'info')}
              className="text-[13px] text-accent hover:underline"
            >
              Forgot password?
            </button>
          }
        />

        <motion.label variants={fadeUp} className="flex cursor-pointer items-center gap-2.5 text-sm text-muted">
          <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="h-4 w-4 rounded border-line-strong accent-[#5B6DFF]" />
          Remember me
        </motion.label>

        <motion.div variants={fadeUp}>
          <Button type="submit" size="lg" className="w-full" loading={submitting}>
            {submitting ? 'Logging in…' : 'Login'}
          </Button>
        </motion.div>
        <motion.p variants={fadeUp} className="text-center text-sm text-muted">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="font-medium text-accent hover:underline">
            Create one
          </Link>
        </motion.p>
        <motion.p variants={fadeUp} className="rounded-lg border border-dashed border-line px-3 py-2.5 text-xs leading-relaxed text-faint">
          Demo mode: any valid email and password works. Use the password <code className="font-mono text-muted">wrongpass</code> to preview the error state.
        </motion.p>
      </motion.form>
    </AuthShell>
  )
}
