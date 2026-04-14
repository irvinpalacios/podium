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
import { useNavigate } from 'react-router-dom'
import Logo from '../ui/Logo'
import Toggle from '../ui/Toggle'
import SearchModal from '../ui/SearchModal'
import { useAuth } from '../../hooks/useAuth'
import { useTheme } from '../../hooks/useTheme'
import { useProfile } from '../../hooks/useProfile'
import { useRaceLogs } from '../../hooks/useRaceLogs'
import { useSearchData } from '../../hooks/useSearchData'

export default function Header({ theme = 'dark', user = null }) {
  const navigate = useNavigate()
  const { signOut } = useAuth()
  const { theme: globalTheme, toggleTheme } = useTheme()
  const { profile } = useProfile(user)
  const initial = user?.email?.[0]?.toUpperCase() ?? null
  const [open, setOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const wrapperRef = useRef(null)

  // Search feature hooks
  const { logs, loading: logsLoading } = useRaceLogs(user)
  const { allRaces, loading: searchLoading } = useSearchData({ logs, logsLoading })

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

  // Global Escape key handler for search modal
  useEffect(() => {
    if (!searchOpen) return
    function handleEscape(e) {
      if (e.key === 'Escape') setSearchOpen(false)
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [searchOpen])

  return (
    <header className="flex items-center justify-between px-4 py-3">
      <div
        onClick={user ? () => navigate('/') : undefined}
        className={[
          'flex items-center justify-center w-9 h-9 rounded-full border',
          theme === 'dark' ? 'border-white/20 bg-white/5' : 'border-black/12 bg-black/4',
          user ? 'cursor-pointer' : '',
        ].join(' ')}
      >
        <Logo size={20} theme={theme} />
      </div>

      {initial ? (
        <div className="flex items-center gap-3">
          {/* Search icon */}
          <button
            type="button"
            aria-label="Search races"
            onClick={() => setSearchOpen(true)}
            className={[
              'flex items-center justify-center w-7 h-7 rounded-full transition-opacity',
              theme === 'dark'
                ? 'text-white/50 hover:text-white/80'
                : 'text-black/40 hover:text-black/70',
            ].join(' ')}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <circle cx="6.5" cy="6.5" r="4.5" />
              <line x1="10" y1="10" x2="14" y2="14" />
            </svg>
          </button>

          {/* Avatar dropdown group */}
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

              {/* Profile link */}
              <button
                type="button"
                onClick={() => { setOpen(false); navigate('/profile') }}
                className={[
                  'w-full flex items-center justify-between px-3 py-2.5 border-b text-left transition-colors',
                  theme === 'dark'
                    ? 'border-white/10 hover:bg-white/8'
                    : 'border-black/8 hover:bg-black/5',
                ].join(' ')}
              >
                <span className={[
                  'text-[13px] font-medium truncate',
                  theme === 'dark' ? 'text-white/70' : 'text-tarmac/70',
                ].join(' ')}>
                  {profile?.display_name ?? user.email.split('@')[0]}
                </span>
                <span className={[
                  'ml-2 flex-shrink-0 text-[10px] font-medium transition-opacity opacity-50 hover:opacity-100',
                  theme === 'dark' ? 'text-white' : 'text-tarmac',
                ].join(' ')}>
                  Edit profile
                </span>
              </button>

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
        </div>
      ) : (
        // Placeholder spacer so Logo stays left-aligned on auth screen
        <div className="w-7 h-7" />
      )}

      {/* Search modal */}
      <SearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        theme={theme}
        allRaces={allRaces}
        loading={searchLoading}
      />
    </header>
  )
}
