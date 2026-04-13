/**
 * Auth screen
 *
 * Route: /login
 * Redirects to / after successful sign-in or sign-up.
 *
 * Layout:
 *   - Full-height tarmac bg (dark only — no light variant on auth screen)
 *   - Podium logo centred, large
 *   - Sign in / Sign up tab toggle
 *   - Email + password inputs
 *   - Single CTA button
 *   - Inline error message below CTA
 */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppShell from '../layout/AppShell'
import Logo from '../ui/Logo'
import { useAuth } from '../../hooks/useAuth'

export default function Auth() {
  const navigate         = useNavigate()
  const { signIn, signUp } = useAuth()

  const [tab, setTab]       = useState('signin')   // 'signin' | 'signup'
  const [email, setEmail]   = useState('')
  const [password, setPass] = useState('')
  const [error, setError]   = useState(null)
  const [busy, setBusy]     = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setBusy(true)

    const { error: authError } = tab === 'signin'
      ? await signIn(email, password)
      : await signUp(email, password)

    setBusy(false)

    if (authError) {
      setError(authError.message)
    } else {
      navigate('/')
    }
  }

  const isSignIn = tab === 'signin'

  return (
    <AppShell theme="dark" showNav={false}>
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-56px)] px-4">

        {/* Logo */}
        <Logo size={56} theme="dark" />
        <p className="mt-3 mb-10 text-[13px] text-gravel">Your personal motorsport race log</p>

        {/* Tab toggle */}
        <div className="flex w-full max-w-xs mb-6 border border-white/10 rounded-lg overflow-hidden">
          {[
            { key: 'signin', label: 'Sign in' },
            { key: 'signup', label: 'Create account' },
          ].map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => { setTab(key); setError(null) }}
              className={[
                'flex-1 py-2 text-[13px] font-medium transition-colors',
                tab === key
                  ? 'bg-white/10 text-white'
                  : 'text-white/30 hover:text-white/50',
              ].join(' ')}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="w-full max-w-xs flex flex-col gap-3">
          <input
            type="email"
            placeholder="Email"
            autoComplete="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg bg-white/8 border border-white/10 text-white text-[14px] placeholder:text-white/30 focus:outline-none focus:border-amber"
          />
          <input
            type="password"
            placeholder="Password"
            autoComplete={isSignIn ? 'current-password' : 'new-password'}
            required
            value={password}
            onChange={e => setPass(e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg bg-white/8 border border-white/10 text-white text-[14px] placeholder:text-white/30 focus:outline-none focus:border-amber"
          />

          {/* Error */}
          {error && (
            <p className="text-[12px] text-red-400">{error}</p>
          )}

          {/* CTA */}
          <button
            type="submit"
            disabled={busy}
            className="mt-1 w-full py-3 rounded-lg bg-amber text-tarmac text-[14px] font-medium disabled:opacity-50"
          >
            {busy ? 'Please wait…' : isSignIn ? 'Sign in' : 'Create account'}
          </button>
        </form>

      </div>
    </AppShell>
  )
}
