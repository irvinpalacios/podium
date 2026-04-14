/**
 * useCommunityFeed
 *
 * Fetches recent activity from all users:
 *   - race_logs  (requires "Race logs readable by authenticated users" RLS policy)
 *   - comments   (requires "Comments readable by authenticated users" RLS policy)
 *   - activity_reactions (fetched to provide counts and flagged state)
 *
 * Resolves display names via the `profiles` table and race names via Ergast.
 * Merges both streams, sorts by timestamp descending.
 *
 * Returns
 *   activities  (Activity[])  — merged, sorted feed items
 *   loading     (boolean)
 *   error       (Error | null)
 *   refresh     () => void
 *
 * Activity shape:
 *   { type: 'log'|'comment', id, displayName, season, round, raceName,
 *     rating?, watchedLive?, text?, timestamp, flagCount, flaggedByMe }
 */
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../utils/supabaseClient'
import { getSeasonRaces } from '../utils/ergastApi'

const FEED_LIMIT = 20

export function useCommunityFeed(user) {
  const [activities, setActivities] = useState([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState(null)

  const fetchFeed = useCallback(async () => {
    if (!user) {
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)

    try {
      // Fetch logs and comments in parallel
      const [{ data: logs, error: logsErr }, { data: comments, error: commentsErr }] =
        await Promise.all([
          supabase
            .from('race_logs')
            .select('*')
            .order('logged_at', { ascending: false })
            .limit(FEED_LIMIT),
          supabase
            .from('comments')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(FEED_LIMIT),
        ])

      if (logsErr) throw logsErr
      if (commentsErr) throw commentsErr

      const allLogs     = logs     ?? []
      const allComments = comments ?? []

      // Collect unique user_ids to resolve display names
      const userIds = [...new Set([
        ...allLogs.map(l => l.user_id),
        ...allComments.map(c => c.user_id),
      ])]

      // Resolve profiles
      let profileMap = {}
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, display_name')
          .in('user_id', userIds)
        ;(profiles ?? []).forEach(p => {
          profileMap[p.user_id] = p.display_name
        })
      }

      // Collect unique seasons for race name resolution
      const seasons = [...new Set([
        ...allLogs.map(l => l.season),
        ...allComments.map(c => c.season),
      ])]

      // Fetch race schedules per season (in parallel, cached by season)
      const raceNameMap = {}
      await Promise.all(
        seasons.map(async year => {
          try {
            const races = await getSeasonRaces(year)
            races.forEach(r => {
              const key = `${year}-${parseInt(r.round)}`
              raceNameMap[key] = r.raceName
            })
          } catch {
            // Non-fatal: race names will fall back to "Round N"
          }
        })
      )

      const raceName = (season, round) =>
        raceNameMap[`${season}-${round}`] ?? `Round ${round}`

      const displayName = userId =>
        profileMap[userId] ?? 'A racer'

      // Build unified activity list
      const merged = [
        ...allLogs.map(l => ({
          type:        'log',
          id:          l.id,
          displayName: displayName(l.user_id),
          season:      l.season,
          round:       l.round,
          raceName:    raceName(l.season, l.round),
          rating:      l.rating,
          watchedLive: l.watched_live,
          timestamp:   l.logged_at,
        })),
        ...allComments.map(c => ({
          type:        'comment',
          id:          c.id,
          displayName: displayName(c.user_id),
          season:      c.season,
          round:       c.round,
          raceName:    raceName(c.season, c.round),
          text:        c.text,
          timestamp:   c.created_at,
        })),
      ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))

      // Fetch reactions for all visible activities
      const allIds = merged.map(a => a.id)
      const { data: reactions } = await supabase
        .from('activity_reactions')
        .select('activity_id, activity_type, user_id')
        .in('activity_id', allIds)

      const flagCountMap = {}        // `${type}-${id}` → count
      const myFlagSet    = new Set() // keys flagged by the current user
      ;(reactions ?? []).forEach(r => {
        const key = `${r.activity_type}-${r.activity_id}`
        flagCountMap[key] = (flagCountMap[key] ?? 0) + 1
        if (r.user_id === user.id) myFlagSet.add(key)
      })

      // Attach reaction state to each activity
      const withReactions = merged.map(a => ({
        ...a,
        flagCount:  flagCountMap[`${a.type}-${a.id}`] ?? 0,
        flaggedByMe: myFlagSet.has(`${a.type}-${a.id}`),
      }))

      setActivities(withReactions)
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  useEffect(() => {
    fetchFeed()
  }, [fetchFeed])

  return { activities, loading, error, refresh: fetchFeed }
}
