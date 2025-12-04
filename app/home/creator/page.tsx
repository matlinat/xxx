// app/home/creator/page.tsx
import { LayoutDashboard } from "lucide-react"

export default function CreatorDashboardPage() {
  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <LayoutDashboard className="size-8 text-purple-500" />
        <h1 className="text-2xl font-bold">Dashboard</h1>
      </div>
      <p className="text-muted-foreground">
        Willkommen in deinem Creator Dashboard. Hier siehst du eine Übersicht deiner Aktivitäten.
      </p>
    </div>
  )
}

