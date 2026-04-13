/**
 * SeasonBrowser
 *
 * Route: /
 * Nav:   Seasons (active)
 *
 * Layout (top → bottom):
 *   <Header /> + <NavBar /> via AppShell
 *   Season selector row — year + prev/next chevrons
 *   Progress row — amber bar + "X / Y logged" label
 *   2-column RaceCard grid
 */
import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import AppShell from '../layout/AppShell'
import CountryFlag from '../ui/CountryFlag'
import FlagRating from '../ui/FlagRating'
import { useAuth } from '../../hooks/useAuth'
import { useSeasonRaces } from '../../hooks/useSeasonData'
import { useRaceLogs } from '../../hooks/useRaceLogs'
import { useTheme } from '../../hooks/useTheme'

// ─── Circuit sketch SVG ───────────────────────────────────────────────────────
// Abstract lines only — no real circuit shape
function CircuitSketch({ dimmed = false }) {
  return (
    <svg
      viewBox="0 0 64 40"
      fill="none"
      className={[
        'w-full h-full',
        dimmed ? 'opacity-[0.08]' : 'opacity-20',
      ].join(' ')}
      aria-hidden
    >
      <path
        d="M8 32 Q16 8 32 12 Q48 16 52 28 Q54 36 44 36 Q34 36 28 28 Q22 20 32 20 Q40 20 40 28"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

// ─── RaceCard ─────────────────────────────────────────────────────────────────
function RaceCard({ race, log, theme, onClick }) {
  const isLogged  = !!log
  const isFiveStar = log?.rating === 5

  // Background per state
  const bg = isFiveStar
    ? theme === 'dark' ? 'bg-[#2E2A1A]' : 'bg-[#FFF8E6]'
    : isLogged
    ? theme === 'dark' ? 'bg-[#2A2A2A]' : 'bg-white'
    : theme === 'dark' ? 'bg-[#242424]' : 'bg-[#ECEAE4]'

  const country = race.Circuit?.Location?.country ?? ''

  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'relative w-full text-left rounded-xl p-3 flex flex-col gap-1 overflow-hidden',
        bg,
      ].join(' ')}
    >
      {/* Round number */}
      <span
        className={[
          'text-[10px] font-medium',
          theme === 'dark' ? 'text-gravel' : 'text-gravel',
        ].join(' ')}
      >
        Round {race.round}
      </span>

      {/* Circuit sketch + flag row */}
      <div className="flex items-center justify-between h-9">
        <div className="flex-1 h-full text-white">
          <CircuitSketch dimmed={!isLogged} />
        </div>
        <CountryFlag
          country={country}
          size="sm"
          dimmed={!isLogged}
        />
      </div>

      {/* Race name */}
      <span
        className={[
          'text-[13px] font-medium leading-tight',
          !isLogged ? 'opacity-25' : '',
        ].join(' ')}
      >
        {race.raceName}
      </span>

      {/* Country */}
      <span
        className={[
          'text-[11px]',
          theme === 'dark' ? 'text-gravel' : 'text-gravel',
          !isLogged ? 'opacity-25' : '',
        ].join(' ')}
      >
        {country}
      </span>

      {/* Bottom row: FlagRating left, + icon right when unlogged */}
      <div className="flex items-center justify-between mt-1">
        <FlagRating rating={log?.rating ?? null} size="sm" />
        {!isLogged && (
          <span
            className={[
              'flex items-center justify-center w-[18px] h-[18px] rounded-full border text-[12px] leading-none',
              theme === 'dark'
                ? 'border-white/20 text-white/30'
                : 'border-black/15 text-black/25',
            ].join(' ')}
          >
            +
          </span>
        )}
      </div>
    </button>
  )
}

// ─── SeasonBrowser ────────────────────────────────────────────────────────────
const CURRENT_YEAR = new Date().getFullYear()
const MIN_YEAR     = 2000

export default function SeasonBrowser() {
  const navigate          = useNavigate()
  const { user }          = useAuth()
  const { theme }         = useTheme()

  const [season, setSeason] = useState(CURRENT_YEAR)

  const { races, loading: racesLoading } = useSeasonRaces(season)
  const { logs }                          = useRaceLogs(user)

  // Build a fast lookup: "season-round" → log
  const logMap = useMemo(() => {
    const map = {}
    logs.forEach(l => { map[`${l.season}-${l.round}`] = l })
    return map
  }, [logs])

  const loggedCount = useMemo(
    () => races.filter(r => logMap[`${season}-${r.round}`]).length,
    [races, logMap, season]
  )

  const progress = races.length > 0 ? loggedCount / races.length : 0

  function prevSeason() { if (season > MIN_YEAR) setSeason(s => s - 1) }
  function nextSeason() { if (season < CURRENT_YEAR) setSeason(s => s + 1) }

  return (
    <AppShell theme={theme} user={user}>
      {/* Season selector */}
      <div className="flex items-center justify-between px-4 py-3">
        <button
          type="button"
          onClick={prevSeason}
          disabled={season <= MIN_YEAR}
          aria-label="Previous season"
          className="text-white/40 disabled:opacity-20 text-[18px] leading-none px-1"
        >
          ‹
        </button>
        <span className="text-[22px] font-medium tracking-display">
          {season}
        </span>
        <button
          type="button"
          onClick={nextSeason}
          disabled={season >= CURRENT_YEAR}
          aria-label="Next season"
          className="text-white/40 disabled:opacity-20 text-[18px] leading-none px-1"
        >
          ›
        </button>
      </div>

      {/* Progress row */}
      <div className="px-4 mb-3">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] text-gravel">
            {loggedCount} / {races.length} logged
          </span>
        </div>
        <div className="h-[3px] w-full rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-amber transition-all duration-300"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      </div>

      {/* Race grid */}
      {racesLoading ? (
        <div className="flex items-center justify-center py-16 text-[13px] text-gravel">
          Loading…
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2 px-4 pb-6">
          {races.map(race => (
            <RaceCard
              key={race.round}
              race={race}
              log={logMap[`${season}-${race.round}`] ?? null}
              theme={theme}
              onClick={() => navigate(`/race/${season}/${race.round}`)}
            />
          ))}
        </div>
      )}
    </AppShell>
  )
}
