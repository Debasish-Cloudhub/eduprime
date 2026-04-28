/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#e6f0fd',
          100: '#cce0fb',
          500: '#0575e6',
          600: '#0460c4',
          700: '#034ea2',
          800: '#022b6b',
          900: '#021b79',
        },
        success: { 500: '#22c55e', 100: '#dcfce7' },
        warning: { 500: '#f59e0b', 100: '#fef3c7' },
        danger:  { 500: '#ef4444', 100: '#fee2e2' },
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #0575e6 0%, #021b79 100%)',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
      },
    },
  },
  plugins: [],
};
