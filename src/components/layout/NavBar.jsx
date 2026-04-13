/**
 * NavBar
 *
 * Three-item navigation bar. Sits directly below <Header />, separated by a
 * bottom border. Active item gets amber text + amber 1.5px underline in dark
 * mode, tarmac text + tarmac underline in light mode. Inactive items are muted.
 *
 * Props
 *   theme ('dark' | 'light') — inherited from AppShell
 */
import { NavLink } from 'react-router-dom'

const NAV_ITEMS = [
  { label: 'Seasons', to: '/' },
  { label: 'Diary',   to: '/diary' },
  { label: 'Stats',   to: '/stats' },
]

export default function NavBar({ theme = 'dark' }) {
  return (
    <nav
      className={[
        'flex border-b px-4',
        theme === 'dark' ? 'border-white/8' : 'border-black/8',
      ].join(' ')}
    >
      {NAV_ITEMS.map(({ label, to }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className={({ isActive }) => [
            'relative py-3 mr-6 text-[13px] font-medium',
            isActive
              ? theme === 'dark'
                ? 'text-amber after:bg-amber'
                : 'text-tarmac after:bg-tarmac'
              : theme === 'dark'
              ? 'text-white/30'
              : 'text-black/30',
            // Underline via ::after pseudo-element approximated with a bottom border
            isActive ? 'border-b-[1.5px]' : '',
            isActive
              ? theme === 'dark'
                ? 'border-amber'
                : 'border-tarmac'
              : 'border-transparent',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {label}
        </NavLink>
      ))}
    </nav>
  )
}
