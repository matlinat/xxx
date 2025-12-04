// app/home/creator/statistics/page.tsx
import { BarChart3 } from "lucide-react"

export default function CreatorStatisticsPage() {
  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <BarChart3 className="size-8 text-indigo-500" />
        <h1 className="text-2xl font-bold">Statistics</h1>
      </div>
      <p className="text-muted-foreground">
        Analysiere deine Performance mit detaillierten Statistiken und Insights.
      </p>
    </div>
  )
}

