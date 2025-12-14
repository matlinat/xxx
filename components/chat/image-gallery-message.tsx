"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface ImageGalleryMessageProps {
  images: string[]
  className?: string
}

export function ImageGalleryMessage({
  images,
  className,
}: ImageGalleryMessageProps) {
  const displayImages = images.slice(0, 4)
  const remainingCount = images.length > 4 ? images.length - 4 : 0

  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-1 rounded-lg overflow-hidden max-w-md",
        className
      )}
    >
      {displayImages.map((image, index) => (
        <div
          key={index}
          className={cn(
            "aspect-square bg-muted relative overflow-hidden",
            index === 0 && "rounded-tl-lg",
            index === 1 && "rounded-tr-lg",
            index === displayImages.length - 2 && remainingCount === 0 && "rounded-bl-lg",
            index === displayImages.length - 1 && remainingCount === 0 && "rounded-br-lg"
          )}
        >
          {/* Placeholder für Bild */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5" />
          
          {/* "+X" Overlay auf letztem Bild */}
          {index === displayImages.length - 1 && remainingCount > 0 && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <span className="text-white font-semibold text-lg">
                +{remainingCount}
              </span>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
