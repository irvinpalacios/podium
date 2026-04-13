/**
 * CountryFlag
 *
 * Renders an SVG country flag from the flag-icons package, sized and shaped
 * per the Podium spec. Falls back gracefully when the country isn't in the
 * lookup table.
 *
 * Props
 *   country (string)          — Ergast circuit country name (e.g. 'United Kingdom')
 *   size    ('sm' | 'md')     — sm: 22×15px  md: 28×19px
 *   dimmed  (boolean)         — opacity-35 for unlogged race cards
 */
import 'flag-icons/css/flag-icons.min.css'
import { COUNTRY_TO_ISO } from '../../utils/countryFlags'

const DIMENSIONS = {
  sm: { width: 22, height: 15 },
  md: { width: 28, height: 19 },
}

export default function CountryFlag({ country, size = 'sm', dimmed = false }) {
  const { width, height } = DIMENSIONS[size] ?? DIMENSIONS.sm
  const iso = COUNTRY_TO_ISO[country]

  return (
    <div
      style={{ width, height, minWidth: width }}
      className={[
        'rounded-sm overflow-hidden border border-black/10',
        'inline-flex items-center justify-center bg-gravel/20',
        dimmed ? 'opacity-35' : '',
      ].join(' ')}
    >
      {iso ? (
        <span
          className={`fi fi-${iso}`}
          style={{
            // flag-icons renders at em-based width; force it to fill the container
            width,
            height,
            display: 'block',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
      ) : (
        // Fallback: neutral grey tile with a muted "?" — only shown for unmapped countries
        <span className="text-[8px] text-gravel/60 font-medium leading-none select-none">
          ?
        </span>
      )}
    </div>
  )
}
