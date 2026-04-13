/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        tarmac:     '#1E1E1E',
        amber:      '#F0A500',
        concrete:   '#F4F3EF',
        gravel:     '#7A7672',
        gold:       '#C9A84C',
        // CheckeredFlag light-mode rect (between concrete and gravel)
        pebble:     '#C8C6C0',
        // CheckeredFlag dark alternating square in gold treatment
        'gold-deep': '#7A5C1E',
      },
      letterSpacing: {
        display: '-0.03em',
        heading: '-0.02em',
      },
    },
  },
  plugins: [],
}
