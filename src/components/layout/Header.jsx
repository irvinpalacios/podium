/**
 * Header
 *
 * Top bar: Logo left, user avatar right.
 * Avatar shows first letter of the user's email in a small circle.
 * Falls back to a generic circle when no user is present (e.g. login screen).
 *
 * Props
 *   theme ('dark' | 'light') — controls Logo theme + avatar colours
 *   user  (object | null)    — Supabase user object; null on auth screens
 */
import Logo from '../ui/Logo'

export default function Header({ theme = 'dark', user = null }) {
  const initial = user?.email?.[0]?.toUpperCase() ?? null

  return (
    <header className="flex items-center justify-between px-4 py-3">
      <Logo size={28} theme={theme} />

      {initial ? (
        <div
          className={[
            'flex items-center justify-center w-7 h-7 rounded-full text-[11px] font-medium',
            theme === 'dark'
              ? 'bg-white/10 text-white/60'
              : 'bg-black/8 text-black/50',
          ].join(' ')}
        >
          {initial}
        </div>
      ) : (
        // Placeholder spacer so Logo stays left-aligned on auth screen
        <div className="w-7 h-7" />
      )}
    </header>
  )
}
