import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import SeasonBrowser from './components/screens/SeasonBrowser'
import RaceDetail    from './components/screens/RaceDetail'
import Diary         from './components/screens/Diary'
import Stats         from './components/screens/Stats'
import Auth          from './components/screens/Auth'
import { useAuth }   from './hooks/useAuth'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return null
  return user ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Auth />} />
        <Route path="/" element={<ProtectedRoute><SeasonBrowser /></ProtectedRoute>} />
        <Route path="/race/:season/:round" element={<ProtectedRoute><RaceDetail /></ProtectedRoute>} />
        <Route path="/diary" element={<ProtectedRoute><Diary /></ProtectedRoute>} />
        <Route path="/stats" element={<ProtectedRoute><Stats /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
