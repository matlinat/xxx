// components/creator-profile/profile-content-tabs.tsx
"use client"

import { useRef, useState, useEffect, useCallback } from "react"
import { Image, Video } from "lucide-react"
import { cn } from "@/lib/utils"
import { ProfilePhotosGrid } from "./profile-photos-grid"
import { ProfileVideosGrid } from "./profile-videos-grid"

interface Photo {
  id: string
  url: string
  isLocked: boolean
}

interface VideoItem {
  id: string
  thumbnailUrl: string
  duration: string
  isLocked: boolean
}

interface ProfileContentTabsProps {
  photos: Photo[]
  videos: VideoItem[]
  creatorUsername: string
}

const tabs = [
  { id: "photos", label: "Fotos", icon: Image },
  { id: "videos", label: "Videos", icon: Video },
]

export function ProfileContentTabs({ photos, videos, creatorUsername }: ProfileContentTabsProps) {
  const [activeTab, setActiveTab] = useState("photos")
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const photosRef = useRef<HTMLDivElement>(null)
  const videosRef = useRef<HTMLDivElement>(null)

  // Scroll to section when tab is clicked
  const scrollToSection = useCallback((tabId: string) => {
    const container = scrollContainerRef.current
    if (!container) return

    const targetRef = tabId === "photos" ? photosRef : videosRef
    const target = targetRef.current
    if (!target) return

    // Calculate the scroll position
    const containerRect = container.getBoundingClientRect()
    const targetRect = target.getBoundingClientRect()
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
    const photosEl = photosRef.current
    const videosEl = videosRef.current

    if (!container || !photosEl || !videosEl) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
            const id = entry.target.getAttribute("data-section")
            if (id) {
              setActiveTab(id)
            }
          }
        })
      },
      {
        root: container,
        threshold: 0.5,
      }
    )

    observer.observe(photosEl)
    observer.observe(videosEl)

    return () => {
      observer.disconnect()
    }
  }, [])

  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      {/* Tab Buttons - Sticky */}
      <div className="sticky top-0 z-10 bg-card border-b">
        <div className="flex">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            const count = tab.id === "photos" ? photos.length : videos.length

            return (
              <button
                key={tab.id}
                onClick={() => scrollToSection(tab.id)}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-3 px-4 text-sm font-medium transition-colors relative",
                  isActive
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="size-5" />
                <span>{tab.label}</span>
                <span
                  className={cn(
                    "text-xs px-1.5 py-0.5 rounded-full",
                    isActive
                      ? "bg-purple-500/20 text-purple-400"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {count}
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
        className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {/* Photos Section */}
        <div
          ref={photosRef}
          data-section="photos"
          className="min-w-full snap-start snap-always"
        >
          <ProfilePhotosGrid photos={photos} />
        </div>

        {/* Videos Section */}
        <div
          ref={videosRef}
          data-section="videos"
          className="min-w-full snap-start snap-always"
        >
          <ProfileVideosGrid videos={videos} creatorUsername={creatorUsername} />
        </div>
      </div>
    </div>
  )
}

