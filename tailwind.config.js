// tailwind.config.js
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2563eb',   // azul vivo
        secondary: '#22c55e', // verde
        accent: '#f59e0b',    // naranja
        danger: '#ef4444',
        muted: '#f3f4f6',
        dark: '#1f2937',
      },
    },
  },
  plugins: [],
};

