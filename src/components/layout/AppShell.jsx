/**
 * AppShell
 *
 * Root layout wrapper. Provides:
 *   - Full-height tarmac (dark) or concrete (light) background
 *   - <Header /> pinned at top
 *   - <NavBar /> below Header (hidden on /login)
 *   - Scrollable content area below
 *
 * Theme is determined by the `theme` prop. Dark is the V1 default.
 *
 * Props
 *   theme    ('dark' | 'light')  — default 'dark'
 *   user     (object | null)     — passed through to Header
 *   showNav  (boolean)           — false on Auth screen; default true
 *   children (ReactNode)
 */
import Header from './Header'
import BottomTabBar from './BottomTabBar'

export default function AppShell({
  theme = 'dark',
  user = null,
  showNav = true,
  children,
}) {
  return (
    <div
      className={[
        'min-h-screen flex flex-col',
        theme === 'dark' ? 'bg-tarmac text-white' : 'bg-concrete text-tarmac',
      ].join(' ')}
    >
      <Header theme={theme} user={user} />
      <main className="flex-1 overflow-y-auto pb-24">
        {children}
      </main>
      {showNav && <BottomTabBar theme={theme} />}
    </div>
  )
}
