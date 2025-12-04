// components/home-footer.tsx
import Link from "next/link"
import { Mail, Phone } from "lucide-react"

export function HomeFooter() {
  return (
    <footer className="w-full border-t bg-muted/30 py-12 md:py-16">
      <div className="mx-auto w-full max-w-6xl px-4">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <div className="mb-4 text-xl font-bold">SaucySilk</div>
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
                  href="mailto:support@saucysilk.com"
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Mail className="size-4" />
                  support@saucysilk.com
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
                SaucySilk GmbH
                <br />
                Musterstraße 123
                <br />
                10115 Berlin, Deutschland
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} SaucySilk GmbH. Alle Rechte vorbehalten.
        </div>
      </div>
    </footer>
  )
}

