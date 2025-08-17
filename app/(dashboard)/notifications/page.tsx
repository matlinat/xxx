import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"

export default function NotificationsPage() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
      <p className="text-muted-foreground">
        Passe deine Benachrichtigungseinstellungen an.
      </p>

      <Card>
        <CardHeader>
          <CardTitle>Benachrichtigungen</CardTitle>
          <CardDescription>
            Dies ist ein Platzhalter. Hier kannst du später E-Mail- und 
            Push-Einstellungen konfigurieren.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Typische Komponenten hier: <code>Switch</code>, <code>Checkbox</code>, 
            <code>Radio</code>.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
