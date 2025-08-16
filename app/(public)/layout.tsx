// app/(public)/layout.tsx
import { SiteHeader } from "@/components/site-header"

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl px-4">{children}</main>
    </>
  )
}
