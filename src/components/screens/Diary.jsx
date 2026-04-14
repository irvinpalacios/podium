/**
 * Diary
 *
 * Route: /diary
 * Nav:   Diary (active)
 *
 * Layout (top → bottom):
 *   <Header /> + <NavBar /> via AppShell
 *   Horizontal scrolling season filter pills — "All" active by default
 *   Feed: grouped by season with dividers, DiaryEntry rows
 */
import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import AppShell from '../layout/AppShell'
import CountryFlag from '../ui/CountryFlag'
import FlagRating from '../ui/FlagRating'
import { useAuth } from '../../hooks/useAuth'
import { useRaceLogs } from '../../hooks/useRaceLogs'
import { getSeasonRaces } from '../../utils/ergastApi'
import { useTheme } from '../../hooks/useTheme'

// ─── Season divider ───────────────────────────────────────────────────────────
function SeasonDivider({ year, count, theme }) {
  return (
    <div className="px-4 pt-5 pb-2">
      <div className="flex items-baseline gap-2 mb-2">
        <span className="text-[15px] font-medium">{year}</span>
        <span className="text-[11px] text-gravel">
          {count} race{count !== 1 ? 's' : ''}
        </span>
      </div>
      <div
        className={[
          'border-b',
          theme === 'dark' ? 'border-white/8' : 'border-black/8',
        ].join(' ')}
      />
    </div>
  )
}

// ─── DiaryEntry ───────────────────────────────────────────────────────────────
function DiaryEntry({ log, race, theme, onClick }) {
  const country  = race?.Circuit?.Location?.country ?? ''
  const raceName = race?.raceName ?? `Round ${log.round}`
  const raceDate = race?.date ?? null

  const formattedDate = raceDate
    ? new Date(raceDate).toLocaleDateString('en-GB', {
        day:   'numeric',
        month: 'short',
        year:  'numeric',
      })
    : ''

  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'flex items-start gap-3 px-4 py-3 w-full text-left',
        theme === 'dark' ? 'active:bg-white/5' : 'active:bg-black/5',
      ].join(' ')}
    >
      {/* Left col: flag + round number */}
      <div className="flex flex-col items-center gap-1 pt-0.5 w-8 flex-shrink-0">
        <CountryFlag country={country} size="md" />
        <span className="text-[10px] text-gravel">{log.round}</span>
      </div>

      {/* Body */}
      <div className="flex-1 min-w-0">
        {/* Race name + chevron */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-[14px] font-medium leading-tight truncate">
            {raceName}
          </span>
          <span
            className={[
              'text-[14px] flex-shrink-0',
              theme === 'dark' ? 'text-white/30' : 'text-black/25',
            ].join(' ')}
          >
            ›
          </span>
        </div>

        {/* Date */}
        {formattedDate && (
          <p className="text-[11px] text-gravel mt-0.5">{formattedDate}</p>
        )}

        {/* Notes */}
        {log.notes && (
          <p className="text-[11px] text-gravel line-clamp-1 mt-0.5">{log.notes}</p>
        )}

        {/* FlagRating */}
        <div className="mt-2">
          <FlagRating rating={log.rating} size="sm" />
        </div>

        {/* Meta row: DOTD pill + live/replay pill */}
        <div className="flex items-center gap-2 mt-1.5">
          {log.driver_of_the_day && (
            <span
              className={[
                'text-[10px] px-1.5 py-0.5 rounded',
                theme === 'dark'
                  ? 'bg-white/10 text-white/60'
                  : 'bg-black/8 text-black/50',
              ].join(' ')}
            >
              {log.driver_of_the_day}
            </span>
          )}
          {/* Live/replay pill */}
          <span
            className={[
              'text-[10px] px-1.5 py-0.5 rounded',
              log.watched_live
                ? theme === 'dark'
                  ? 'bg-amber text-tarmac'
                  : 'bg-amber text-white'
                : theme === 'dark'
                ? 'bg-white/10 text-white/60'
                : 'bg-black/8 text-black/50',
            ].join(' ')}
          >
            {log.watched_live ? 'Live' : 'Replay'}
          </span>
        </div>
      </div>
    </button>
  )
}

