/**
 * useProfile
 *
 * Fetches the current user's profile from the `profiles` table.
 * On first load, if no profile exists it auto-creates one using the user's
 * username from user_metadata (if available) or email prefix as the default display name.
 *
 * Returns
 *   profile               ({ id, user_id, display_name, username_last_changed, favorite_driver, favorite_team, created_at } | null)
 *   saveDisplayName       (name: string) => Promise<{ error }>
 *   saveUsername          (username: string) => Promise<{ error }> — enforces 7-day restriction
 *   saveProfileDetails    ({ favorite_driver, favorite_team }) => Promise<{ error }>
 *   loading               (boolean)
 */
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../utils/supabaseClient'

export function useProfile(user) {
  const [profile, setProfile]   = useState(null)
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }

    async function loadOrCreate() {
      const { data: existing } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()

      if (existing) {
        setProfile(existing)
      } else {
        // Auto-create with username from metadata or email prefix as default display name
        const defaultName = user.user_metadata?.username || user.email.split('@')[0]
        const { data: created } = await supabase
          .from('profiles')
          .insert({ user_id: user.id, display_name: defaultName })
          .select()
          .single()
        setProfile(created ?? null)
      }
      setLoading(false)
    }

    loadOrCreate()
  }, [user?.id])

  const saveDisplayName = useCallback(async (display_name) => {
    if (!user) return { error: 'Not authenticated' }
    const trimmed = display_name.trim()
    if (!trimmed) return { error: 'Display name cannot be empty' }

    const { data, error } = await supabase
      .from('profiles')
      .upsert({ user_id: user.id, display_name: trimmed }, { onConflict: 'user_id' })
      .select()
      .single()

    if (!error) setProfile(data)
    return { error }
  }, [user?.id])

  const saveUsername = useCallback(async (username) => {
    if (!user) return { error: 'Not authenticated' }
    const trimmed = username.trim()
    if (!trimmed) return { error: 'Username cannot be empty' }

    // Check 7-day restriction
    if (profile?.username_last_changed) {
      const last = new Date(profile.username_last_changed)
      const daysSince = (Date.now() - last.getTime()) / (1000 * 60 * 60 * 24)
      if (daysSince < 7) {
        const daysLeft = Math.ceil(7 - daysSince)
        return { error: `You can change your username in ${daysLeft} day${daysLeft === 1 ? '' : 's'}` }
      }
    }

    const { data, error } = await supabase
      .from('profiles')
      .upsert(
        {
          user_id: user.id,
          display_name: trimmed,
          username_last_changed: new Date().toISOString(),
          favorite_driver: profile?.favorite_driver,
          favorite_team: profile?.favorite_team
        },
        { onConflict: 'user_id' }
      )
      .select()
      .single()

    if (!error) setProfile(data)
    return { error }
  }, [user?.id, profile?.username_last_changed])

  const saveProfileDetails = useCallback(async ({ favorite_driver, favorite_team }) => {
    if (!user) return { error: 'Not authenticated' }

    const { data, error } = await supabase
      .from('profiles')
      .upsert(
        { user_id: user.id, display_name: profile?.display_name, favorite_driver, favorite_team },
        { onConflict: 'user_id' }
      )
      .select()
      .single()

    if (!error) setProfile(data)
    return { error }
  }, [user?.id, profile?.display_name])

  return { profile, saveDisplayName, saveUsername, saveProfileDetails, loading }
}
