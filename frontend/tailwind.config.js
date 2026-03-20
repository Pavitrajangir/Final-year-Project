export default {
  content: ['./index.html','./src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#0EA5E9',
        'primary-dark': '#0284C7',
        secondary: '#6366F1',
        accent: '#10B981',
      },
      fontFamily: {
        sora: ['Sora','sans-serif'],
        body: ['DM Sans','sans-serif'],
      },
      gridTemplateColumns: {
        auto: 'repeat(auto-fill, minmax(180px, 1fr))',
      },
    },
  },
  plugins: [],
}
