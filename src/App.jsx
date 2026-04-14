import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Home          from './components/screens/Home'
import SeasonBrowser from './components/screens/SeasonBrowser'
import RaceDetail    from './components/screens/RaceDetail'
import Diary         from './components/screens/Diary'
import Stats         from './components/screens/Stats'
import Profile       from './components/screens/Profile'
import Auth          from './components/screens/Auth'
import SplashScreen  from './components/ui/SplashScreen'
import { useAuth }   from './hooks/useAuth'
import { ThemeProvider } from './hooks/useTheme'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return null
  return user ? children : <Navigate to="/login" replace />
}

export default function App() {
  const [showSplash, setShowSplash] = useState(true)

  return (
    <ThemeProvider>
      <AnimatePresence mode="wait">
        {showSplash ? (
          <SplashScreen key="splash" onDone={() => setShowSplash(false)} />
        ) : (
          <BrowserRouter key="app">
            <Routes>
              <Route path="/login" element={<Auth />} />
              <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
              <Route path="/seasons" element={<ProtectedRoute><SeasonBrowser /></ProtectedRoute>} />
              <Route path="/race/:season/:round" element={<ProtectedRoute><RaceDetail /></ProtectedRoute>} />
              <Route path="/diary" element={<ProtectedRoute><Diary /></ProtectedRoute>} />
              <Route path="/stats" element={<ProtectedRoute><Stats /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        )}
      </AnimatePresence>
    </ThemeProvider>
  )
}
