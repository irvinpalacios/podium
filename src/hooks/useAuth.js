/**
 * useAuth
 *
 * Wraps Supabase Auth. Exposes the current session/user and sign-in,
 * sign-up, and sign-out helpers.
 *
 * Returns
 *   user      (object | null)  — Supabase user object, null when signed out
 *   loading   (boolean)        — true until the initial session check resolves
 *   signIn    (email, password) => Promise<{ error }>
 *   signUp    (email, password) => Promise<{ error }>
 *   signOut   () => Promise<void>
 */
import { useState, useEffect } from 'react'
import { supabase } from '../utils/supabaseClient'

export function useAuth() {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Resolve the current session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Keep state in sync with auth events (sign in, sign out, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  async function signIn(email, password) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error }
  }

  async function signUp(email, password, username) {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username } },
    })
    if (error && error.message.toLowerCase().includes('already registered')) {
      return { error: { message: 'An account with this email already exists. Try signing in.' } }
    }
    return { error }
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  return { user, loading, signIn, signUp, signOut }
}
