// app/layout.tsx
import "./globals.css"
import type { Metadata, Viewport } from "next"

export const metadata: Metadata = {
  title: "xxx - Verdiene mehr mit deinem Content. Wir schützen, was dir wichtig ist.",
  description: "Die erste Plattform mit proaktivem Piracy-Schutz. Verdiene bis zu 88% + automatische Leak-Erkennung. EU-100% compliant.",
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" className="dark">
      <body>{children}</body>
    </html>
  )
}
