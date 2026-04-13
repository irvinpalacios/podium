/**
 * Home
 *
 * Landing screen at `/`. Shows:
 *   - Welcome message with the user's display name
 *   - Hero card: next upcoming race (or last race when season is over)
 *   - Community feed: recent ratings + comments from all users
 */
import { useNavigate } from 'react-router-dom'
import AppShell from '../layout/AppShell'
import CountryFlag from '../ui/CountryFlag'
import FlagRating from '../ui/FlagRating'
import { useAuth } from '../../hooks/useAuth'
import { useTheme } from '../../hooks/useTheme'
import { useProfile } from '../../hooks/useProfile'
import { useUpcomingRace } from '../../hooks/useUpcomingRace'
import { useCommunityFeed } from '../../hooks/useCommunityFeed'

// ---------------------------------------------------------------------------
// Date helpers
// ---------------------------------------------------------------------------

function formatRaceDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

function getDaysUntil(dateStr) {
  if (!dateStr) return null
  const raceDay  = new Date(dateStr + 'T00:00:00')
  const today    = new Date()
  today.setHours(0, 0, 0, 0)
  const diff     = Math.ceil((raceDay - today) / (1000 * 60 * 60 * 24))
  return diff
}

function formatRelativeTime(timestamp) {
  if (!timestamp) return ''
  const diff = Date.now() - new Date(timestamp).getTime()
  const mins  = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days  = Math.floor(diff / 86400000)

  if (mins < 1)   return 'just now'
  if (mins < 60)  return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days === 1) return 'yesterday'
  if (days < 7)   return `${days}d ago`
  return formatRaceDate(timestamp.slice(0, 10))
}

// ---------------------------------------------------------------------------
// Activity feed item
// ---------------------------------------------------------------------------

