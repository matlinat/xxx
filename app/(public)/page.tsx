"use client"

import * as React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DollarSign,
  Shield,
  Scale,
  Rocket,
  Lock,
  UserCheck,
  Check,
  X,
  Clock,
  TrendingUp,
  Mail,
  Phone,
  Calculator,
} from "lucide-react"

function EarningsCalculator() {
  const [revenue, setRevenue] = React.useState(2000)
  const [subscribers, setSubscribers] = React.useState(200)

  const ofEarnings = revenue * 0.8
  const csEarnings = revenue * 0.88
  const difference = csEarnings - ofEarnings
  const yearlyDifference = difference * 12

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4">
      <h2 className="text-center text-2xl font-bold sm:text-3xl md:text-4xl">Wie viel mehr du verdienst</h2>
      <Card className="mt-8 md:mt-12">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Calculator className="size-5 text-primary" />
            <CardTitle>Einnahmen-Rechner</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-2">
            {/* Revenue Slider */}
            <div className="space-y-4">
              <Label htmlFor="revenueSlider" className="text-base font-semibold">
                Monatlicher Umsatz
              </Label>
              <input
                type="range"
                id="revenueSlider"
                min="100"
                max="10000"
                value={revenue}
                step="100"
                onChange={(e) => setRevenue(parseInt(e.target.value))}
                className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                style={{
                  background: `linear-gradient(to right, hsl(var(--primary)) 0%, hsl(var(--primary)) ${((revenue - 100) / (10000 - 100)) * 100}%, hsl(var(--muted)) ${((revenue - 100) / (10000 - 100)) * 100}%, hsl(var(--muted)) 100%)`,
                }}
              />
              <div className="text-center">
                <div className="text-2xl font-bold text-primary sm:text-3xl">
                  {formatCurrency(revenue)}
                </div>
              </div>
            </div>

            {/* Subscribers Input */}
            <div className="space-y-4">
              <Label htmlFor="subscribers" className="text-base font-semibold">
                Abonnenten
              </Label>
              <Input
                id="subscribers"
                type="number"
                value={subscribers}
                min="10"
                max="5000"
                onChange={(e) => setSubscribers(parseInt(e.target.value) || 0)}
                className="text-center text-lg font-semibold"
              />
            </div>
          </div>

          {/* Results */}
          <div className="rounded-lg border bg-muted/50 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">OnlyFans Einnahmen (80%):</span>
              <strong className="text-lg">{formatCurrency(ofEarnings)}</strong>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">CreatorSafe Einnahmen (88%):</span>
              <strong className="text-lg text-primary">{formatCurrency(csEarnings)}</strong>
            </div>
            <div className="border-t pt-4 space-y-2">
              <div className="flex items-center justify-between text-base">
                <span className="font-medium">Mehr pro Monat:</span>
                <strong className="text-lg text-primary">
                  +{formatCurrency(difference)}
                </strong>
              </div>
              <div className="flex items-center justify-between text-base">
                <span className="font-medium">Mehr pro Jahr:</span>
                <strong className="text-lg text-primary">
                  +{formatCurrency(yearlyDifference)}
                </strong>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function Page() {
  return (
    <main className="flex flex-col">
      {/* Hero Section */}
      <section className="mx-auto w-full max-w-6xl px-4 py-12 md:py-16 lg:py-20">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl lg:text-6xl">
            Dein Content. Deine Kontrolle.
            <br />
            88% mehr in deiner Tasche.
          </h1>
          <p className="mt-4 text-base text-muted-foreground sm:text-lg md:mt-6 md:text-xl lg:max-w-3xl lg:mx-auto">
            Die erste Plattform mit <strong>proaktivem Piracy-Schutz</strong>. Verdiene bis zu 88% und schlafe ruhig,
            während wir deine Inhalte 24/7 vor Leaks schützen. EU-100% compliant.
          </p>
          <div className="mt-6 md:mt-8">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link href="/signup">Konto erstellen – Keine Kreditkarte nötig</Link>
            </Button>
            <p className="mt-4 text-sm text-muted-foreground">
              Keine monatlichen Gebühren. Nur 12-15% auf deine Einnahmen.
            </p>
          </div>

          {/* Stats */}
          <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-4 md:mt-16">
            <div className="rounded-lg border bg-card p-4 text-center">
              <div className="text-2xl font-bold text-primary sm:text-3xl">bis zu 88%</div>
              <div className="mt-1 text-xs text-muted-foreground sm:text-sm">Creator Payout</div>
            </div>
            <div className="rounded-lg border bg-card p-4 text-center">
              <div className="text-2xl font-bold text-primary sm:text-3xl">24/7</div>
              <div className="mt-1 text-xs text-muted-foreground sm:text-sm">Leak Protection</div>
            </div>
            <div className="rounded-lg border bg-card p-4 text-center">
              <div className="text-2xl font-bold text-primary sm:text-3xl">€0</div>
              <div className="mt-1 text-xs text-muted-foreground sm:text-sm">Monatliche Kosten</div>
            </div>
            <div className="rounded-lg border bg-card p-4 text-center">
              <div className="text-2xl font-bold text-primary sm:text-3xl">7 Tage</div>
              <div className="mt-1 text-xs text-muted-foreground sm:text-sm">bis zur Auszahlung</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="w-full border-t bg-muted/30 py-12 md:py-16 lg:py-20">
        <div className="mx-auto w-full max-w-6xl px-4">
          <h2 className="text-center text-2xl font-bold sm:text-3xl md:text-4xl">Wieso CreatorSafe anders ist</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 md:mt-12">
            <Card>
              <CardHeader>
                <DollarSign className="mb-2 size-8 text-primary" />
                <CardTitle>Mehr Geld für dich</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Verdiene bis zu 88% - nicht nur 80% wie bei anderen Plattformen. Unser Volume-Based Payout System belohnt deinen Erfolg.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Shield className="mb-2 size-8 text-primary" />
                <CardTitle>Digital Rights Armor™</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Unsere KI sucht permanent nach geleakten Inhalten und startet automatisch DMCA-Takedowns. Dein Content ist sicher.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Scale className="mb-2 size-8 text-primary" />
                <CardTitle>EU-Rechtssicher</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Vollständig GDPR-konform mit deutscher GmbH. Keine Angst vor Kontosperrungen oder eingefrorenen Geldern.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Rocket className="mb-2 size-8 text-primary" />
                <CardTitle>Modernes Interface</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Intuitive Oberfläche, erweiterte Analytics und Tools, die dir Zeit sparen und dein Business wachsen lassen.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Lock className="mb-2 size-8 text-primary" />
                <CardTitle>Sichere Auszahlungen</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Wöchentliche Payouts auf dein Bankkonto. Dein Geld ist durch unser Escrow-System geschützt.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <UserCheck className="mb-2 size-8 text-primary" />
                <CardTitle>Persönlicher Support</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Keine Bot-Antworten. Unser deutschsprachiges Support-Team hilft dir innerhalb von Stunden.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section id="comparison" className="border-t py-12 md:py-16 lg:py-20">
        <div className="mx-auto w-full max-w-6xl px-4">
          <h2 className="text-center text-2xl font-bold sm:text-3xl md:text-4xl">Der faire Vergleich</h2>
          <div className="mt-8 md:mt-12">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[150px]">Feature</TableHead>
                    <TableHead className="text-center">CreatorSafe</TableHead>
                    <TableHead className="text-center">OnlyFans</TableHead>
                    <TableHead className="text-center">Fansly</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Creator Payout</TableCell>
                    <TableCell className="text-center">
                      <span className="text-primary font-semibold">Bis zu 88%</span>
                    </TableCell>
                    <TableCell className="text-center">80%</TableCell>
                    <TableCell className="text-center">80%</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Automatischer Piracy-Schutz</TableCell>
                    <TableCell className="text-center">
                      <Check className="mx-auto size-5 text-primary" />
                    </TableCell>
                    <TableCell className="text-center">
                      <X className="mx-auto size-5 text-muted-foreground" />
                    </TableCell>
                    <TableCell className="text-center">
                      <X className="mx-auto size-5 text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Wöchentliche Auszahlungen</TableCell>
                    <TableCell className="text-center">
                      <Check className="mx-auto size-5 text-primary" />
                    </TableCell>
                    <TableCell className="text-center text-muted-foreground">Mind. 21 Tage</TableCell>
                    <TableCell className="text-center text-muted-foreground">7-14 Tage</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">EU-Datenschutz</TableCell>
                    <TableCell className="text-center">
                      <span className="text-primary font-semibold">Deutsche GmbH</span>
                    </TableCell>
                    <TableCell className="text-center text-muted-foreground">UK/US Firma</TableCell>
                    <TableCell className="text-center text-muted-foreground">US Firma</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Content-Wasserzeichen</TableCell>
                    <TableCell className="text-center">
                      <Check className="mx-auto size-5 text-primary" />
                    </TableCell>
                    <TableCell className="text-center">
                      <X className="mx-auto size-5 text-muted-foreground" />
                    </TableCell>
                    <TableCell className="text-center">
                      <X className="mx-auto size-5 text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Monatliche Gebühren</TableCell>
                    <TableCell className="text-center">
                      <span className="text-primary font-semibold">€0</span>
                    </TableCell>
                    <TableCell className="text-center">€0</TableCell>
                    <TableCell className="text-center">€0</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Transaktionsgebühr</TableCell>
                    <TableCell className="text-center">12-15%</TableCell>
                    <TableCell className="text-center text-muted-foreground">20% + versteckte Gebühren</TableCell>
                    <TableCell className="text-center text-muted-foreground">20%</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="w-full border-t bg-muted/30 py-12 md:py-16 lg:py-20">
        <div className="mx-auto w-full max-w-6xl px-4">
          <h2 className="text-center text-2xl font-bold sm:text-3xl md:text-4xl">Was Creator sagen</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 md:mt-12">
            <Card>
              <CardContent className="pt-6">
                <p className="mb-4 text-sm text-muted-foreground">
                  "Nachdem meine Videos monatelang geleakt wurden, hat CreatorSafe mir endlich Ruhe gebracht. Die automatischen DMCA-Takedowns sind ein Game-Changer!"
                </p>
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                    LS
                  </div>
                  <div>
                    <div className="font-semibold">Lena S.</div>
                    <div className="text-xs text-muted-foreground">Cosplay Creator</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <p className="mb-4 text-sm text-muted-foreground">
                  "Die wöchentlichen Auszahlungen haben meine Cashflow-Probleme gelöst. Endlich muss ich nicht mehr 3 Wochen auf mein Geld warten."
                </p>
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                    MJ
                  </div>
                  <div>
                    <div className="font-semibold">Maria J.</div>
                    <div className="text-xs text-muted-foreground">Fitness Creator</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <p className="mb-4 text-sm text-muted-foreground">
                  "Als deutsche Creatorin fühle ich mich hier rechtlich sicher. Die GDPR-Konformität und der deutsche Support machen den Unterschied."
                </p>
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                    SK
                  </div>
                  <div>
                    <div className="font-semibold">Sarah K.</div>
                    <div className="text-xs text-muted-foreground">Boudoir Fotografin</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Earnings Calculator */}
      <section id="pricing" className="border-t py-12 md:py-16 lg:py-20">
        <EarningsCalculator />
      </section>

      {/* CTA Section */}
      <section className="border-t bg-primary/5 py-12 md:py-16 lg:py-20">
        <div className="mx-auto w-full max-w-4xl px-4 text-center">
          <h2 className="text-2xl font-bold sm:text-3xl md:text-4xl">Starte noch heute sicher durch</h2>
          <p className="mt-4 text-base text-muted-foreground sm:text-lg md:mt-6">
            Jetzt anmelden und zu den ersten 100 Creatorn gehören, die exklusiv 90% Payout für die ersten 6 Monate erhalten.
          </p>
          <Button asChild size="lg" className="mt-6 w-full sm:w-auto">
            <Link href="/signup">Kostenlos registrieren →</Link>
          </Button>
          <p className="mt-5 text-sm text-muted-foreground">
            Keine versteckten Gebühren. Keine monatlichen Kosten. Nur fairer Anteil an deinem Erfolg.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="border-t py-12 md:py-16 lg:py-20">
        <div className="mx-auto w-full max-w-3xl px-4">
          <h2 className="text-center text-2xl font-bold sm:text-3xl md:text-4xl">Häufige Fragen</h2>
          <div className="mt-8 md:mt-12">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="piracy">
                <AccordionTrigger>Wie funktioniert der Piracy-Schutz?</AccordionTrigger>
                <AccordionContent>
                  Jedes Video erhält individuelle, unsichtbare Wasserzeichen. Unsere KI durchsucht täglich das Internet nach deinen Inhalten und startet automatisch DMCA-Takedowns, bevor du überhaupt davon erfährst.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="payouts">
                <AccordionTrigger>Wann erhalte ich meine Auszahlungen?</AccordionTrigger>
                <AccordionContent>
                  Jeden Montag werden alle verfügbaren Guthaben (ab €50) automatisch auf dein Bankkonto überwiesen. Das Geld wird 7 Tage gesichert, bevor es zur Auszahlung freigegeben wird.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="costs">
                <AccordionTrigger>Was kostet mich CreatorSafe?</AccordionTrigger>
                <AccordionContent>
                  Nichts außer einem fairen Anteil an deinen Einnahmen: 12-15% je nach Volumen. Keine monatlichen Gebühren, keine Setup-Kosten, keine versteckten Gebühren.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="privacy">
                <AccordionTrigger>Ist meine Privatsphäre geschützt?</AccordionTrigger>
                <AccordionContent>
                  Ja. Alle Daten werden in der EU gespeichert, verschlüsselt und sind GDPR-konform. Wir geben keine Daten an Dritte weiter und unterstützen vollständige Account-Löschung auf Wunsch.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="parallel">
                <AccordionTrigger>Kann ich parallel zu OnlyFans nutzen?</AccordionTrigger>
                <AccordionContent>
                  Absolut! Viele Creator nutzen CreatorSafe als zusätzliche Einnahmequelle. Unsere Tools machen das Cross-Posting einfach.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="border-t py-12 md:py-16 lg:py-20">
        <div className="mx-auto w-full max-w-4xl px-4">
          <div className="rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 p-8 text-center dark:from-green-950/20 dark:to-emerald-950/20 md:p-12 lg:p-16">
            <h2 className="text-2xl font-bold sm:text-3xl md:text-4xl">Bereit für den Wechsel?</h2>
            <p className="mt-4 text-base text-muted-foreground sm:text-lg md:mt-6 md:text-xl">
              Über 200 Creator haben schon gewechselt. Jetzt bist du dran.
            </p>
            <Button asChild size="lg" className="mt-6 w-full sm:w-auto">
              <Link href="/signup">Kostenloses Konto erstellen</Link>
            </Button>
            <p className="mt-5 text-sm text-muted-foreground">
              Du hast Fragen?{" "}
              <Link href="#contact" className="text-primary underline underline-offset-4 hover:no-underline">
                Buche ein persönliches Onboarding
              </Link>
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full border-t bg-muted/30 py-12 md:py-16">
        <div className="mx-auto w-full max-w-6xl px-4">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
            <div className="lg:col-span-2">
              <div className="mb-4 text-xl font-bold">CreatorSafe</div>
              <p className="text-sm text-muted-foreground">
                Die sichere Plattform für Creator. Mehr Einnahmen, besserer Schutz.
              </p>
            </div>

            <div>
              <h3 className="mb-4 font-semibold">Für Creator</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/features" className="text-muted-foreground hover:text-foreground transition-colors">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="/pricing" className="text-muted-foreground hover:text-foreground transition-colors">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="/success-stories" className="text-muted-foreground hover:text-foreground transition-colors">
                    Erfolgsgeschichten
                  </Link>
                </li>
                <li>
                  <Link href="/blog" className="text-muted-foreground hover:text-foreground transition-colors">
                    Blog & Tipps
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="mb-4 font-semibold">Rechtliches</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
                    Datenschutz
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="text-muted-foreground hover:text-foreground transition-colors">
                    AGB
                  </Link>
                </li>
                <li>
                  <Link href="/compliance" className="text-muted-foreground hover:text-foreground transition-colors">
                    Compliance
                  </Link>
                </li>
                <li>
                  <Link href="/imprint" className="text-muted-foreground hover:text-foreground transition-colors">
                    Impressum
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="mb-4 font-semibold">Kontakt</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href="mailto:support@creatorsafe.com"
                    className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Mail className="size-4" />
                    support@creatorsafe.com
                  </Link>
                </li>
                <li>
                  <Link
                    href="tel:+49123456789"
                    className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Phone className="size-4" />
                    +49 123 456789
                  </Link>
                </li>
                <li className="mt-4 text-xs text-muted-foreground">
                  CreatorSafe GmbH
                  <br />
                  Musterstraße 123
                  <br />
                  10115 Berlin, Deutschland
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} CreatorSafe GmbH. Alle Rechte vorbehalten.
          </div>
        </div>
      </footer>
    </main>
  )
}
