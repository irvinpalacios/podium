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
 *   - Ratings spread (distribution card)
 *   - Five-star club (horizontally scrollable)
 *   - Season completion (bar chart with X / total)
 */
import { useState, useEffect, useMemo } from 'react'
import AppShell from '../layout/AppShell'
import { useAuth } from '../../hooks/useAuth'
import { useRaceLogs } from '../../hooks/useRaceLogs'
import { getSeasonRaces } from '../../utils/ergastApi'
import { useTheme } from '../../hooks/useTheme'
import { COUNTRY_TO_ISO } from '../../utils/countryFlags'
import FlagRating from '../ui/FlagRating'

// ─── Stat card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, emoji, theme }) {
  return (
    <div
      className={[
        'rounded-xl p-4',
        theme === 'dark' ? 'bg-[#242424]' : 'bg-white',
      ].join(' ')}
    >
      {emoji && <p className="text-[14px] mb-1">{emoji}</p>}
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

// ─── Ratings spread card ──────────────────────────────────────────────────────
function RatingsSpread({ spread, totalRated, theme }) {
  const maxCount = Math.max(1, ...spread)
  const MAX_BAR_H = 48
  const MIN_BAR_H = 4

  return (
    <div
      className={[
        'rounded-xl p-4 mx-4',
        theme === 'dark' ? 'bg-[#242424]' : 'bg-white',
      ].join(' ')}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-[11px] font-medium text-gravel uppercase tracking-wider">
          Ratings spread
        </p>
        <p className="text-[11px] text-gravel">{totalRated} ratings</p>
      </div>

      {/* Bars */}
      <div className="flex items-end justify-around h-[52px]">
        {spread.map((count, i) => {
          const barH = count === 0
            ? MIN_BAR_H
            : Math.max(MIN_BAR_H, Math.round((count / maxCount) * MAX_BAR_H))
          return (
            <div key={i} className="flex flex-col items-center gap-1">
              <div
                className="w-[10px] rounded-full bg-amber"
                style={{ height: barH, opacity: count === 0 ? 0.2 : 1 }}
              />
            </div>
          )
        })}
      </div>

      {/* Labels */}
      <div className="flex items-center justify-around mt-2">
        {[1, 2, 3, 4, 5].map(n => (
          <p key={n} className="text-[10px] text-gravel">
            {n}★
          </p>
        ))}
      </div>
    </div>
  )
}

// ─── Five-star club card ──────────────────────────────────────────────────────
function FiveStarCard({ country, year, raceName, theme }) {
  const iso = country ? COUNTRY_TO_ISO[country] : null
  return (
    <div
      className={[
        'flex-shrink-0 w-[120px] rounded-xl p-3 flex flex-col',
        theme === 'dark' ? 'bg-[#242424]' : 'bg-white',
      ].join(' ')}
    >
      {/* Country flag */}
      <div
        className="rounded-md overflow-hidden border border-black/10 bg-gravel/20"
        style={{ width: 72, height: 48 }}
      >
        {iso ? (
          <span
            className={`fi fi-${iso}`}
            style={{ width: 72, height: 48, display: 'block', backgroundSize: 'cover', backgroundPosition: 'center' }}
          />
        ) : (
          <span className="flex items-center justify-center w-full h-full text-[10px] text-gravel/60">?</span>
        )}
      </div>
      <p className="text-[11px] text-amber mt-2">{year}</p>
      <p
        className="text-[12px] font-medium mt-2 flex-1"
        style={{
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}
      >
        {raceName}
      </p>
      <div className="mt-3">
        <FlagRating rating={5} size="sm" />
      </div>
    </div>
  )
}

// ─── Stats ────────────────────────────────────────────────────────────────────
export default function Stats() {
  const { user } = useAuth()
  const { theme } = useTheme()

  const { logs, loading: logsLoading } = useRaceLogs(user)

  // Fetch race metadata for all seasons in the user's logs
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

  const ratingsSpread = useMemo(
    () => [1, 2, 3, 4, 5].map(n => logs.filter(l => l.rating === n).length),
    [logs]
  )

  const totalRatedCount = useMemo(
    () => logs.filter(l => l.rating != null).length,
    [logs]
  )

  const fiveStarRaces = useMemo(() => {
    return [...logs]
      .filter(l => l.rating === 5)
      .sort((a, b) => {
        if (b.season !== a.season) return b.season - a.season
        return b.round - a.round
      })
      .map(log => {
        const seasonRaces = racesBySeason[log.season] ?? []
        const race = seasonRaces.find(r => parseInt(r.round) === log.round)
        const country = race?.Circuit?.Location?.country ?? null
        return {
          log,
          raceName: race?.raceName ?? `Round ${log.round}`,
          country,
        }
      })
  }, [logs, racesBySeason])

  const perSeasonCounts = useMemo(() => {
    const map = {}
    logs.forEach(l => { map[l.season] = (map[l.season] ?? 0) + 1 })
    return Object.entries(map)
      .sort(([a], [b]) => b - a)
      .map(([year, count]) => ({ year: parseInt(year), count }))
  }, [logs])

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
            emoji="🏁"
            label="Races logged"
            value={totalLogged}
            theme={theme}
          />
          <StatCard
            emoji="⭐"
            label="Average rating"
            value={avgRating ?? '—'}
            sub={avgRating ? 'out of 5' : 'no ratings yet'}
            theme={theme}
          />
          <StatCard
            emoji="🧑‍🏎️"
            label="Favourite driver of the day"
            value={topDotd ? topDotd[0] : '—'}
            sub={topDotd ? `${topDotd[1]} time${topDotd[1] !== 1 ? 's' : ''}` : 'none picked yet'}
            theme={theme}
          />
          <StatCard
            emoji="📺"
            label="Watched live"
            value={livePercent != null ? `${livePercent}%` : '—'}
            sub={livePercent != null ? `${100 - livePercent}% replay` : ''}
            theme={theme}
          />
        </div>

        {/* Ratings spread */}
        {totalRatedCount > 0 && (
          <>
            <SectionLabel>Ratings spread</SectionLabel>
            <RatingsSpread
              spread={ratingsSpread}
              totalRated={totalRatedCount}
              theme={theme}
            />
          </>
        )}

        {/* Five-star club */}
        {fiveStarRaces.length > 0 && (
          <>
            <SectionLabel>The five-star club</SectionLabel>
            <div
              className="flex gap-3 px-4 overflow-x-auto"
              style={{ scrollbarWidth: 'none' }}
            >
              {fiveStarRaces.map(({ log, raceName, country }) => (
                <FiveStarCard
                  key={log.id}
                  country={country}
                  year={log.season}
                  raceName={raceName}
                  theme={theme}
                />
              ))}
              {/* Trailing spacer so last card doesn't clip */}
              <div className="flex-shrink-0 w-1" />
            </div>
          </>
        )}

        {/* Season completion */}
        {perSeasonCounts.length > 0 && (
          <>
            <SectionLabel>Season completion</SectionLabel>
            <div
              className={[
                'mx-4 rounded-xl p-4',
                theme === 'dark' ? 'bg-[#242424]' : 'bg-white',
              ].join(' ')}
            >
              <div className="flex flex-col gap-3">
                {perSeasonCounts.map(({ year, count }) => {
                  const total = racesBySeason[year]?.length ?? null
                  const pct = total ? (count / total) * 100 : (count / count) * 100
                  return (
                    <div key={year} className="flex items-center gap-3">
                      <span className="text-[12px] text-gravel w-10 flex-shrink-0">{year}</span>
                      <div className="flex-1 h-[6px] rounded-full bg-white/10">
                        <div
                          className="h-full rounded-full bg-amber transition-all duration-300"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-[12px] text-gravel w-12 text-right flex-shrink-0">
                        {total != null ? `${count}/${total}` : count}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </AppShell>
  )
}
