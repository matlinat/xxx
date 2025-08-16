// app/(dashboard)/page.tsx
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"

export default function DashboardPage() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
      <p className="text-muted-foreground">
        Willkommen im geschützten Bereich. Diese Seite ist nur sichtbar, wenn du eingeloggt bist.
      </p>

      <Card>
        <CardHeader>
          <CardTitle>Dummy-Inhalt</CardTitle>
          <CardDescription>
            Dies ist ein Platzhalter mit shadcn/ui Komponenten.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Hier kannst du mit deinem eigenen Content starten. 
            Nutze <code>Card</code>, <code>Button</code> & Co., um dein Dashboard konsistent im shadcn-Stil zu gestalten.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
