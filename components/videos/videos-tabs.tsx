// components/videos/videos-tabs.tsx
"use client"

import { useRef, useState, useEffect, useCallback } from "react"
import { Play, Percent } from "lucide-react"
import { cn } from "@/lib/utils"

interface VideoItem {
  id: string
  thumbnailUrl: string
  duration: string
  title: string
  discount?: number
}

interface VideosTabsProps {
  unsereAuswahl: VideoItem[]
  topVideos: VideoItem[]
  neuesteVideos: VideoItem[]
  videosMitRabatt: VideoItem[]
}

const tabs = [
  { id: "unsere-auswahl", label: "Unsere Auswahl" },
  { id: "top-videos", label: "Top Videos" },
  { id: "neueste-videos", label: "Neueste Videos" },
  { id: "videos-mit-rabatt", label: "Videos mit Rabatt" },
]

export function VideosTabs({
  unsereAuswahl,
  topVideos,
  neuesteVideos,
  videosMitRabatt,
}: VideosTabsProps) {
  const [activeTab, setActiveTab] = useState("unsere-auswahl")
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const sectionRefs = {
    "unsere-auswahl": useRef<HTMLDivElement>(null),
    "top-videos": useRef<HTMLDivElement>(null),
    "neueste-videos": useRef<HTMLDivElement>(null),
    "videos-mit-rabatt": useRef<HTMLDivElement>(null),
  }

  const getVideosForTab = (tabId: string) => {
    switch (tabId) {
      case "unsere-auswahl":
        return unsereAuswahl
      case "top-videos":
        return topVideos
      case "neueste-videos":
        return neuesteVideos
      case "videos-mit-rabatt":
        return videosMitRabatt
      default:
        return []
    }
  }

  // Scroll to section when tab is clicked
  const scrollToSection = useCallback((tabId: string) => {
    const container = scrollContainerRef.current
    if (!container) return

    const targetRef = sectionRefs[tabId as keyof typeof sectionRefs]
    const target = targetRef?.current
    if (!target) return

    const scrollLeft = target.offsetLeft

    container.scrollTo({
      left: scrollLeft,
      behavior: "smooth",
    })

    setActiveTab(tabId)
  }, [])

  // Update active tab based on scroll position using IntersectionObserver
  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return

    const observers: IntersectionObserver[] = []

    Object.entries(sectionRefs).forEach(([tabId, ref]) => {
      const element = ref.current
      if (!element) return

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
              setActiveTab(tabId)
            }
          })
        },
        {
          root: container,
          threshold: 0.5,
        }
      )

      observer.observe(element)
      observers.push(observer)
    })

    return () => {
      observers.forEach((observer) => observer.disconnect())
    }
  }, [])

  return (
    <div className="rounded-lg border bg-card overflow-hidden w-full">
      {/* Tab Buttons - Sticky */}
      <div className="sticky top-0 z-10 bg-card border-b">
        <div className="flex overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id
            const videos = getVideosForTab(tab.id)

            return (
              <button
                key={tab.id}
                onClick={() => scrollToSection(tab.id)}
                className={cn(
                  "flex-shrink-0 flex items-center justify-center gap-2 py-3 px-6 text-sm font-medium transition-colors relative whitespace-nowrap",
                  isActive
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <span>{tab.label}</span>
                <span
                  className={cn(
                    "text-xs px-1.5 py-0.5 rounded-full",
                    isActive
                      ? "bg-purple-500/20 text-purple-400"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {videos.length}
                </span>

                {/* Active Indicator */}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500" />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Scrollable Content Container */}
      <div
        ref={scrollContainerRef}
        className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide w-full"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {/* Unsere Auswahl Section */}
        <div
          ref={sectionRefs["unsere-auswahl"]}
          data-section="unsere-auswahl"
          className="w-full min-w-full snap-start snap-always p-4 md:p-6 flex-shrink-0 box-border"
        >
          <div className="w-full max-w-full overflow-hidden">
            <VideoGrid videos={unsereAuswahl} />
          </div>
        </div>

        {/* Top Videos Section */}
        <div
          ref={sectionRefs["top-videos"]}
          data-section="top-videos"
          className="w-full min-w-full snap-start snap-always p-4 md:p-6 flex-shrink-0 box-border"
        >
          <div className="w-full max-w-full overflow-hidden">
            <VideoGrid videos={topVideos} />
          </div>
        </div>

        {/* Neueste Videos Section */}
        <div
          ref={sectionRefs["neueste-videos"]}
          data-section="neueste-videos"
          className="w-full min-w-full snap-start snap-always p-4 md:p-6 flex-shrink-0 box-border"
        >
          <div className="w-full max-w-full overflow-hidden">
            <VideoGrid videos={neuesteVideos} />
          </div>
        </div>

        {/* Videos mit Rabatt Section */}
        <div
          ref={sectionRefs["videos-mit-rabatt"]}
          data-section="videos-mit-rabatt"
          className="w-full min-w-full snap-start snap-always p-4 md:p-6 flex-shrink-0 box-border"
        >
          <div className="w-full max-w-full overflow-hidden">
            <VideoGrid videos={videosMitRabatt} showDiscount />
          </div>
        </div>
      </div>
    </div>
  )
}

function VideoGrid({ videos, showDiscount = false }: { videos: VideoItem[]; showDiscount?: boolean }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4 w-full">
      {videos.map((video) => (
        <div
          key={video.id}
          className="relative group rounded-lg border bg-card overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
        >
          {/* Discount Badge */}
          {showDiscount && video.discount && (
            <div className="absolute top-2 left-2 z-10">
              <div className="flex items-center gap-1 px-2 py-1 bg-red-500 text-white text-xs font-bold rounded">
                <Percent className="size-3" />
                {video.discount}%
              </div>
            </div>
          )}

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
  )
}

