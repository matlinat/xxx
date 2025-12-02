// app/(dashboard-subscriber)/page.tsx
export default function SubscriberDashboardPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Subscriber Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Willkommen im Abonnenten-Bereich. Hier finden Sie Ihre abonnierten Inhalte.
        </p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Platzhalter für zukünftige Inhalte */}
      </div>
    </div>
  )
}

