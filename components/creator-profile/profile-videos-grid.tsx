// components/creator-profile/profile-videos-grid.tsx
"use client"

import { Lock, Play } from "lucide-react"
import { cn } from "@/lib/utils"

interface VideoItem {
  id: string
  thumbnailUrl: string
  duration: string
  isLocked: boolean
}

interface ProfileVideosGridProps {
  videos: VideoItem[]
}

export function ProfileVideosGrid({ videos }: ProfileVideosGridProps) {
  if (videos.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-muted-foreground">
        Noch keine Videos vorhanden
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-0.5 p-0.5">
      {videos.map((video) => (
        <button
          key={video.id}
          className="relative aspect-video overflow-hidden bg-muted group"
        >
          <img
            src={video.thumbnailUrl}
            alt=""
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
        </button>
      ))}
    </div>
  )
}

