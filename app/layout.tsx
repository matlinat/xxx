// app/layout.tsx
import "./globals.css"
import type { Metadata } from "next"
import { SiteHeader } from "@/components/site-header"

export const metadata: Metadata = {
  title: "ProductPhotoPop",
  description: "Entferne Hintergründe in Sekunden – ohne Tailwind/shadcn.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="de" className="dark">
      <body>
        <SiteHeader />
        <main>{children}</main>
      </body>
    </html>
  )
}
