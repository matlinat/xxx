import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, CheckCircle2 } from "lucide-react"

export default function ConfirmPage() {
  return (
    <div className="bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-primary/10">
              <Mail className="size-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Bestätige deine E-Mail</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-center text-sm text-muted-foreground">
              Wir haben dir eine Bestätigungs-E-Mail gesendet. Bitte öffne dein Postfach und klicke auf den Link in der E-Mail, um dein Konto zu aktivieren.
            </p>
            <div className="rounded-lg border bg-muted/50 p-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 size-5 text-primary shrink-0" />
                <div className="space-y-1 text-sm">
                  <p className="font-medium">Nächste Schritte:</p>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Öffne dein E-Mail-Postfach</li>
                    <li>Suche nach der E-Mail von uns</li>
                    <li>Klicke auf den Bestätigungslink</li>
                    <li>Melde dich dann mit deinem Konto an</li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="pt-4 space-y-2">
              <Button asChild className="w-full">
                <Link href="/login">Zur Anmeldung</Link>
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                Keine E-Mail erhalten?{" "}
                <Link href="/signup" className="text-primary underline underline-offset-4 hover:no-underline">
                  Erneut registrieren
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

