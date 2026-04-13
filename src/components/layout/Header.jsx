/**
 * Header
 *
 * Top bar: Logo left, user avatar right.
 * Avatar shows first letter of the user's email in a small circle.
 * Clicking the avatar opens a dropdown with a sign-out option.
 * Falls back to a generic spacer when no user is present (e.g. login screen).
 *
 * Props
 *   theme ('dark' | 'light') — controls Logo theme + avatar colours
 *   user  (object | null)    — Supabase user object; null on auth screens
 */
import { useState, useEffect, useRef } from 'react'
import Logo from '../ui/Logo'
import Toggle from '../ui/Toggle'
import { useAuth } from '../../hooks/useAuth'
import { useTheme } from '../../hooks/useTheme'

export default function Header({ theme = 'dark', user = null }) {
  const { signOut } = useAuth()
  const { theme: globalTheme, toggleTheme } = useTheme()
  const initial = user?.email?.[0]?.toUpperCase() ?? null
  const [open, setOpen] = useState(false)
  const wrapperRef = useRef(null)

  // Close on outside click
  useEffect(() => {
    if (!open) return
    function handleClick(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  return (
    <header className="flex items-center justify-between px-4 py-3">
      <Logo size={28} theme={theme} />

      {initial ? (
        <div ref={wrapperRef} className="relative">
          {/* Avatar button */}
          <button
            type="button"
            onClick={() => setOpen(v => !v)}
            className={[
              'flex items-center justify-center w-7 h-7 rounded-full text-[11px] font-medium transition-opacity',
              theme === 'dark'
                ? 'bg-white/10 text-white/60 hover:bg-white/20'
                : 'bg-black/8 text-black/50 hover:bg-black/14',
            ].join(' ')}
          >
            {initial}
          </button>

          {/* Dropdown */}
          {open && (
            <div
              className={[
                'absolute right-0 top-full mt-2 w-44 rounded-lg border overflow-hidden z-50',
                theme === 'dark'
                  ? 'bg-tarmac border-white/10'
                  : 'bg-concrete border-black/10',
              ].join(' ')}
            >
              {/* Email row */}
              <div className={[
                'px-3 py-2.5 text-[11px] border-b truncate',
                theme === 'dark' ? 'text-white/30 border-white/10' : 'text-black/30 border-black/8',
              ].join(' ')}>
                {user.email}
              </div>

              {/* Light mode toggle */}
              <div className={[
                'flex items-center justify-between px-3 py-2.5 border-b',
                theme === 'dark' ? 'border-white/10' : 'border-black/8',
              ].join(' ')}>
                <span className={[
                  'text-[13px] font-medium',
                  theme === 'dark' ? 'text-white/70' : 'text-tarmac/70',
                ].join(' ')}>
                  Light mode
                </span>
                <Toggle checked={globalTheme === 'light'} onChange={toggleTheme} />
              </div>

              {/* Sign out */}
              <button
                type="button"
                onClick={() => { setOpen(false); signOut() }}
                className={[
                  'w-full text-left px-3 py-2.5 text-[13px] font-medium transition-colors',
                  theme === 'dark'
                    ? 'text-white/70 hover:text-white hover:bg-white/8'
                    : 'text-tarmac/70 hover:text-tarmac hover:bg-black/5',
                ].join(' ')}
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      ) : (
        // Placeholder spacer so Logo stays left-aligned on auth screen
        <div className="w-7 h-7" />
      )}
    </header>
  )
}
