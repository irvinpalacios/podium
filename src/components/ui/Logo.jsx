/**
 * Logo
 *
 * Podium podium-bar mark. Three bars representing P3, P2, P1 positions.
 *
 * ViewBox: 0 0 32 28
 *   P3 bar: x=0  y=18  w=8  h=10  rx=1.5
 *   P2 bar: x=12 y=10  w=8  h=18  rx=1.5
 *   P1 bar: x=24 y=4   w=8  h=24  rx=1.5  — always amber
 *
 * P3 + P2 fill:
 *   dark  theme → white
 *   light theme → tarmac
 *
 * Props
 *   size  (number)           — rendered width in px; height scales proportionally
 *   theme ('dark' | 'light') — controls P2/P3 colour; caller decides, not CSS dark mode
 */
export default function Logo({ size = 32, theme = 'dark' }) {
  // ViewBox is 32×28, so height scales proportionally
  const height = Math.round(size * (28 / 32))

  // P2/P3 fill via Tailwind fill utilities — no hardcoded hex values
  const p23Class = theme === 'dark' ? 'fill-white' : 'fill-tarmac'

  return (
    <svg
      width={size}
      height={height}
      viewBox="0 0 32 28"
      aria-label="Podium"
      role="img"
    >
      {/* P3 — shortest bar, leftmost */}
      <rect x="0"  y="18" width="8" height="10" rx="1.5" className={p23Class} />
      {/* P2 — middle bar */}
      <rect x="12" y="10" width="8" height="18" rx="1.5" className={p23Class} />
      {/* P1 — tallest bar, rightmost, always amber */}
      <rect x="24" y="4"  width="8" height="24" rx="1.5" className="fill-amber" />
    </svg>
  )
}
