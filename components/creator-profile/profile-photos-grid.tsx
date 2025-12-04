// components/creator-profile/profile-photos-grid.tsx
"use client"

import { Lock } from "lucide-react"
import { cn } from "@/lib/utils"

interface Photo {
  id: string
  url: string
  isLocked: boolean
}

interface ProfilePhotosGridProps {
  photos: Photo[]
}

export function ProfilePhotosGrid({ photos }: ProfilePhotosGridProps) {
  if (photos.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-muted-foreground">
        Noch keine Fotos vorhanden
      </div>
    )
  }

  return (
    <div className="grid grid-cols-3 gap-0.5 p-0.5">
      {photos.map((photo) => (
        <button
          key={photo.id}
          className="relative aspect-square overflow-hidden bg-muted group"
        >
          <img
            src={photo.url}
            alt=""
            className={cn(
              "w-full h-full object-cover transition-transform duration-300 group-hover:scale-105",
              photo.isLocked && "blur-lg"
            )}
          />

          {/* Locked Overlay */}
          {photo.isLocked && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <div className="flex flex-col items-center gap-1 text-white">
                <Lock className="size-6" />
                <span className="text-xs font-medium">Gesperrt</span>
              </div>
            </div>
          )}

          {/* Hover Overlay (non-locked) */}
          {!photo.isLocked && (
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
          )}
        </button>
      ))}
    </div>
  )
}

