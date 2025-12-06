// components/videos/videos-grid.tsx
"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Heart, Star, Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface Video {
  id: string
  title: string
  thumbnailUrl: string
  duration: string
  category: string
  isSponsored: boolean
  isFavorite: boolean
}

interface VideosGridProps {
  videos: Video[]
}

export function VideosGrid({ videos }: VideosGridProps) {
  const [displayedVideos, setDisplayedVideos] = useState<Video[]>([])
  const [favorites, setFavorites] = useState<Set<string>>(
    new Set(videos.filter((video) => video.isFavorite).map((video) => video.id))
  )
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const observerTarget = useRef<HTMLDivElement>(null)

  // Initial load
  useEffect(() => {
    setDisplayedVideos(videos.slice(0, 12))
  }, [videos])

  // Infinity scroll
  const loadMore = useCallback(() => {
    if (isLoadingMore) return
    setIsLoadingMore(true)

    // Simulate loading delay
    setTimeout(() => {
      const currentCount = displayedVideos.length
      const nextBatch = videos.slice(currentCount, currentCount + 12)
      if (nextBatch.length > 0) {
        setDisplayedVideos((prev) => [...prev, ...nextBatch])
      }
      setIsLoadingMore(false)
    }, 500)
  }, [videos, displayedVideos.length, isLoadingMore])

  // Intersection Observer for infinity scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && displayedVideos.length < videos.length) {
          loadMore()
        }
      },
      { threshold: 0.1 }
    )

    const currentTarget = observerTarget.current
    if (currentTarget) {
      observer.observe(currentTarget)
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget)
      }
    }
  }, [displayedVideos.length, videos.length, loadMore])

  const toggleFavorite = (videoId: string) => {
    setFavorites((prev) => {
      const newFavorites = new Set(prev)
      if (newFavorites.has(videoId)) {
        newFavorites.delete(videoId)
      } else {
        newFavorites.add(videoId)
      }
      return newFavorites
    })
  }

  if (displayedVideos.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        Keine Videos gefunden
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {displayedVideos.map((video) => {
          const isFavorite = favorites.has(video.id)
          return (
            <div
              key={video.id}
              className="relative group rounded-lg border bg-card overflow-hidden hover:shadow-lg transition-shadow"
            >
              {/* Sponsored Badge */}
              {video.isSponsored && (
                <div className="absolute top-2 left-2 z-10">
                  <Badge className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white border-0 shadow-lg">
                    <Star className="size-3 mr-1 fill-white" />
                    Sponsored
                  </Badge>
                </div>
              )}

              {/* Favorite Button */}
              <button
                onClick={(e) => {
                  e.preventDefault()
                  toggleFavorite(video.id)
                }}
                className={cn(
                  "absolute top-2 right-2 z-10 p-2 rounded-full transition-colors",
                  isFavorite
                    ? "bg-red-500 text-white"
                    : "bg-black/50 text-white hover:bg-black/70"
                )}
              >
                <Heart
                  className={cn("size-4", isFavorite && "fill-current")}
                />
              </button>

              {/* Video Thumbnail */}
              <Link href={`/video/${video.id}`}>
                <div className="relative aspect-video overflow-hidden bg-muted">
                  <img
                    src={video.thumbnailUrl}
                    alt={video.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  
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

                  {/* Title */}
                  <div className="absolute bottom-2 left-2 right-12">
                    <span className="text-white font-semibold text-sm line-clamp-1">
                      {video.title}
                    </span>
                  </div>
                </div>
              </Link>

              {/* Category Badge */}
              <div className="p-3">
                <Badge variant="outline" className="text-xs">
                  {video.category}
                </Badge>
              </div>
            </div>
          )
        })}
      </div>

      {/* Infinity Scroll Trigger */}
      {displayedVideos.length < videos.length && (
        <div ref={observerTarget} className="flex justify-center py-8">
          {isLoadingMore && (
            <div className="text-muted-foreground">Lade weitere Videos...</div>
          )}
        </div>
      )}
    </>
  )
}

