// app/home/creator/media/page.tsx
import { FolderOpen } from "lucide-react"

export default function CreatorMediaPage() {
  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <FolderOpen className="size-8 text-blue-500" />
        <h1 className="text-2xl font-bold">Media Library</h1>
      </div>
      <p className="text-muted-foreground">
        Verwalte deine Bilder, Videos und anderen Medieninhalte.
      </p>
    </div>
  )
}

