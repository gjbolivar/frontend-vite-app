// tailwind.config.js
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2563eb',
        secondary: '#22c55e',
        accent: '#f59e0b',
        danger: '#ef4444',
        muted: '#f3f4f6',
        dark: '#1f2937',
      },
    },
  },
  safelist: [
    'from-blue-50', 'from-blue-100', 'from-blue-200',
    'from-indigo-500', 'via-indigo-600', 'to-purple-600',
    'bg-white/20', 'backdrop-blur-lg', 'border-white/30'
  ],
};


