/**
 * useTheme
 *
 * Global theme context. Stores the user's preference in localStorage
 * (UI preference, not user data — intentionally excluded from Supabase).
 *
 * Provides
 *   theme        ('dark' | 'light')
 *   toggleTheme  () => void
 */
import { createContext, useContext, useState } from 'react'

const ThemeContext = createContext(null)

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('podium_theme') ?? 'dark'
  })

  function toggleTheme() {
    setTheme(prev => {
      const next = prev === 'dark' ? 'light' : 'dark'
      localStorage.setItem('podium_theme', next)
      return next
    })
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
