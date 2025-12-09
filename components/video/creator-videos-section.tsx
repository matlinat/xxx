"use client"

import { Lock, Play } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface VideoItem {
  id: string
  thumbnailUrl: string
  duration: string
  isLocked?: boolean
  title?: string
}

interface CreatorVideosSectionProps {
  videos: VideoItem[]
  creatorUsername: string
  title?: string
}

export function CreatorVideosSection({
  videos,
  creatorUsername,
  title = "Weitere Videos",
}: CreatorVideosSectionProps) {
  if (videos.length === 0) {
    return null
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-foreground">{title}</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {videos.map((video) => (
          <Link
            key={video.id}
            href={`/creator/${creatorUsername}/video/${video.id}`}
            className="relative group rounded-lg border bg-card overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div className="relative aspect-video overflow-hidden bg-muted">
              <img
                src={video.thumbnailUrl}
                alt={video.title || ""}
                className={cn(
                  "w-full h-full object-cover transition-transform duration-300 group-hover:scale-105",
                  video.isLocked && "blur-lg"
                )}
              />

              {/* Duration Badge */}
              <div className="absolute bottom-2 right-2 px-1.5 py-0.5 text-xs font-medium bg-black/70 text-white rounded">
                {video.duration}
              </div>

              {/* Locked Overlay */}
              {video.isLocked ? (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                  <div className="flex flex-col items-center gap-1 text-white">
                    <Lock className="size-8" />
                    <span className="text-xs font-medium">Gesperrt</span>
                  </div>
                </div>
              ) : (
                /* Play Button Overlay (non-locked) */
                <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/30 transition-colors">
                  <div className="size-12 rounded-full bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Play className="size-6 text-black fill-black ml-0.5" />
                  </div>
                </div>
              )}
            </div>

            {/* Title */}
            {video.title && (
              <div className="p-2">
                <p className="text-sm font-medium line-clamp-2 text-foreground">{video.title}</p>
              </div>
            )}
          </Link>
        ))}
      </div>
    </div>
  )
}

