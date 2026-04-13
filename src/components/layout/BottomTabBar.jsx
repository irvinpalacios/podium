/**
 * BottomTabBar
 *
 * Apple-style floating frosted-glass pill navigation bar with sliding bubble.
 * Fixed to the bottom of the viewport, 16px from each edge.
 * Four equally-weighted tabs: Home, Seasons, Log, Profile.
 *
 * Features:
 *   - Sliding translucent bubble that follows the active tab
 *   - Spring-eased animation for smooth interaction
 *   - Haptic feedback on tab selection (Web Vibration API)
 *   - SF-Symbol-style icons with outline/filled variants
 *
 * Props
 *   theme ('dark' | 'light') — inherited from AppShell
 */
import { NavLink, useLocation } from 'react-router-dom'

const TABS = [
  {
    label: 'Home',
    to: '/',
    end: true,
    icon: ({ active }) => active ? (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M3 10.5L12 3l9 7.5V20a1 1 0 01-1 1h-5v-5h-6v5H4a1 1 0 01-1-1V10.5z" />
      </svg>
    ) : (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 10.5L12 3l9 7.5V20a1 1 0 01-1 1h-5v-5h-6v5H4a1 1 0 01-1-1V10.5z" />
      </svg>
    ),
  },
  {
    label: 'Seasons',
    to: '/seasons',
    end: false,
    icon: ({ active }) => active ? (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <rect x="3" y="4" width="18" height="17" rx="2" />
        <line x1="3" y1="9" x2="21" y2="9" stroke="currentColor" strokeWidth="1.5" />
        <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="1.5" />
        <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="8" cy="14" r="1" fill="currentColor" />
        <circle cx="12" cy="14" r="1" fill="currentColor" />
        <circle cx="16" cy="14" r="1" fill="currentColor" />
      </svg>
    ) : (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="17" rx="2" />
        <line x1="3" y1="9" x2="21" y2="9" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <circle cx="8" cy="14" r="1" fill="currentColor" />
        <circle cx="12" cy="14" r="1" fill="currentColor" />
        <circle cx="16" cy="14" r="1" fill="currentColor" />
      </svg>
    ),
  },
  {
    label: 'Log',
    to: '/diary',
    end: false,
    icon: ({ active }) => active ? (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <circle cx="5" cy="7" r="1.5" />
        <line x1="9" y1="7" x2="20" y2="7" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="5" cy="12" r="1.5" />
        <line x1="9" y1="12" x2="20" y2="12" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="5" cy="17" r="1.5" />
        <line x1="9" y1="17" x2="20" y2="17" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ) : (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="5" cy="7" r="1.5" fill="currentColor" />
        <line x1="9" y1="7" x2="20" y2="7" />
        <circle cx="5" cy="12" r="1.5" fill="currentColor" />
        <line x1="9" y1="12" x2="20" y2="12" />
        <circle cx="5" cy="17" r="1.5" fill="currentColor" />
        <line x1="9" y1="17" x2="20" y2="17" />
      </svg>
    ),
  },
  {
    label: 'Profile',
    to: '/stats',
    end: false,
    icon: ({ active }) => active ? (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <circle cx="12" cy="8" r="3.5" />
        <path d="M4 20c0-3.866 3.582-7 8-7s8 3.134 8 7" />
      </svg>
    ) : (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="3.5" />
        <path d="M4 20c0-3.866 3.582-7 8-7s8 3.134 8 7" />
      </svg>
    ),
  },
]

export default function BottomTabBar({ theme = 'dark' }) {
  const isDark = theme === 'dark'
  const location = useLocation()

  // Calculate active index based on current location
  const activeIndex = TABS.findIndex((tab) =>
    tab.end ? location.pathname === tab.to : location.pathname.startsWith(tab.to)
  )
  const displayIndex = activeIndex >= 0 ? activeIndex : 0

  return (
    <div
      className="fixed bottom-4 left-4 right-4 z-50"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <nav
        className={[
          'relative flex items-center justify-around px-2 py-2 rounded-2xl overflow-hidden',
          isDark
            ? 'bg-black/60 border border-white/10 backdrop-blur-xl'
            : 'bg-white/70 border border-black/8 backdrop-blur-xl',
        ].join(' ')}
      >
        {/* Sliding bubble background */}
        <div
          className="absolute inset-y-[6px] rounded-[14px] pointer-events-none"
          style={{
            width: '22%',
            left: `${displayIndex * 25 + 1.5}%`,
            transition: 'left 500ms cubic-bezier(0.34, 1.56, 0.64, 1)',
            backgroundColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)',
          }}
        />

        {TABS.map(({ label, to, end, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={() => navigator.vibrate?.(10)}
            className={({ isActive }) => [
              'relative z-10 flex flex-col items-center gap-[2px] flex-1 py-1 transition-colors',
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
