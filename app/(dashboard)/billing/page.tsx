import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"

export default function BillingPage() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Billing</h1>
      <p className="text-muted-foreground">
        Überblick über Abrechnung, Rechnungen und Zahlungsdetails.
      </p>

      <Card>
        <CardHeader>
          <CardTitle>Abrechnungsinformationen</CardTitle>
          <CardDescription>
            Dies ist ein Platzhalter. Hier kannst du später Rechnungen anzeigen 
            oder Zahlungsmethoden verwalten.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Nutze Tabellen oder Listen, um deine Rechnungen darzustellen.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
