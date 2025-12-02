// app/(dashboard-creator)/page.tsx
export default function CreatorDashboardPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Creator Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Willkommen im Creator-Bereich. Hier können Sie Ihre Inhalte verwalten.
        </p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Platzhalter für zukünftige Inhalte */}
      </div>
    </div>
  )
}

