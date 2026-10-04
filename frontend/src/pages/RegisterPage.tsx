import { useState, type ChangeEvent, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { AlertTriangle } from 'lucide-react'
import { fadeUp } from '../animations/variants'
import { AuthShell } from '../components/auth/AuthShell'
import { Field, PasswordField, PasswordStrength, passwordScore } from '../components/auth/AuthParts'
import { Button } from '../components/ui/Button'
import { useAuth } from '../context/AuthContext'

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const ALLOWED_INTERESTS = [
  'AI / ML',
  'Web Development',
  'Mobile Development',
  'Cloud',
  'Cybersecurity',
  'Blockchain',
  'Data Science',
  'Open Source',
  'IoT',
  'Game Development',
]

export function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', username: '', email: '', password: '', confirm: '', interests: [] as string[] })
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')

  const set = (key: keyof typeof form) => (e: ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [key]: e.target.value }))
  const blur = (key: string) => () => setTouched((t) => ({ ...t, [key]: true }))

  const errors: Record<string, string> = {
    name: form.name.trim().length < 2 ? 'Enter your name.' : '',
    username: form.username && !/^[a-zA-Z0-9_]{3,20}$/.test(form.username) ? 'Use 3–20 letters, numbers or underscores.' : '',
    email: !form.email ? 'Enter your email.' : !emailRe.test(form.email) ? 'Enter a valid email address.' : '',
    password: form.password.length < 8 ? 'Use at least 8 characters.' : passwordScore(form.password) < 2 ? 'Add numbers, symbols or mixed case.' : '',
    confirm: !form.confirm ? 'Confirm your password.' : form.confirm !== form.password ? 'Passwords do not match.' : '',
  }
  const show = (k: string) => (touched[k] ? errors[k] : '')

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setTouched({ name: true, username: true, email: true, password: true, confirm: true })
    setFormError('')
    if (Object.values(errors).some(Boolean)) return
    setSubmitting(true)
    try {
      await register({ name: form.name.trim(), email: form.email, username: form.username || undefined, password: form.password, interests: form.interests })
      navigate('/')
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Registration failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthShell title="Create your account" subtitle="Save hackathons and keep track of what you want to join.">
      {/*<SocialButtons />
      <OrDivider />*/}
      <motion.form variants={{ hidden: {}, show: { transition: { staggerChildren: 0.05 } } }} onSubmit={onSubmit} noValidate className="space-y-5">
        <AnimatePresence>
          {formError && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden" role="alert">
              <div className="flex items-start gap-2.5 rounded-lg border border-rose/30 bg-rose/10 px-3.5 py-3 text-sm text-rose">
                <AlertTriangle size={16} className="mt-0.5 shrink-0" aria-hidden /> {formError}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Name" name="name" autoComplete="name" placeholder="Ada Lovelace" value={form.name} onChange={set('name')} onBlur={blur('name')} error={show('name')} />
          <Field label="Username" optional name="username" autoComplete="username" placeholder="ada" value={form.username} onChange={set('username')} onBlur={blur('username')} error={show('username')} />
        </div>
        <Field label="Email" name="email" type="email" autoComplete="email" placeholder="you@example.com" value={form.email} onChange={set('email')} onBlur={blur('email')} error={show('email')} />
        <PasswordField
          label="Password"
          name="password"
          autoComplete="new-password"
          placeholder="Create a password"
          value={form.password}
          onChange={set('password')}
          onBlur={blur('password')}
          error={show('password')}
          below={<PasswordStrength password={form.password} />}
        />
        <PasswordField label="Confirm password" name="confirm" autoComplete="new-password" placeholder="Repeat your password" value={form.confirm} onChange={set('confirm')} onBlur={blur('confirm')} error={show('confirm')} />

        <div className="mt-6">
          <h3 className="text-sm font-medium text-muted mb-3">Interests</h3>
          <div className="grid grid-cols-2 gap-2">
            {ALLOWED_INTERESTS.map((interest) => (
              <label key={interest} className="flex items-center gap-2 border rounded-lg px-3 py-2 cursor-pointer select-none transition-colors hover:border-accent-strong">
                <input
                  type="checkbox"
                  checked={form.interests?.includes(interest)}
                  onChange={() => {
                    const updated = form.interests?.includes(interest)
                      ? form.interests.filter((i) => i !== interest)
                      : [...(form.interests || []), interest]
                    setForm((f) => ({ ...f, interests: updated }))
                  }}
                />
                <span className="text-sm">{interest}</span>
              </label>
            ))}
          </div>
        </div>

        <motion.div variants={fadeUp}>
          <Button type="submit" size="lg" className="w-full" loading={submitting}>
            {submitting ? 'Creating account…' : 'Create account'}
          </Button>
        </motion.div>
        <motion.p variants={fadeUp} className="text-center text-sm text-muted">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-accent hover:underline">
            Login
          </Link>
        </motion.p>
      </motion.form>
    </AuthShell>
  )
}
