/**
 * Stats
 *
 * Route: /stats
 * Nav:   Stats (active)
 *
 * Metrics (V1):
 *   - Total races logged
 *   - Average rating (1 decimal place)
 *   - Most picked Driver of the Day
 *   - Live % vs Replay %
 *   - Top 3 highest-rated races
 *   - Races logged per season (horizontal bar, amber fill)
 */
import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import AppShell from '../layout/AppShell'
import { useAuth } from '../../hooks/useAuth'
import { useRaceLogs } from '../../hooks/useRaceLogs'
import { getSeasonRaces } from '../../utils/ergastApi'

// ─── Stat card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, theme }) {
  return (
    <div
      className={[
        'rounded-xl p-4',
        theme === 'dark' ? 'bg-[#242424]' : 'bg-white',
      ].join(' ')}
    >
      <p className="text-[11px] text-gravel mb-1">{label}</p>
      <p className="text-[26px] font-medium leading-none tracking-display">{value}</p>
      {sub && <p className="text-[11px] text-gravel mt-1">{sub}</p>}
    </div>
  )
}

// ─── Section label ────────────────────────────────────────────────────────────
function SectionLabel({ children }) {
  return (
    <p className="text-[11px] font-medium text-gravel uppercase tracking-wider px-4 mb-2 mt-5">
      {children}
    </p>
  )
}

