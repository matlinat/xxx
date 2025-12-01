"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"

export default function Page() {
  return (
    <main className="flex flex-col">
      {/* Hero */}
      <section className="mx-auto max-w-5xl px-4 py-12 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          ProductPhotoPop
        </h1>
        <p className="mt-3 text-lg text-muted-foreground max-w-2xl mx-auto">
          Entferne Hintergründe in Sekunden. Perfekt für Shopify, Amazon & Co.
        </p>
        <div className="mt-6 flex justify-center">
          <Button asChild size="lg">
            <a href="/login">Jetzt starten</a>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} ProductPhotoPop – Alle Rechte vorbehalten.
      </footer>
    </main>
  )
}
