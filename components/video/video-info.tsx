"use client"

import { Badge } from "@/components/ui/badge"
import { Eye, Calendar } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { de } from "date-fns/locale/de"

interface VideoInfoProps {
  title: string
  description?: string
  views: number
  uploadDate: Date | string
  category: string
}

export function VideoInfo({ title, description, views, uploadDate, category }: VideoInfoProps) {
  const formattedDate = typeof uploadDate === "string" 
    ? formatDistanceToNow(new Date(uploadDate), { addSuffix: true, locale: de })
    : formatDistanceToNow(uploadDate, { addSuffix: true, locale: de })

  const formattedViews = new Intl.NumberFormat("de-DE").format(views)

  return (
    <div className="space-y-4">
      {/* Title */}
      <h1 className="text-2xl md:text-3xl font-bold text-foreground">{title}</h1>

      {/* Stats Row */}
      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <Eye className="size-4" />
          <span>{formattedViews} Aufrufe</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Calendar className="size-4" />
          <span>vor {formattedDate}</span>
        </div>
        <Badge variant="outline">{category}</Badge>
      </div>

      {/* Description */}
      {description && (
        <div className="prose prose-sm max-w-none">
          <p className="text-muted-foreground whitespace-pre-wrap">{description}</p>
        </div>
      )}
    </div>
  )
}

