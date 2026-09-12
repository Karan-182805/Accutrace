/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gov: {
          navy: '#0f2942',
          blue: '#1e3a8a',
          accent: '#2563eb',
          light: '#f4f6f9',
          border: '#e2e8f0',
        },
        status: {
          compliant: '#16a34a',
          compliantBg: '#f0fdf4',
          violation: '#dc2626',
          violationBg: '#fef2f2',
          review: '#d97706',
          reviewBg: '#fffbeb',
        }
      }
    },
  },
  plugins: [],
}
