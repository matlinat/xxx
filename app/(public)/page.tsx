"use client"

import * as React from "react"

export default function Page() {
  return (
    <main className="flex flex-col">
      {/* Footer */}
      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} ProductPhotoPop – Alle Rechte vorbehalten.
      </footer>
    </main>
  )
}
