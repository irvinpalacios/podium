/**
 * useUpcomingRace
 *
 * Finds the next upcoming race in the current F1 season by comparing
 * each race date against today. Falls back to the last race of the season
 * if the season is already complete.
 *
 * Returns
 *   race       (Ergast Race object | null)
 *   isUpcoming (boolean) — true if race is in the future, false if season is over
 *   loading    (boolean)
 *   error      (Error | null)
 */
import { useState, useEffect } from 'react'
import { getSeasonRaces } from '../utils/ergastApi'

export function useUpcomingRace() {
  const [race, setRace]           = useState(null)
  const [isUpcoming, setIsUpcoming] = useState(true)
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState(null)

  useEffect(() => {
    const currentYear = new Date().getFullYear()

    getSeasonRaces(currentYear)
      .then(races => {
        if (!races || races.length === 0) return

        const now = new Date()
        // Race date from Ergast is "YYYY-MM-DD"; treat as start-of-day UTC.
        // Add 1 day buffer so race-day itself still shows as "upcoming".
        const upcoming = races.find(r => {
          const d = new Date(r.date)
          d.setDate(d.getDate() + 1)
          return d > now
        })

        if (upcoming) {
          setRace(upcoming)
          setIsUpcoming(true)
        } else {
          setRace(races[races.length - 1])
          setIsUpcoming(false)
        }
      })
      .catch(err => setError(err))
      .finally(() => setLoading(false))
  }, [])

  return { race, isUpcoming, loading, error }
}