// ─── Stats ────────────────────────────────────────────────────────────────────
export default function Stats() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const theme = 'dark'

  const { logs, loading: logsLoading } = useRaceLogs(user)

  // Fetch race metadata for seasons in the top-3 display
  const [racesBySeason, setRacesBySeason] = useState({})
  const [racesLoading, setRacesLoading]   = useState(false)

  const uniqueSeasons = useMemo(
    () => [...new Set(logs.map(l => l.season))].sort((a, b) => b - a),
    [logs]
  )

  const uniqueSeasonKey = uniqueSeasons.join(',')

  useEffect(() => {
    if (uniqueSeasons.length === 0) return
    const missing = uniqueSeasons.filter(y => !racesBySeason[y])
    if (missing.length === 0) return

    let cancelled = false
    setRacesLoading(true)

    Promise.all(missing.map(y => getSeasonRaces(y).then(races => ({ year: y, races }))))
      .then(results => {
        if (cancelled) return
        setRacesBySeason(prev => {
          const next = { ...prev }
          results.forEach(({ year, races }) => { next[year] = races })
          return next
        })
      })
      .finally(() => { if (!cancelled) setRacesLoading(false) })

    return () => { cancelled = true }
  }, [uniqueSeasonKey]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Derived metrics ──────────────────────────────────────────────────────────
  const totalLogged = logs.length

  const avgRating = useMemo(() => {
    const rated = logs.filter(l => l.rating != null)
    if (rated.length === 0) return null
    const sum = rated.reduce((acc, l) => acc + l.rating, 0)
    return (sum / rated.length).toFixed(1)
  }, [logs])

  const topDotd = useMemo(() => {
    const counts = {}
    logs.forEach(l => {
      if (l.driver_of_the_day) {
        counts[l.driver_of_the_day] = (counts[l.driver_of_the_day] ?? 0) + 1
      }
    })
    const entries = Object.entries(counts)
    if (entries.length === 0) return null
    return entries.sort((a, b) => b[1] - a[1])[0]
  }, [logs])

  const livePercent = useMemo(() => {
    if (logs.length === 0) return null
    const liveCount = logs.filter(l => l.watched_live).length
    return Math.round((liveCount / logs.length) * 100)
  }, [logs])

  const top3Races = useMemo(() => {
    return [...logs]
      .filter(l => l.rating != null)
      .sort((a, b) => {
        if (b.rating !== a.rating) return b.rating - a.rating
        // Tie-break: most recent season, then most recent round
        if (b.season !== a.season) return b.season - a.season
        return b.round - a.round
      })
      .slice(0, 3)
      .map(log => {
        const seasonRaces = racesBySeason[log.season] ?? []
        const race = seasonRaces.find(r => parseInt(r.round) === log.round)
        return { log, raceName: race?.raceName ?? `Round ${log.round}` }
      })
  }, [logs, racesBySeason])

  const perSeasonCounts = useMemo(() => {
    const map = {}
    logs.forEach(l => { map[l.season] = (map[l.season] ?? 0) + 1 })
    return Object.entries(map)
      .sort(([a], [b]) => b - a)
      .map(([year, count]) => ({ year: parseInt(year), count }))
  }, [logs])

  const maxSeasonCount = Math.max(1, ...perSeasonCounts.map(s => s.count))

  const isLoading = logsLoading || racesLoading

  if (isLoading) {
    return (
      <AppShell theme={theme} user={user}>
        <div className="flex items-center justify-center py-16 text-[13px] text-gravel">
          Loading…
        </div>
      </AppShell>
    )
  }

  if (totalLogged === 0) {
    return (
      <AppShell theme={theme} user={user}>
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center gap-2">
          <p className="text-[15px] font-medium">Log your first race</p>
          <p className="text-[13px] text-gravel">
            Your stats will appear here once you start logging races.
          </p>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell theme={theme} user={user}>
      <div className="pb-8">
        {/* Overview cards */}
        <div className="grid grid-cols-2 gap-2 px-4 pt-4">
          <StatCard
            label="Races logged"
            value={totalLogged}
            theme={theme}
          />
          <StatCard
            label="Average rating"
            value={avgRating ?? '—'}
            sub={avgRating ? 'out of 5' : 'no ratings yet'}
            theme={theme}
          />
          <StatCard
            label="Favourite driver of the day"
            value={topDotd ? topDotd[0] : '—'}
            sub={topDotd ? `${topDotd[1]} time${topDotd[1] !== 1 ? 's' : ''}` : 'none picked yet'}
            theme={theme}
          />
          <StatCard
            label="Watched live"
            value={livePercent != null ? `${livePercent}%` : '—'}
            sub={livePercent != null ? `${100 - livePercent}% replay` : ''}
            theme={theme}
          />
        </div>

        {/* Top 3 highest-rated races */}
        {top3Races.length > 0 && (
          <>
            <SectionLabel>Top rated races</SectionLabel>
            <div className="px-4 flex flex-col gap-2">
              {top3Races.map(({ log, raceName }, idx) => (
                <button
                  key={log.id}
                  type="button"
                  onClick={() => navigate(`/race/${log.season}/${log.round}`)}
                  className={[
                    'flex items-center gap-3 rounded-xl p-3 w-full text-left',
                    theme === 'dark' ? 'bg-[#242424]' : 'bg-white',
                  ].join(' ')}
                >
                  {/* Rank */}
                  <span
                    className={[
                      'text-[13px] font-medium w-5 text-center flex-shrink-0',
                      idx === 0 ? 'text-gold' : 'text-gravel',
                    ].join(' ')}
                  >
                    {idx + 1}
                  </span>
                  {/* Race info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium truncate">{raceName}</p>
                    <p className="text-[11px] text-gravel">{log.season}</p>
                  </div>
                  {/* Rating */}
                  <span
                    className={[
                      'text-[13px] font-medium flex-shrink-0',
                      log.rating === 5 ? 'text-gold' : '',
                    ].join(' ')}
                  >
                    {'★'.repeat(log.rating)}
                  </span>
                </button>
              ))}
            </div>
          </>
        )}

        {/* Races per season bar chart */}
        {perSeasonCounts.length > 0 && (
          <>
            <SectionLabel>Races logged per season</SectionLabel>
            <div className="px-4 flex flex-col gap-3">
              {perSeasonCounts.map(({ year, count }) => (
                <div key={year} className="flex items-center gap-3">
                  <span className="text-[12px] text-gravel w-10 flex-shrink-0">{year}</span>
                  <div className="flex-1 h-[6px] rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-amber transition-all duration-300"
                      style={{ width: `${(count / maxSeasonCount) * 100}%` }}
                    />
                  </div>
                  <span className="text-[12px] text-gravel w-4 text-right flex-shrink-0">
                    {count}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </AppShell>
  )
}
