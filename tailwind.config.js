/** @type {import('tailwindcss').Config} */
export default {
  // Tailwind v4 verwendet CSS-basierte Konfiguration
  // Die Hauptkonfiguration befindet sich in app/globals.css
  // Diese Datei wird hauptsächlich für shadcn CLI-Tools benötigt
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
}

