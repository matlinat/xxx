// components/videos/video-category-slider.tsx
"use client"

import { useRef, useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface VideoItem {
  id: string
  thumbnailUrl: string
  duration: string
  title: string
}

interface VideoCategorySliderProps {
  title: string
  videos: VideoItem[]
}

export function VideoCategorySlider({ title, videos }: VideoCategorySliderProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  const checkScrollability = () => {
    const container = scrollContainerRef.current
    if (!container) return

    setCanScrollLeft(container.scrollLeft > 0)
    setCanScrollRight(
      container.scrollLeft < container.scrollWidth - container.clientWidth - 10
    )
  }

  const scroll = (direction: "left" | "right") => {
    const container = scrollContainerRef.current
    if (!container) return

    const scrollAmount = container.clientWidth * 0.8
    const newScrollLeft =
      direction === "left"
        ? container.scrollLeft - scrollAmount
        : container.scrollLeft + scrollAmount

    container.scrollTo({
      left: newScrollLeft,
      behavior: "smooth",
    })
  }

  // Check scrollability on mount and resize
  useEffect(() => {
    checkScrollability()
    const container = scrollContainerRef.current
    if (container) {
      const resizeObserver = new ResizeObserver(checkScrollability)
      resizeObserver.observe(container)
      return () => resizeObserver.disconnect()
    }
  }, [])

  return (
    <div className="relative">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">{title}</h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => scroll("left")}
            disabled={!canScrollLeft}
            className="h-8 w-8"
          >
            <ChevronLeft className="size-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => scroll("right")}
            disabled={!canScrollRight}
            className="h-8 w-8"
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>

      {/* Scrollable Container */}
      <div className="relative">
        <div
          ref={scrollContainerRef}
          onScroll={checkScrollability}
          className="flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-4"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {videos.map((video) => (
            <div
              key={video.id}
              className="flex-shrink-0 w-[280px] sm:w-[320px] snap-start group rounded-lg border bg-card overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
            >
              {/* Thumbnail */}
              <div className="relative aspect-video overflow-hidden bg-muted">
                <img
                  src={video.thumbnailUrl}
                  alt={video.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />

                {/* Duration Badge */}
                <div className="absolute bottom-2 right-2 px-1.5 py-0.5 text-xs font-medium bg-black/70 text-white rounded">
                  {video.duration}
                </div>

                {/* Play Button Overlay */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/30 transition-colors">
                  <div className="size-12 rounded-full bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Play className="size-6 text-black fill-black ml-0.5" />
                  </div>
                </div>
              </div>

              {/* Title */}
              <div className="p-3">
                <h3 className="text-sm font-medium line-clamp-2">{video.title}</h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

