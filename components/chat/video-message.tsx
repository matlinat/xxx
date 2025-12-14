"use client"

import * as React from "react"
import { Play } from "lucide-react"
import { cn } from "@/lib/utils"

interface VideoMessageProps {
  videoUrl: string
  duration: string
  className?: string
}

export function VideoMessage({
  videoUrl,
  duration,
  className,
}: VideoMessageProps) {
  return (
    <div
      className={cn(
        "relative rounded-lg overflow-hidden bg-muted max-w-md",
        className
      )}
    >
      {/* Video Thumbnail */}
      <div className="aspect-video bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center relative">
        {/* Placeholder für Video-Thumbnail */}
        <div className="absolute inset-0 bg-black/20" />
        
        {/* Play Button */}
        <div className="relative z-10 size-16 bg-white/90 rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors cursor-pointer">
          <Play className="size-8 text-primary ml-1" fill="currentColor" />
        </div>

        {/* Duration Badge */}
        <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
          {duration}
        </div>
      </div>
    </div>
  )
}
