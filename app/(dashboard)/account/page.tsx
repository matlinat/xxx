import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"

export default function AccountPage() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Account</h1>
      <p className="text-muted-foreground">
        Verwalte deine persönlichen Daten und Profildetails.
      </p>

      <Card>
        <CardHeader>
          <CardTitle>Account-Einstellungen</CardTitle>
          <CardDescription>
            Dies ist ein Platzhalter. Hier kannst du später Profilfelder,
            Passwörter oder Avatar bearbeiten.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Verwende <code>Card</code>, <code>Input</code> und <code>Button</code>, 
            um deine Account-Verwaltung im Shadcn-Stil zu bauen.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
