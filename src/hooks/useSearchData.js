import { useState, useRef, useMemo, useEffect } from 'react'
import { getSeasonRaces } from '../utils/ergastApi'

/**
 * Hook that fetches and caches race metadata for all relevant seasons,
 * returning a flat, searchable list of races.
 *
 * @param {Object} options
 * @param {Array} options.logs - User's race logs from useRaceLogs
 * @param {boolean} options.logsLoading - Whether logs are still loading
 * @returns {Object} { allRaces, loading, error }
 */
export function useSearchData({ logs, logsLoading }) {
  const currentYear = new Date().getFullYear()

  // Cache races by season in a ref to avoid re-fetching on re-renders
  const racesBySeasonRef = useRef({})

  // State to trigger re-render once initial fetch completes
  const [racesSynced, setRacesSynced] = useState(false)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  // Derive unique seasons: user's logged seasons + current year
  const uniqueSeasons = useMemo(() => {
    const seasons = new Set([...logs.map(l => l.season), currentYear])
    return Array.from(seasons).sort((a, b) => b - a) // descending
  }, [logs, currentYear])

  // Stable key to avoid array-reference churn in the effect
  const uniqueSeasonKey = uniqueSeasons.join(',')

  // Fetch missing seasons in parallel on mount or when unique seasons change
  useEffect(() => {
    if (logsLoading || uniqueSeasons.length === 0) return

    const missing = uniqueSeasons.filter(y => !racesBySeasonRef.current[y])
    if (missing.length === 0) {
      setRacesSynced(true)
      return
    }

    let cancelled = false
    setLoading(true)
    setError(null)

    Promise.all(
      missing.map(y =>
        getSeasonRaces(y)
          .then(races => ({ year: y, races }))
          .catch(err => {
            console.error(`Failed to fetch races for season ${y}:`, err)
            return { year: y, races: [] } // Continue with empty races on error
          })
      )
    )
      .then(results => {
        if (cancelled) return
        results.forEach(({ year, races }) => {
          racesBySeasonRef.current[year] = races
        })
        setRacesSynced(true)
      })
      .catch(err => {
        if (!cancelled) setError(err)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [uniqueSeasonKey, logsLoading]) // eslint-disable-line react-hooks/exhaustive-deps

  // Build flat searchable list of races
  const allRaces = useMemo(() => {
    if (!racesSynced) return []

    const logMap = new Map()
    logs.forEach(log => {
      logMap.set(`${log.season}-${log.round}`, log)
    })

    const races = []
    uniqueSeasons.forEach(season => {
      const seasonRaces = racesBySeasonRef.current[season] || []
      seasonRaces.forEach(race => {
        const searchText = [
          race.raceName,
          race.Circuit?.circuitName,
          race.Circuit?.Location?.locality,
          race.Circuit?.Location?.country,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()

        const log = logMap.get(`${race.season}-${race.round}`) || null

        races.push({
          season: parseInt(race.season),
          round: parseInt(race.round),
          raceName: race.raceName,
          circuitName: race.Circuit?.circuitName || '',
          locality: race.Circuit?.Location?.locality || '',
          country: race.Circuit?.Location?.country || '',
          searchText,
          log,
        })
      })
    })

    return races
  }, [racesSynced, logs, uniqueSeasons])

  return { allRaces, loading, error }
}

/**
 * Pure function to filter races by query string.
 * Used by SearchModal to avoid filtering logic being tied to component state.
 *
 * @param {Array} allRaces - The full race list from useSearchData
 * @param {string} query - User's search input
 * @returns {Array} Filtered races
 */
export function filterRaces(allRaces, query) {
  const q = query.trim().toLowerCase()
  if (!q) return []
  return allRaces.filter(race => race.searchText.includes(q))
}
