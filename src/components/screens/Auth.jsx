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

  const [tab, setTab]         = useState('signin')   // 'signin' | 'signup'
  const [email, setEmail]     = useState('')
  const [username, setUsername] = useState('')
  const [password, setPass]   = useState('')
  const [showPass, setShow]   = useState(false)
  const [error, setError]     = useState(null)
  const [busy, setBusy]       = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setBusy(true)

    const { error: authError } = tab === 'signin'
      ? await signIn(email, password)
      : await signUp(email, password, username)

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
        <div className="flex w-full max-w-xs mb-8 border-b border-white/10">
          {[
            { key: 'signin', label: 'Sign in' },
            { key: 'signup', label: 'Create account' },
          ].map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => { setTab(key); setError(null); setUsername('') }}
              className={[
                'flex-1 pb-3 text-[13px] font-medium transition-colors',
                tab === key
                  ? 'text-white border-b-[1.5px] border-amber -mb-px'
                  : 'text-white/30 hover:text-white/50',
              ].join(' ')}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="w-full max-w-xs flex flex-col gap-4">

          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-medium text-gravel uppercase tracking-wider">
              Email
            </label>
            <div className="relative">
              {/* Envelope icon */}
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50 pointer-events-none" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="M2 7l10 7 10-7" />
              </svg>
              <input
                type="email"
                placeholder="driver@poleposition.com"
                autoComplete="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-white/10 border border-white/10 text-white text-[14px] placeholder:text-white/30 focus:outline-none focus:border-amber"
              />
            </div>
          </div>

          {/* Username — sign-up only */}
          {!isSignIn && (
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-medium text-gravel uppercase tracking-wider">
                Username
              </label>
              <div className="relative">
                {/* User icon */}
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50 pointer-events-none" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                </svg>
                <input
                  type="text"
                  placeholder="senna94"
                  autoComplete="username"
                  required
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-white/10 border border-white/10 text-white text-[14px] placeholder:text-white/30 focus:outline-none focus:border-amber"
                />
              </div>
            </div>
          )}

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-medium text-gravel uppercase tracking-wider">
              Password
            </label>
            <div className="relative">
              {/* Lock icon */}
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50 pointer-events-none" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="5" y="11" width="14" height="10" rx="2" />
                <path d="M8 11V7a4 4 0 0 1 8 0v4" />
              </svg>
              <input
                type={showPass ? 'text' : 'password'}
                placeholder="••••••••••••"
                autoComplete={isSignIn ? 'current-password' : 'new-password'}
                required
                value={password}
                onChange={e => setPass(e.target.value)}
                className="w-full pl-9 pr-10 py-2.5 rounded-lg bg-white/10 border border-white/10 text-white text-[14px] placeholder:text-white/30 focus:outline-none focus:border-amber"
              />
              {/* Show/hide toggle */}
              <button
                type="button"
                onClick={() => setShow(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/80 transition-colors"
              >
                {showPass ? (
                  /* Eye-off */
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  /* Eye */
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12S5 4 12 4s11 8 11 8-4 8-11 8S1 12 1 12z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

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
            {busy ? 'Please wait…' : isSignIn ? 'Sign in →' : 'Create account →'}
          </button>
        </form>

      </div>
    </AppShell>
  )
}
