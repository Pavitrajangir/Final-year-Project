export default {
  content: ['./index.html','./src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: '#06B6D4',
        'brand-dark': '#0891B2',
        surface: '#0F172A',
        'surface-2': '#1E293B',
        'surface-3': '#334155',
        accent: '#10B981',
        warn: '#F59E0B',
        danger: '#EF4444',
      },
      fontFamily: {
        display: ['"Plus Jakarta Sans"', 'sans-serif'],
        body: ['"DM Sans"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
