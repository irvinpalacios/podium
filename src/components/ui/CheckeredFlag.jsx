/**
 * CheckeredFlag
 *
 * 3×3 grid of alternating squares inside a rounded rect.
 *
 * Props
 *   size   (number)  — tile size in px
 *   filled (boolean) — solid vs ghost
 *   gold   (boolean) — gold treatment; takes priority over filled
 *
 * Dark-mode aware: add class="dark" to an ancestor to switch to the dark treatment.
 */
export default function CheckeredFlag({ size = 10, filled = false, gold = false }) {
  const p  = size * 0.1           // padding — 10% of tile on each side
  const sq = (size - 2 * p) / 3  // inner square size, per spec formula
  const rx = size / 5             // corner radius, per spec
  const isGhost = !filled && !gold

  // Outer rect class
  // Ghost:        transparent + muted gravel border
  // Filled light: pebble (#C8C6C0)  |  Filled dark: tarmac (#1E1E1E)
  // Gold:         gold (#C9A84C)
  const rectClass = gold
    ? 'fill-gold'
    : filled
      ? 'fill-pebble dark:fill-tarmac'
      : 'fill-none stroke-gravel/40'

  // Square fill per grid position
  // The "dark" square is the same colour as the rect → invisible → checkerboard illusion.
  // Ghost: all 9 squares get the same low-opacity tint.
  const squareClass = (r, c) => {
    const isLight = (r + c) % 2 === 0
    if (isGhost)  return 'fill-gravel/20'
    if (gold)     return isLight ? 'fill-white' : 'fill-gold-deep'
    return isLight ? 'fill-white' : 'fill-pebble dark:fill-tarmac'
  }

  // Ghost rect is inset 0.5px so the 1px stroke doesn't clip at the SVG edge
  const inset = isGhost ? 0.5 : 0

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      aria-hidden="true"
      style={{ flexShrink: 0, display: 'block' }}
    >
      <rect
        x={inset}
        y={inset}
        width={size - inset * 2}
        height={size - inset * 2}
        rx={rx}
        className={rectClass}
        strokeWidth={isGhost ? 1 : 0}
      />

      {[0, 1, 2].flatMap(r =>
        [0, 1, 2].map(c => (
          <rect
            key={`${r}-${c}`}
            x={p + c * sq}
            y={p + r * sq}
            width={sq}
            height={sq}
            className={squareClass(r, c)}
          />
        ))
      )}
    </svg>
  )
}
