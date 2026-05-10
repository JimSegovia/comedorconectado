/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#10b981', // Emerald-500 (Vibrant)
          light: '#34d399', // Emerald-400
          dark: '#059669', // Emerald-600
        },
        surface: {
          DEFAULT: '#ffffff',
          dim: '#f3f4f6', // Gray-100
        },
        text: {
          DEFAULT: '#1f2937', // Gray-800
          muted: '#6b7280', // Gray-500
        },
        border: '#e5e7eb', // Gray-200
        danger: '#ef4444', // Red-500
        warning: '#f59e0b', // Amber-500
        success: '#10b981', // Emerald-500
      }
    },
  },
  plugins: [],
}
