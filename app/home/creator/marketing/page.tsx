// app/home/creator/marketing/page.tsx
import { Megaphone } from "lucide-react"

export default function CreatorMarketingPage() {
  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Megaphone className="size-8 text-orange-500" />
        <h1 className="text-2xl font-bold">Marketing</h1>
      </div>
      <p className="text-muted-foreground">
        Verwalte deine Promotions, Rabattaktionen und Marketing-Tools.
      </p>
    </div>
  )
}

