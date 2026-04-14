import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import AppShell from '../layout/AppShell'
import { useAuth } from '../../hooks/useAuth'
import { useTheme } from '../../hooks/useTheme'
import { useProfile } from '../../hooks/useProfile'
import { useSeasonDrivers, useSeasonConstructors } from '../../hooks/useSeasonData'

const CURRENT_SEASON = 2025

export default function Profile() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { theme } = useTheme()
  const { profile, saveUsername, saveProfileDetails, loading: profileLoading } = useProfile(user)
  const { drivers, loading: driversLoading } = useSeasonDrivers(CURRENT_SEASON)
  const { constructors, loading: constructorsLoading } = useSeasonConstructors(CURRENT_SEASON)

  const [isEditing, setIsEditing] = useState(false)
  const [usernameInput, setUsernameInput] = useState('')
  const [selectedDriver, setSelectedDriver] = useState('')
  const [selectedTeam, setSelectedTeam] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  // Sync state when profile loads
  useEffect(() => {
    if (profile) {
      setUsernameInput(profile.display_name || '')
      setSelectedDriver(profile.favorite_driver || '')
      setSelectedTeam(profile.favorite_team || '')
    }
  }, [profile])

  // Calculate days until username can be changed
  const getDaysUntilCanChange = () => {
    if (!profile?.username_last_changed) return 0
    const last = new Date(profile.username_last_changed)
    const daysSince = (Date.now() - last.getTime()) / (1000 * 60 * 60 * 24)
    if (daysSince >= 7) return 0
    return Math.ceil(7 - daysSince)
  }

  const canChangeUsername = getDaysUntilCanChange() === 0
  const daysUntilChange = getDaysUntilCanChange()

  // Find driver and team display names
  const getDriverName = (driverId) => {
    const driver = drivers.find(d => `${d.givenName} ${d.familyName}` === driverId)
    return driver ? `${driver.givenName} ${driver.familyName}` : driverId
  }

  const getTeamName = (teamId) => {
    const team = constructors.find(c => c.constructorId === teamId)
    return team?.name || teamId
  }

  async function handleSave() {
    setError('')
    setSaving(true)

    try {
      if (isEditing) {
        // Check if username changed
        if (usernameInput !== profile?.display_name) {
          const { error: usernameError } = await saveUsername(usernameInput)
          if (usernameError) {
            const errorMsg = typeof usernameError === 'string' ? usernameError : usernameError.message || 'An error occurred'
            setError(errorMsg)
            setSaving(false)
            return
          }
        }

        // Save profile details
        const { error: detailsError } = await saveProfileDetails({
          favorite_driver: selectedDriver,
          favorite_team: selectedTeam,
        })
        if (detailsError) {
          const errorMsg = typeof detailsError === 'string' ? detailsError : detailsError.message || 'An error occurred'
          setError(errorMsg)
          setSaving(false)
          return
        }

        setIsEditing(false)
      }
    } finally {
      setSaving(false)
    }
  }

  function handleCancel() {
    setError('')
    setIsEditing(false)
    // Revert form to profile state
    if (profile) {
      setUsernameInput(profile.display_name || '')
      setSelectedDriver(profile.favorite_driver || '')
      setSelectedTeam(profile.favorite_team || '')
    }
  }

  if (profileLoading) return null

  return (
    <AppShell theme={theme} showNavBar={false}>
      <div className={['min-h-screen px-4 py-6', theme === 'dark' ? 'bg-tarmac' : 'bg-concrete'].join(' ')}>
        {/* Header row with back button and Edit/Cancel pill */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate('/')}
            className={[
              'text-[13px] font-medium transition-opacity',
              theme === 'dark' ? 'text-white/50 hover:text-white/80' : 'text-black/50 hover:text-black/80',
            ].join(' ')}
          >
            ← Back
          </button>

          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className={[
                'px-3 py-1.5 rounded-full text-[11px] font-medium transition-opacity',
                theme === 'dark'
                  ? 'bg-amber text-tarmac hover:opacity-90'
                  : 'bg-tarmac text-white hover:opacity-90',
              ].join(' ')}
            >
              Edit
            </button>
          )}

          {isEditing && (
            <button
              onClick={handleCancel}
              disabled={saving}
              className={[
                'px-3 py-1.5 rounded-full text-[11px] font-medium transition-opacity',
                theme === 'dark'
                  ? 'text-white/50 hover:text-white/80 disabled:opacity-50'
                  : 'text-black/50 hover:text-black/80 disabled:opacity-50',
              ].join(' ')}
            >
              Cancel
            </button>
          )}
        </div>

        {/* Main content */}
        <div className="max-w-2xl">
          {/* Error message */}
          {error && (
            <div
              className={[
                'mb-4 p-3 rounded text-[13px]',
                theme === 'dark'
                  ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                  : 'bg-red-500/10 text-red-600 border border-red-500/20',
              ].join(' ')}
            >
              {error}
            </div>
          )}

          {/* Username field */}
          <div className="mb-6">
            <label
              className={[
                'block text-[13px] font-medium mb-2',
                theme === 'dark' ? 'text-white/70' : 'text-black/70',
              ].join(' ')}
            >
              Username
            </label>

            {isEditing ? (
              <div>
                <input
                  type="text"
                  value={usernameInput}
                  onChange={e => setUsernameInput(e.target.value)}
                  disabled={!canChangeUsername}
                  maxLength={32}
                  className={[
                    'w-full px-3 py-2 rounded border text-[14px] outline-none transition-colors',
                    theme === 'dark'
                      ? 'bg-tarmac border-white/10 text-white disabled:opacity-50'
                      : 'bg-white border-black/10 text-black disabled:opacity-50',
                  ].join(' ')}
                />
                {!canChangeUsername && (
                  <p className={['mt-1.5 text-[11px]', theme === 'dark' ? 'text-gravel' : 'text-gravel'].join(' ')}>
                    Change available in {daysUntilChange} day{daysUntilChange === 1 ? '' : 's'}
                  </p>
                )}
                {canChangeUsername && (
                  <p className={['mt-1.5 text-[11px]', theme === 'dark' ? 'text-gravel' : 'text-gravel'].join(' ')}>
                    You can change your username once every 7 days
                  </p>
                )}
              </div>
            ) : (
              <p
                className={[
                  'text-[14px] font-medium',
                  theme === 'dark' ? 'text-white/80' : 'text-black/80',
                ].join(' ')}
              >
                {profile?.display_name || 'Not set'}
              </p>
            )}
          </div>

          {/* Favorite driver field */}
          <div className="mb-6">
            <label
              className={[
                'block text-[13px] font-medium mb-2',
                theme === 'dark' ? 'text-white/70' : 'text-black/70',
              ].join(' ')}
            >
              Favorite driver
            </label>

            {isEditing ? (
              <select
                value={selectedDriver}
                onChange={e => setSelectedDriver(e.target.value)}
                className={[
                  'w-full px-3 py-2 rounded border text-[14px] outline-none',
                  theme === 'dark'
                    ? 'bg-tarmac border-white/10 text-white'
                    : 'bg-white border-black/10 text-black',
                ].join(' ')}
              >
                <option value="">Select a driver</option>
                {drivers
                  .sort((a, b) => a.familyName.localeCompare(b.familyName))
                  .map(d => (
                    <option key={d.driverId} value={`${d.givenName} ${d.familyName}`}>
                      {d.givenName} {d.familyName}
                    </option>
                  ))}
              </select>
            ) : (
              <p
                className={[
                  'text-[14px] font-medium',
                  theme === 'dark' ? 'text-white/80' : 'text-black/80',
                ].join(' ')}
              >
                {selectedDriver ? getDriverName(selectedDriver) : 'Not set'}
              </p>
            )}
          </div>

          {/* Favorite team field */}
          <div className="mb-8">
            <label
              className={[
                'block text-[13px] font-medium mb-2',
                theme === 'dark' ? 'text-white/70' : 'text-black/70',
              ].join(' ')}
            >
              Favorite team
            </label>

            {isEditing ? (
              <select
                value={selectedTeam}
                onChange={e => setSelectedTeam(e.target.value)}
                className={[
                  'w-full px-3 py-2 rounded border text-[14px] outline-none',
                  theme === 'dark'
                    ? 'bg-tarmac border-white/10 text-white'
                    : 'bg-white border-black/10 text-black',
                ].join(' ')}
              >
                <option value="">Select a team</option>
                {constructors
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map(c => (
                    <option key={c.constructorId} value={c.constructorId}>
                      {c.name}
                    </option>
                  ))}
              </select>
            ) : (
              <p
                className={[
                  'text-[14px] font-medium',
                  theme === 'dark' ? 'text-white/80' : 'text-black/80',
                ].join(' ')}
              >
                {selectedTeam ? getTeamName(selectedTeam) : 'Not set'}
              </p>
            )}
          </div>

          {/* Save button */}
          {isEditing && (
            <button
              onClick={handleSave}
              disabled={saving || driversLoading || constructorsLoading}
              className={[
                'w-full py-3 rounded font-medium transition-opacity disabled:opacity-50',
                theme === 'dark'
                  ? 'bg-amber text-tarmac hover:opacity-90'
                  : 'bg-tarmac text-white hover:opacity-90',
              ].join(' ')}
            >
              {saving ? 'Saving...' : 'Save changes'}
            </button>
          )}
        </div>
      </div>
    </AppShell>
  )
}
