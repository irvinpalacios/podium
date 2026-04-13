/**
 * BottomTabBar
 *
 * Apple-style floating frosted-glass pill navigation bar.
 * Fixed to the bottom of the viewport, 16px from each edge.
 * Four equally-weighted tabs: Home, Seasons, Log, Profile.
 *
 * Props
 *   theme ('dark' | 'light') — inherited from AppShell
 */
import { NavLink } from 'react-router-dom'

const TABS = [
  {
    label: 'Home',
    to: '/',
    end: true,
    icon: ({ active }) => active ? (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M10.707 2.293a1 1 0 0 1 1.414 0l7.586 7.586A2 2 0 0 1 20 11.293V20a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1v-4H10v4a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-8.707a2 2 0 0 1 .586-1.414l6.121-6.586z" />
      </svg>
    ) : (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 12L12 3l9 9" />
        <path d="M9 21V12h6v9" />
        <path d="M3 12v9h5v-5h8v5h5V12" />
      </svg>
    ),
  },
  {
    label: 'Seasons',
    to: '/seasons',
    end: false,
    icon: ({ active }) => active ? (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <rect x="3" y="3" width="8" height="8" rx="1.5" />
        <rect x="13" y="3" width="8" height="8" rx="1.5" />
        <rect x="3" y="13" width="8" height="8" rx="1.5" />
        <rect x="13" y="13" width="8" height="8" rx="1.5" />
      </svg>
    ) : (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="8" height="8" rx="1.5" />
        <rect x="13" y="3" width="8" height="8" rx="1.5" />
        <rect x="3" y="13" width="8" height="8" rx="1.5" />
        <rect x="13" y="13" width="8" height="8" rx="1.5" />
      </svg>
    ),
  },
  {
    label: 'Log',
    to: '/diary',
    end: false,
    icon: ({ active }) => active ? (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path fillRule="evenodd" clipRule="evenodd" d="M7 2a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H7zm1 5a1 1 0 0 1 1-1h6a1 1 0 0 1 0 2H9a1 1 0 0 1-1-1zm0 4a1 1 0 0 1 1-1h6a1 1 0 0 1 0 2H9a1 1 0 0 1-1-1zm0 4a1 1 0 0 1 1-1h4a1 1 0 0 1 0 2H9a1 1 0 0 1-1-1z" />
      </svg>
    ) : (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <rect x="5" y="2" width="14" height="20" rx="2" />
        <line x1="9" y1="7" x2="15" y2="7" />
        <line x1="9" y1="11" x2="15" y2="11" />
        <line x1="9" y1="15" x2="13" y2="15" />
      </svg>
    ),
  },
  {
    label: 'Profile',
    to: '/stats',
    end: false,
    icon: ({ active }) => active ? (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 20c0-4 3.582-7 8-7s8 3 8 7" />
      </svg>
    ) : (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 20c0-4 3.582-7 8-7s8 3 8 7" />
      </svg>
    ),
  },
]

export default function BottomTabBar({ theme = 'dark' }) {
  const isDark = theme === 'dark'

  return (
    <div
      className="fixed bottom-4 left-4 right-4 z-50"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <nav
        className={[
          'flex items-center justify-around px-2 py-2 rounded-2xl',
          isDark
            ? 'bg-black/60 border border-white/10 backdrop-blur-xl'
            : 'bg-white/70 border border-black/8 backdrop-blur-xl',
        ].join(' ')}
      >
        {TABS.map(({ label, to, end, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) => [
              'flex flex-col items-center gap-[2px] flex-1 py-1 transition-colors',
              isActive
                ? isDark ? 'text-amber' : 'text-tarmac'
                : isDark ? 'text-white/40' : 'text-black/30',
            ].join(' ')}
          >
            {({ isActive }) => (
              <>
                <Icon active={isActive} />
                <span className="text-[10px] font-medium">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
