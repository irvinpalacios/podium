/**
 * FlagRating
 *
 * Five CheckeredFlag tiles in a row. Wraps CheckeredFlag and manages the
 * filled / gold states based on the current rating.
 *
 * Props
 *   rating      (number 1–5 | null) — current rating; null = no rating set
 *   interactive (boolean)           — if true, tiles are tappable
 *   size        ('sm'|'md'|'lg')    — sm=10px  md=28px  lg=34px
 *   onChange    (function)          — called with new rating (number); interactive only
 */
import CheckeredFlag from './CheckeredFlag'

const SIZE_MAP = { sm: 10, md: 28, lg: 34 }

export default function FlagRating({
  rating      = null,
  interactive = false,
  size        = 'sm',
  onChange,
}) {
  const px      = SIZE_MAP[size] ?? SIZE_MAP.sm
  const isGold  = rating === 5

  return (
    <div className="flex items-center gap-1" role={interactive ? 'group' : undefined}>
      {[1, 2, 3, 4, 5].map(n => {
        const filled = rating !== null && n <= rating
        const gold   = filled && isGold

        if (!interactive) {
          return (
            <CheckeredFlag key={n} size={px} filled={filled} gold={gold} />
          )
        }

        return (
          <button
            key={n}
            type="button"
            aria-label={`Rate ${n} out of 5`}
            aria-pressed={n === rating}
            onClick={() => onChange?.(n)}
            // Remove default button chrome; let CheckeredFlag supply the visual
            className="p-0 border-0 bg-transparent cursor-pointer leading-none"
            style={{ lineHeight: 0 }}
          >
            <CheckeredFlag size={px} filled={filled} gold={gold} />
          </button>
        )
      })}
    </div>
  )
}
