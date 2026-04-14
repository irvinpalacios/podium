/**
 * useSeasonData
 *
 * Fetches race schedule and race results from the Ergast API.
 * All data is read-only (no Supabase writes).
 *
 * Usage
 *   const { seasons, loading, error } = useSeasonData()
 *   const { races, loading, error }   = useSeasonRaces(year)
 *   const { race,  loading, error }   = useRaceResults(year, round)
 *   const { drivers, loading, error } = useSeasonDrivers(year)
 */
import { useState, useEffect } from 'react'
import { getSeasons, getSeasonRaces, getRaceResults, getSeasonDrivers, getSeasonConstructors } from '../utils/ergastApi'

export function useSeasonData() {
  const [seasons, setSeasons] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    getSeasons()
      .then(data => { if (!cancelled) setSeasons(data) })
      .catch(err  => { if (!cancelled) setError(err) })
      .finally(()  => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  return { seasons, loading, error }
}

export function useSeasonRaces(year, series = 'f1') {
  const [races, setRaces]   = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  useEffect(() => {
    if (!year) return
    let cancelled = false
    setLoading(true)
    setRaces([])
    getSeasonRaces(year, series)
      .then(data => { if (!cancelled) setRaces(data) })
      .catch(err  => { if (!cancelled) setError(err) })
      .finally(()  => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [year, series])

  return { races, loading, error }
}

export function useRaceResults(year, round, series = 'f1') {
  const [race, setRace]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  useEffect(() => {
    if (!year || !round) return
    let cancelled = false
    setLoading(true)
    setRace(null)
    getRaceResults(year, round, series)
      .then(data => { if (!cancelled) setRace(data) })
      .catch(err  => { if (!cancelled) setError(err) })
      .finally(()  => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [year, round, series])

  return { race, loading, error }
}

export function useSeasonDrivers(year, series = 'f1') {
  const [drivers, setDrivers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  useEffect(() => {
    if (!year) return
    let cancelled = false
    setLoading(true)
    setDrivers([])
    getSeasonDrivers(year, series)
      .then(data => { if (!cancelled) setDrivers(data) })
      .catch(err  => { if (!cancelled) setError(err) })
      .finally(()  => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [year, series])

  return { drivers, loading, error }
}

export function useSeasonConstructors(year, series = 'f1') {
  const [constructors, setConstructors] = useState([])
  const [loading, setLoading]           = useState(true)
  const [error, setError]               = useState(null)

  useEffect(() => {
    if (!year) return
    let cancelled = false
    setLoading(true)
    setConstructors([])
    getSeasonConstructors(year, series)
      .then(data => { if (!cancelled) setConstructors(data) })
      .catch(err  => { if (!cancelled) setError(err) })
      .finally(()  => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [year, series])

  return { constructors, loading, error }
}
