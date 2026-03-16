/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'cre-primary': '#1a365d',
        'cre-accent': '#ed8936',
        'cre-success': '#38a169',
        'cre-danger': '#e53e3e',
        'cre-warning': '#d69e2e',
        'cre-info': '#3182ce',
        'cre-bg': '#1a202c',
        'cre-surface': '#2d3748',
        'cre-border': '#4a5568',
      },
    },
  },
  plugins: [],
}
