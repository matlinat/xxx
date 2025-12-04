// app/home/creator/earnings/page.tsx
import { DollarSign } from "lucide-react"

export default function CreatorEarningsPage() {
  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <DollarSign className="size-8 text-green-500" />
        <h1 className="text-2xl font-bold">Earnings</h1>
      </div>
      <p className="text-muted-foreground">
        Hier siehst du deine Einnahmen und kannst Auszahlungen verwalten.
      </p>
    </div>
  )
}

