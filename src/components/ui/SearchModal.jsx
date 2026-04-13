import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { filterRaces } from '../../hooks/useSearchData'
import CountryFlag from './CountryFlag'
import FlagRating from './FlagRating'

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <circle cx="6.5" cy="6.5" r="4.5" />
      <line x1="10" y1="10" x2="14" y2="14" />
    </svg>
  )
}

export default function SearchModal({ isOpen, onClose, theme, allRaces, loading }) {
  const navigate = useNavigate()
  const inputRef = useRef(null)
  const listRef = useRef(null)

  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(-1)

  const results = filterRaces(allRaces, query)

  // Auto-focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus()
    }
  }, [isOpen])

  // Clear query and reset active index when modal closes
  useEffect(() => {
    if (!isOpen) {
      setQuery('')
      setActiveIndex(-1)
    }
  }, [isOpen])

  // Scroll active result into view
  useEffect(() => {
    if (activeIndex >= 0 && listRef.current) {
      const activeElement = listRef.current.children[activeIndex]
      if (activeElement) {
        activeElement.scrollIntoView({ block: 'nearest' })
      }
    }
  }, [activeIndex])

  // Keyboard event handler
  function handleKeyDown(e) {
    if (e.key === 'Escape') {
      onClose()
      return
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex(i => Math.min(i + 1, results.length - 1))
      return
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex(i => Math.max(i - 1, -1))
      return
    }

    if (e.key === 'Enter') {
      e.preventDefault()
      const selectedIndex = activeIndex >= 0 ? activeIndex : 0
      if (results[selectedIndex]) {
        handleSelect(results[selectedIndex])
      }
      return
    }
  }

  function handleSelect(race) {
    navigate(`/race/${race.season}/${race.round}`)
    onClose()
  }

  function handleBackdropClick() {
    onClose()
  }

  if (!isOpen) return null

  const isDark = theme === 'dark'
  const backdropColor = isDark ? 'bg-tarmac/80' : 'bg-concrete/80'
  const panelBg = isDark ? 'bg-tarmac border-white/12' : 'bg-concrete border-black/10'
  const activeRowBg = isDark ? 'bg-white/8' : 'bg-black/6'

  return createPortal(
    <div
      className={`fixed inset-0 z-[60] ${backdropColor}`}
      onClick={handleBackdropClick}
    >
      <div
        className={`fixed inset-x-4 top-16 z-[61] max-w-lg mx-auto rounded-xl overflow-hidden border ${panelBg}`}
        onClick={e => e.stopPropagation()}
      >
        {/* Search input row */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-white/8">
          <SearchIcon />
          <input
            ref={inputRef}
            type="search"
            autoComplete="off"
            autoCorrect="off"
            spellCheck="false"
            placeholder="Search races, circuits, countries..."
            value={query}
            onChange={e => {
              setQuery(e.target.value)
              setActiveIndex(-1)
            }}
            onKeyDown={handleKeyDown}
            className={`flex-1 bg-transparent text-[14px] placeholder-gravel outline-none ${
              isDark ? 'text-white' : 'text-black'
            }`}
          />
        </div>

        {/* Content area */}
        <div className="max-h-[400px] overflow-y-auto">
          {loading ? (
            /* Loading skeleton */
            <div className="space-y-0">
              {[0, 1, 2].map(i => (
                <div key={i} className="flex items-center gap-3 px-4 py-3 border-b border-white/8">
                  <div className={`w-6 h-4 rounded-sm ${isDark ? 'bg-white/10' : 'bg-black/8'} animate-pulse`} />
                  <div className={`flex-1 h-4 rounded ${isDark ? 'bg-white/10' : 'bg-black/8'} animate-pulse`} />
                  <div className={`w-12 h-4 rounded ${isDark ? 'bg-white/10' : 'bg-black/8'} animate-pulse`} />
                </div>
              ))}
            </div>
          ) : results.length > 0 ? (
            /* Results list */
            <ul ref={listRef} className="divide-y divide-white/8">
              {results.map((race, idx) => (
                <li key={`${race.season}-${race.round}`}>
                  <button
                    type="button"
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                      idx === activeIndex ? activeRowBg : 'hover:bg-white/4'
                    }`}
                    onClick={() => handleSelect(race)}
                  >
                    {/* Country flag */}
                    <div className="flex-shrink-0">
                      <CountryFlag country={race.country} size="sm" />
                    </div>

                    {/* Race name and country */}
                    <div className="flex-1 min-w-0">
                      <p className={`text-[14px] font-medium truncate ${isDark ? 'text-white' : 'text-black'}`}>
                        {race.raceName}
                      </p>
                      <p className={`text-[11px] ${isDark ? 'text-white/40' : 'text-black/40'}`}>
                        {race.country}
                      </p>
                    </div>

                    {/* Season and rating */}
                    <div className="flex-shrink-0 flex flex-col items-end gap-1">
                      <p className="text-[11px] text-gravel">{race.season}</p>
                      {race.log?.rating != null && (
                        <FlagRating
                          rating={race.log.rating}
                          size="sm"
                          interactive={false}
                        />
                      )}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          ) : query.trim().length >= 1 ? (
            /* Empty state */
            <p className={`px-4 py-8 text-[13px] text-gravel text-center`}>
              No races found for "{query}"
            </p>
          ) : null}
        </div>
      </div>
    </div>,
    document.body
  )
}
