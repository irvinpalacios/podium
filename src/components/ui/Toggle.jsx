/**
 * Toggle
 *
 * Custom toggle switch — not a native checkbox.
 *
 * Track:  36×20px, rounded-full
 *         on  → amber background
 *         off → transparent with muted border
 *
 * Thumb:  16×16px white circle
 *         off → left-[2px]
 *         on  → left-[18px]
 *         transition-all duration-150
 *
 * Props
 *   checked  (boolean)  — current state
 *   onChange (function) — called with new boolean value
 */
export default function Toggle({ checked = false, onChange }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange?.(!checked)}
      // Outer track
      className={[
        'relative inline-flex items-center',
        'w-9 h-5 rounded-full',           // 36×20 px
        'transition-all duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber/60',
        checked
          ? 'bg-amber border-0'
          : 'bg-transparent border border-gravel/50',
      ].join(' ')}
    >
      {/* Thumb */}
      <span
        className={[
          'absolute top-[2px]',
          'w-4 h-4 rounded-full bg-white',  // 16×16 px
          'transition-all duration-150',
          'shadow-sm',
          checked ? 'left-[18px]' : 'left-[2px]',
        ].join(' ')}
      />
    </button>
  )
}
