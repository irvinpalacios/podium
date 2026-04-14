/**
 * useRaceLogs
 *
 * Reads and writes race log entries for the signed-in user.
 * All operations are scoped to the current user via Supabase RLS —
 * no user_id filtering is needed in queries; RLS enforces it server-side.
 *
 * Returns
 *   logs      (RaceLog[])  — all logs for the current user
 *   loading   (boolean)
 *   error     (Error | null)
 *   saveLog   (payload)    => Promise<{ error }>   upsert one log entry
 *   deleteLog (id)         => Promise<{ error }>   remove a log entry
 *
 * RaceLog shape mirrors the schema:
 *   { id, user_id, series, season, round, rating, driver_of_the_day, watched_live, notes, logged_at }
 */
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../utils/supabaseClient'

export function useRaceLogs(user) {
  const [logs, setLogs]       = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  const fetchLogs = useCallback(async () => {
    if (!user) {
      setLogs([])
      setLoading(false)
      return
    }
    setLoading(true)
    const { data, error: fetchError } = await supabase
      .from('race_logs')
      .select('*')
      .order('season', { ascending: false })
      .order('round',  { ascending: true })

    if (fetchError) setError(fetchError)
    else setLogs(data ?? [])
    setLoading(false)
  }, [user])

  useEffect(() => {
    fetchLogs()
  }, [fetchLogs])

  /**
   * Upsert a log entry. Caller provides all writable fields.
   * `series` is always included; defaults to 'f1'.
   *
   * @param {{ series?, season, round, rating, driver_of_the_day, watched_live, notes }} payload
   * @returns {Promise<{ error }>}
   */
  async function saveLog({ series = 'f1', season, round, rating, driver_of_the_day, watched_live, notes }) {
    const { error: upsertError } = await supabase
      .from('race_logs')
      .upsert(
        { user_id: user.id, series, season, round, rating, driver_of_the_day, watched_live, notes: notes ?? null },
        { onConflict: 'user_id,series,season,round' }
      )

    if (!upsertError) await fetchLogs()
    return { error: upsertError }
  }

  /**
   * Delete a log entry by its UUID primary key.
   *
   * @param {string} id
   * @returns {Promise<{ error }>}
   */
  async function deleteLog(id) {
    const { error: deleteError } = await supabase
      .from('race_logs')
      .delete()
      .eq('id', id)

    if (!deleteError) await fetchLogs()
    return { error: deleteError }
  }

  return { logs, loading, error, saveLog, deleteLog }
}
