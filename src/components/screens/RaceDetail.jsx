/**
 * RaceDetail
 *
 * Route: /race/:season/:round
 *
 * Opens in read state for logged races, edit state for unlogged races.
 * "Edit" pill switches read → edit. "Cancel" pill reverts.
 *
 * Shared sections (both states):
 *   Back button → /:season
 *   Round badge + CountryFlag
 *   Race title
 *   Race meta (date + circuit)
 *   Abstract circuit SVG
 *   Podium strip (P1 gold, P2, P3)
 *   Divider
 *   "Your log" label
 *
 * Read state:  FlagRating (md, non-interactive) + DOTD row + watched row + Edit pill
 * Edit state:  FlagRating (lg, interactive) + DOTD select + watched toggle + Save CTA
 */
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import AppShell from '../layout/AppShell'
import CountryFlag from '../ui/CountryFlag'
import FlagRating from '../ui/FlagRating'
import Toggle from '../ui/Toggle'
import { useAuth } from '../../hooks/useAuth'
import { useRaceResults } from '../../hooks/useSeasonData'
import { useRaceLogs } from '../../hooks/useRaceLogs'
import { useTheme } from '../../hooks/useTheme'

// ─── Abstract circuit line SVG ────────────────────────────────────────────────
function CircuitLine() {
  return (
    <svg viewBox="0 0 280 80" fill="none" className="w-full opacity-15" aria-hidden>
      <path
        d="M20 60 Q40 20 80 24 Q120 28 140 48 Q160 68 180 60 Q210 48 220 36 Q232 20 248 24 Q264 28 260 44 Q256 60 240 60 Q220 60 200 52"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

// ─── Podium strip ─────────────────────────────────────────────────────────────
function PodiumStrip({ results = [], theme }) {
  const top3 = results.slice(0, 3)
  return (
    <div className="flex gap-2 mt-3">
      {top3.map((r, i) => {
        const isFirst = i === 0
        const pos     = ['P1', 'P2', 'P3'][i]
        const surname = r.Driver?.familyName ?? '—'
        const team    = r.Constructor?.name ?? ''

        return (
          <div
            key={r.position}
            className={[
              'flex-1 rounded-lg px-3 py-2',
              isFirst
                ? 'bg-gold/20'
                : theme === 'dark' ? 'bg-white/5' : 'bg-black/5',
            ].join(' ')}
          >
            <p
              className={[
                'text-[10px] font-medium mb-0.5',
                isFirst ? 'text-gold' : 'text-gravel',
              ].join(' ')}
            >
              {pos}
            </p>
            <p
              className={[
                'text-[12px] font-medium truncate',
                isFirst ? 'text-gold' : '',
              ].join(' ')}
            >
              {surname}
            </p>
            <p className="text-[10px] text-gravel truncate">{team}</p>
          </div>
        )
      })}
    </div>
  )
}

// ─── RaceDetail ───────────────────────────────────────────────────────────────
export default function RaceDetail() {
  const { season, round } = useParams()
  const navigate          = useNavigate()
  const { user }          = useAuth()
  const { theme }         = useTheme()

  const { race, loading: raceLoading }       = useRaceResults(season, round)
const { logs, saveLog }                     = useRaceLogs(user)

  // Find existing log for this race
  const existingLog = logs.find(
    l => l.season === parseInt(season) && l.round === parseInt(round)
  )

  const isLogged = !!existingLog

  // Edit mode: unlogged races start in edit state
  const [editing, setEditing]           = useState(false)
  const [rating, setRating]             = useState(null)
  const [dotd, setDotd]                 = useState('')
  const [watchedLive, setWatchedLive]   = useState(false)
  const [saving, setSaving]             = useState(false)
  const [saveError, setSaveError]       = useState(null)

  // When log data loads, seed edit state and determine initial mode
  useEffect(() => {
    if (existingLog) {
      setRating(existingLog.rating)
      setDotd(existingLog.driver_of_the_day ?? '')
      setWatchedLive(existingLog.watched_live ?? false)
      setEditing(false)
    } else {
      setRating(null)
      setDotd('')
      setWatchedLive(false)
      setEditing(true)
    }
  }, [existingLog?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  function handleCancel() {
    if (existingLog) {
      setRating(existingLog.rating)
      setDotd(existingLog.driver_of_the_day ?? '')
      setWatchedLive(existingLog.watched_live ?? false)
    }
    setEditing(false)
  }

  async function handleSave() {
    setSaving(true)
    setSaveError(null)
    const { error } = await saveLog({
      series: 'f1',
      season: parseInt(season),
      round:  parseInt(round),
      rating,
      driver_of_the_day: dotd || null,
      watched_live: watchedLive,
    })
    setSaving(false)
    if (error) {
      setSaveError(error.message)
    } else {
      setEditing(false)
    }
  }

  // ── Data derived from Ergast ────────────────────────────────────────────────
  const raceResults = race?.Results ?? []
  const raceName    = race?.raceName ?? '—'
  const raceDate    = race?.date
    ? new Date(race.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    : '—'
  const circuitName = race?.Circuit?.circuitName ?? '—'
  const country     = race?.Circuit?.Location?.country ?? ''

  // Driver options for DOTD select — only drivers who raced this round, sorted by surname
  const driverOptions = [...raceResults]
    .map(r => r.Driver)
    .sort((a, b) => a.familyName.localeCompare(b.familyName))

  return (
    <AppShell theme={theme} user={user} showNav={false}>
      <div className="px-4 pb-8">

        {/* Back button */}
        <button
          type="button"
          onClick={() => navigate(`/${season}`)}
          className="flex items-center gap-1 text-[13px] text-gravel mt-1 mb-4 -ml-1 px-1"
        >
          <span className="text-[16px] leading-none">‹</span>
          {season}
        </button>

        {/* Round badge + flag */}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[11px] font-medium text-gravel bg-white/8 rounded px-2 py-0.5">
            Round {round}
          </span>
          <CountryFlag country={country} size="sm" />
        </div>

        {/* Race title */}
        <h1 className="text-[22px] font-medium tracking-display leading-tight mb-1">
          {raceName}
        </h1>

        {/* Race meta */}
        <p className="text-[11px] text-gravel mb-4">
          {raceDate} · {circuitName}
        </p>

        {/* Circuit line */}
        <CircuitLine />

        {/* Podium strip */}
        {raceLoading ? (
          <div className="h-16 flex items-center text-[12px] text-gravel">Loading results…</div>
        ) : (
          <PodiumStrip results={raceResults} theme={theme} />
        )}

        {/* Divider */}
        <div className="border-b border-white/8 my-5" />

        {/* Your log section */}
        <div>
          {/* Section label + action pill */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-[11px] font-medium uppercase tracking-wider text-gravel">
              Your log
            </span>
            {isLogged && !editing && (
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="text-[12px] font-medium text-amber border border-amber/40 rounded-full px-3 py-0.5"
              >
                Edit
              </button>
            )}
            {editing && isLogged && (
              <button
                type="button"
                onClick={handleCancel}
                className="text-[12px] font-medium text-gravel border border-white/15 rounded-full px-3 py-0.5"
              >
                Cancel
              </button>
            )}
          </div>

          {/* ── Read state ──────────────────────────────────────────────── */}
          {!editing && (
            <div className="flex flex-col gap-4">
              <FlagRating rating={rating} size="md" />

              <div className="flex items-center justify-between">
                <span className="text-[13px] text-gravel">Driver of the day</span>
                <span className="text-[13px] font-medium">
                  {dotd || <span className="text-gravel">—</span>}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[13px] text-gravel">Watched</span>
                {watchedLive ? (
                  <span className="text-[12px] font-medium text-amber bg-amber/15 rounded-full px-2.5 py-0.5">
                    Live
                  </span>
                ) : (
                  <span className="text-[12px] font-medium text-gravel bg-white/8 rounded-full px-2.5 py-0.5">
                    Replay
                  </span>
                )}
              </div>
            </div>
          )}

          {/* ── Edit state ──────────────────────────────────────────────── */}
          {editing && (
            <div className="flex flex-col gap-5">
              <FlagRating
                rating={rating}
                size="lg"
                interactive
                onChange={setRating}
              />

              {/* DOTD select */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] text-gravel">Driver of the day</label>
                <select
                  value={dotd}
                  onChange={e => setDotd(e.target.value)}
                  className={`w-full px-3 py-2.5 rounded-lg border text-[14px] focus:outline-none focus:border-amber appearance-none ${
                    theme === 'dark'
                      ? 'bg-tarmac text-concrete border-white/10'
                      : 'bg-white text-tarmac border-black/10'
                  }`}
                >
                  <option value="">Select driver</option>
                  {driverOptions.map(d => (
                    <option key={d.driverId} value={`${d.givenName} ${d.familyName}`}>
                      {d.givenName} {d.familyName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Watched live toggle */}
              <div className="flex items-center justify-between">
                <span className="text-[13px] text-gravel">Watched live</span>
                <Toggle checked={watchedLive} onChange={setWatchedLive} />
              </div>

              {/* Error */}
              {saveError && (
                <p className="text-[12px] text-red-400">{saveError}</p>
              )}

              {/* CTA */}
              <button
                type="button"
                onClick={handleSave}
                disabled={saving || rating === null}
                className="w-full py-3 rounded-xl bg-amber text-tarmac text-[14px] font-medium disabled:opacity-40"
              >
                {saving ? 'Saving…' : isLogged ? 'Save changes' : 'Save log'}
              </button>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  )
}
