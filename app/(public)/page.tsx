"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { ProductTool } from "@/components/product-tool"
import { Zap, Wand2, Cloud, ShieldCheck } from "lucide-react"

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
            <a href="#tool">Kostenlos testen</a>
          </Button>
        </div>
      </section>

      {/* Tool */}
      <section id="tool" className="mx-auto w-full max-w-5xl px-4 py-8 space-y-8">
        <ProductTool />
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-10">Features</h2>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Wand2, title: "Schnell & einfach", text: "Hintergründe in wenigen Sekunden entfernt." },
            { icon: Zap, title: "Hohe Qualität", text: "Kristallklare Ergebnisse mit KI-gestützter Präzision." },
            { icon: Cloud, title: "Cloud-basiert", text: "Kein Download, funktioniert direkt im Browser." },
            { icon: ShieldCheck, title: "DSGVO-konform", text: "Deine Daten bleiben sicher in der EU." },
          ].map((f, i) => (
            <Card key={i}>
              <CardHeader>
                <f.icon className="size-8 text-primary mb-2" />
                <CardTitle>{f.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">{f.text}</CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Showcase */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-10">Beispiele</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {["/demo1.jpg", "/demo2.jpg", "/demo3.jpg"].map((src, i) => (
            <Card key={i} className="overflow-hidden">
              <img src={src} alt={`Beispiel ${i + 1}`} className="object-cover w-full h-64" />
            </Card>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-10">Preise</h2>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { title: "Kostenlos", price: "€0", features: ["5 Bilder / Monat", "Basis-Qualität"] },
            { title: "Pro", price: "€19/Monat", features: ["Unlimitiert", "HD-Ergebnisse", "Priorisierte Verarbeitung"] },
            { title: "Business", price: "€49/Monat", features: ["Teamzugang", "API-Nutzung", "Premium Support"] },
          ].map((plan, i) => (
            <Card key={i} className="flex flex-col">
              <CardHeader>
                <CardTitle>{plan.title}</CardTitle>
                <p className="text-2xl font-bold">{plan.price}</p>
              </CardHeader>
              <CardContent className="flex-1 space-y-2 text-muted-foreground">
                <ul className="space-y-1">
                  {plan.features.map((f, j) => (
                    <li key={j}>• {f}</li>
                  ))}
                </ul>
                <Button className="w-full mt-4">Jetzt starten</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-10">FAQ</h2>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="q1">
            <AccordionTrigger>Wie funktioniert ProductPhotoPop?</AccordionTrigger>
            <AccordionContent>
              Lade einfach dein Bild hoch, wir entfernen den Hintergrund automatisch.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="q2">
            <AccordionTrigger>Kann ich es kostenlos testen?</AccordionTrigger>
            <AccordionContent>
              Ja! Du kannst sofort kostenlos Bilder hochladen und bearbeiten.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="q3">
            <AccordionTrigger>Ist das Tool DSGVO-konform?</AccordionTrigger>
            <AccordionContent>
              Ja, alle Daten werden sicher verarbeitet und in der EU gespeichert.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>

      {/* Footer */}
      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} ProductPhotoPop – Alle Rechte vorbehalten.
      </footer>
    </main>
  )
}
