// components/live-cams/live-cams-grid.tsx
"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Heart, Star } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface LiveCam {
  id: string
  creatorName: string
  avatarUrl: string
  isSponsored: boolean
  isFavorite: boolean
}

interface LiveCamsGridProps {
  cams: LiveCam[]
}

export function LiveCamsGrid({ cams }: LiveCamsGridProps) {
  const [displayedCams, setDisplayedCams] = useState<LiveCam[]>([])
  const [favorites, setFavorites] = useState<Set<string>>(
    new Set(cams.filter((cam) => cam.isFavorite).map((cam) => cam.id))
  )
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const observerTarget = useRef<HTMLDivElement>(null)

  // Initial load
  useEffect(() => {
    setDisplayedCams(cams.slice(0, 12))
  }, [cams])

  // Infinity scroll
  const loadMore = useCallback(() => {
    if (isLoadingMore) return
    setIsLoadingMore(true)

    // Simulate loading delay
    setTimeout(() => {
      const currentCount = displayedCams.length
      const nextBatch = cams.slice(currentCount, currentCount + 12)
      if (nextBatch.length > 0) {
        setDisplayedCams((prev) => [...prev, ...nextBatch])
      }
      setIsLoadingMore(false)
    }, 500)
  }, [cams, displayedCams.length, isLoadingMore])

  // Intersection Observer for infinity scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && displayedCams.length < cams.length) {
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
  }, [displayedCams.length, cams.length, loadMore])

  const toggleFavorite = (camId: string) => {
    setFavorites((prev) => {
      const newFavorites = new Set(prev)
      if (newFavorites.has(camId)) {
        newFavorites.delete(camId)
      } else {
        newFavorites.add(camId)
      }
      return newFavorites
    })
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  if (displayedCams.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        Keine Live Cams gefunden
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {displayedCams.map((cam) => {
          const isFavorite = favorites.has(cam.id)
          return (
            <div
              key={cam.id}
              className="relative group rounded-lg border bg-card overflow-hidden hover:shadow-lg transition-shadow"
            >
              {/* Sponsored Badge */}
              {cam.isSponsored && (
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
                  toggleFavorite(cam.id)
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

              {/* Avatar */}
              <Link href={`/creator/${cam.creatorName.toLowerCase().replace(/\s+/g, "")}`}>
                <div className="relative aspect-square overflow-hidden bg-muted">
                  <Avatar className="w-full h-full rounded-none">
                    <AvatarImage src={cam.avatarUrl} alt={cam.creatorName} />
                    <AvatarFallback className="text-4xl bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                      {getInitials(cam.creatorName)}
                    </AvatarFallback>
                  </Avatar>
                  {/* Live Indicator Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-2 left-2 right-2">
                    <div className="flex items-center justify-between">
                      <span className="text-white font-semibold text-sm">
                        {cam.creatorName}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>

              {/* Join Button */}
              <div className="p-3">
                <Button
                  asChild
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold"
                >
                  <Link href={`/creator/${cam.creatorName.toLowerCase().replace(/\s+/g, "")}`}>
                    LIVE
                  </Link>
                </Button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Infinity Scroll Trigger */}
      {displayedCams.length < cams.length && (
        <div ref={observerTarget} className="flex justify-center py-8">
          {isLoadingMore && (
            <div className="text-muted-foreground">Lade weitere Cams...</div>
          )}
        </div>
      )}
    </>
  )
}