function ActivityItem({ item, theme }) {
  const initial = item.displayName?.[0]?.toUpperCase() ?? '?'

  return (
    <div className="flex items-start gap-3">
      {/* Avatar */}
      <div
        className={[
          'flex items-center justify-center w-7 h-7 rounded-full flex-shrink-0 text-[11px] font-medium',
          theme === 'dark' ? 'bg-white/10 text-white/60' : 'bg-black/8 text-black/50',
        ].join(' ')}
      >
        {initial}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className={[
          'text-[13px] font-medium leading-snug',
          theme === 'dark' ? 'text-white' : 'text-tarmac',
        ].join(' ')}>
          {item.displayName}{' '}
          <span className={theme === 'dark' ? 'text-white/50 font-normal' : 'text-black/40 font-normal'}>
            {item.type === 'log' ? 'logged' : 'commented on'}
          </span>{' '}
          {item.raceName}
        </p>

        {item.type === 'log' && item.rating != null && (
          <div className="mt-1">
            <FlagRating rating={item.rating} size="sm" interactive={false} />
          </div>
        )}

        {item.type === 'comment' && (
          <p className="text-[12px] text-gravel mt-0.5 line-clamp-2">
            "{item.text}"
          </p>
        )}

        <p className="text-[10px] text-gravel mt-0.5">
          {formatRelativeTime(item.timestamp)}
        </p>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Hero skeleton + feed skeleton
// ---------------------------------------------------------------------------

function HeroSkeleton({ theme }) {
  const muted = theme === 'dark' ? 'bg-white/5' : 'bg-black/5'
  return (
    <div className={`rounded-xl p-4 mx-4 animate-pulse ${theme === 'dark' ? 'bg-[#2A2A2A]' : 'bg-white'}`}>
      <div className={`h-3 w-16 rounded mb-3 ${muted}`} />
      <div className={`h-7 w-3/4 rounded mb-1 ${muted}`} />
      <div className={`h-3 w-1/2 rounded mb-3 ${muted}`} />
      <div className={`h-6 w-20 rounded-full ${muted}`} />
    </div>
  )
}

function FeedSkeleton({ theme }) {
  const muted = theme === 'dark' ? 'bg-white/5' : 'bg-black/5'
  return (
    <div className="space-y-4 px-4">
      {[1, 2, 3].map(i => (
        <div key={i} className="flex items-start gap-3 animate-pulse">
          <div className={`w-7 h-7 rounded-full flex-shrink-0 ${muted}`} />
          <div className="flex-1 space-y-1.5">
            <div className={`h-3 w-3/4 rounded ${muted}`} />
            <div className={`h-2.5 w-1/2 rounded ${muted}`} />
          </div>
        </div>
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main screen
// ---------------------------------------------------------------------------

export default function Home() {
  const { user }                        = useAuth()
  const { theme }                       = useTheme()
  const { profile }                     = useProfile(user)
  const { race, isUpcoming, loading: heroLoading } = useUpcomingRace()
  const { activities, loading: feedLoading }       = useCommunityFeed(user)
  const navigate = useNavigate()

  const displayName = profile?.display_name ?? user?.email?.split('@')[0] ?? 'racer'
  const daysUntil   = race ? getDaysUntil(race.date) : null

  return (
    <AppShell theme={theme} user={user} showNav>
      <div className="pt-1 pb-6 space-y-5">

        {/* Welcome row */}
        <div className="px-4">
          <p className="text-[13px] text-gravel">
            Welcome back, <span className={theme === 'dark' ? 'text-white font-medium' : 'text-tarmac font-medium'}>{displayName}</span>
          </p>
        </div>

        {/* Hero card */}
        {heroLoading ? (
          <HeroSkeleton theme={theme} />
        ) : race ? (
          <button
            type="button"
            onClick={() => navigate(`/race/${race.season}/${race.round}`)}
            className={[
              'w-full mx-0 text-left rounded-xl p-4 transition-opacity active:opacity-80',
              'mx-4',
              theme === 'dark' ? 'bg-[#2A2A2A]' : 'bg-white',
            ].join(' ')}
            style={{ width: 'calc(100% - 2rem)' }}
          >
            {/* Card top row */}
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-medium text-gravel uppercase tracking-wider">
                {isUpcoming ? 'Next race' : 'Last race'}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-gravel">Round {parseInt(race.round)}</span>
                <CountryFlag country={race.Circuit.Location.country} size="sm" />
              </div>
            </div>

            {/* Race name */}
            <h2 className={[
              'text-[22px] font-medium tracking-display leading-tight mb-1 line-clamp-2',
              theme === 'dark' ? 'text-white' : 'text-tarmac',
            ].join(' ')}>
              {race.raceName}
            </h2>

            {/* Date + circuit */}
            <p className="text-[11px] text-gravel mb-3">
              {formatRaceDate(race.date)} · {race.Circuit.circuitName}
            </p>

            {/* Countdown chip */}
            {isUpcoming ? (
              daysUntil != null && daysUntil <= 3 ? (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium bg-amber text-tarmac">
                  This weekend
                </span>
              ) : (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium bg-amber text-tarmac">
                  In {daysUntil} day{daysUntil !== 1 ? 's' : ''}
                </span>
              )
            ) : (
              <span className={[
                'inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium',
                theme === 'dark' ? 'bg-white/8 text-white/50' : 'bg-black/8 text-black/40',
              ].join(' ')}>
                Season complete
              </span>
            )}
          </button>
        ) : null}

        {/* Community section */}
        <div className="px-4">
          {/* Section header */}
          <div className={[
            'flex items-center justify-between pb-2 mb-3 border-b',
            theme === 'dark' ? 'border-white/8' : 'border-black/8',
          ].join(' ')}>
            <span className={[
              'text-[13px] font-medium',
              theme === 'dark' ? 'text-white' : 'text-tarmac',
            ].join(' ')}>
              Community
            </span>
            {!feedLoading && activities.length > 0 && (
              <span className="text-[11px] text-gravel">
                {activities.length} update{activities.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>

          {/* Feed */}
          {feedLoading ? (
            <FeedSkeleton theme={theme} />
          ) : activities.length === 0 ? (
            <p className="text-[13px] text-gravel py-2">
              No activity yet — log a race to get things started
            </p>
          ) : (
            <div className="space-y-4">
              {activities.map(item => (
                <ActivityItem key={`${item.type}-${item.id}`} item={item} theme={theme} />
              ))}
            </div>
          )}
        </div>

      </div>
    </AppShell>
  )
}