// ─── Filter pill ──────────────────────────────────────────────────────────────
function FilterPill({ label, active, theme, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'flex-shrink-0 text-[12px] px-3 py-1 rounded-full transition-colors',
        active
          ? theme === 'dark'
            ? 'bg-amber text-tarmac'
            : 'bg-tarmac text-white'
          : theme === 'dark'
          ? 'bg-white/10 text-white/50'
          : 'bg-black/8 text-black/40',
      ].join(' ')}
    >
      {label}
    </button>
  )
}

// ─── Diary ────────────────────────────────────────────────────────────────────
export default function Diary() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { theme } = useTheme()

  const { logs, loading: logsLoading } = useRaceLogs(user)

  // Fetch race metadata for every season that has logs
  const [racesBySeason, setRacesBySeason] = useState({}) // { [year]: Race[] }
  const [racesLoading, setRacesLoading]   = useState(false)

  const uniqueSeasons = useMemo(
    () => [...new Set(logs.map(l => l.season))].sort((a, b) => b - a),
    [logs]
  )

  // Stable key to avoid array-reference churn in the effect
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

  const [selectedSeason, setSelectedSeason] = useState('all')

  // Merged entries: attach Ergast race data to each log
  const mergedEntries = useMemo(() => {
    return logs.map(log => {
      const seasonRaces = racesBySeason[log.season] ?? []
      const race = seasonRaces.find(r => parseInt(r.round) === log.round) ?? null
      return { log, race }
    })
  }, [logs, racesBySeason])

  // Apply season filter
  const filteredEntries = useMemo(() => {
    if (selectedSeason === 'all') return mergedEntries
    return mergedEntries.filter(({ log }) => log.season === selectedSeason)
  }, [mergedEntries, selectedSeason])

  // Group by season (seasons descending, rounds ascending within each season)
  const groupedBySeason = useMemo(() => {
    const map = {}
    filteredEntries.forEach(entry => {
      const y = entry.log.season
      if (!map[y]) map[y] = []
      map[y].push(entry)
    })
    Object.values(map).forEach(entries => entries.sort((a, b) => a.log.round - b.log.round))
    return Object.entries(map)
      .sort(([a], [b]) => b - a)
      .map(([year, entries]) => ({ year: parseInt(year), entries }))
  }, [filteredEntries])

  const isLoading = logsLoading || racesLoading

  return (
    <AppShell theme={theme} user={user}>
      {/* Season filter pills */}
      <div className="pt-3 pb-1">
        <div className="flex gap-2 overflow-x-auto px-4 pb-1">
          <FilterPill
            label="All"
            active={selectedSeason === 'all'}
            theme={theme}
            onClick={() => setSelectedSeason('all')}
          />
          {uniqueSeasons.map(year => (
            <FilterPill
              key={year}
              label={String(year)}
              active={selectedSeason === year}
              theme={theme}
              onClick={() => setSelectedSeason(year)}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16 text-[13px] text-gravel">
          Loading…
        </div>
      ) : logs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center gap-2">
          <p className="text-[15px] font-medium">Log your first race</p>
          <p className="text-[13px] text-gravel">
            Your diary will appear here once you start logging races.
          </p>
        </div>
      ) : groupedBySeason.length === 0 ? (
        <div className="flex items-center justify-center py-16 text-[13px] text-gravel">
          No races logged for this season.
        </div>
      ) : (
        <div className="pb-6">
          {groupedBySeason.map(({ year, entries }) => (
            <div key={year}>
              <SeasonDivider year={year} count={entries.length} theme={theme} />
              {entries.map(({ log, race }) => (
                <DiaryEntry
                  key={log.id}
                  log={log}
                  race={race}
                  theme={theme}
                  onClick={() => navigate(`/race/${log.season}/${log.round}`)}
                />
              ))}
            </div>
          ))}
        </div>
      )}
    </AppShell>
  )
}
