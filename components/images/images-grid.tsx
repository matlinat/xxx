// components/images/images-grid.tsx
"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Heart, Star, Lock } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface Image {
  id: string
  title: string
  imageUrl: string
  category: string
  creatorName: string
  isSponsored: boolean
  isFavorite: boolean
  isLocked: boolean
}

interface ImagesGridProps {
  images: Image[]
}

export function ImagesGrid({ images }: ImagesGridProps) {
  const [displayedImages, setDisplayedImages] = useState<Image[]>([])
  const [favorites, setFavorites] = useState<Set<string>>(
    new Set(images.filter((image) => image.isFavorite).map((image) => image.id))
  )
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const observerTarget = useRef<HTMLDivElement>(null)

  // Initial load
  useEffect(() => {
    setDisplayedImages(images.slice(0, 12))
  }, [images])

  // Infinity scroll
  const loadMore = useCallback(() => {
    if (isLoadingMore) return
    setIsLoadingMore(true)

    // Simulate loading delay
    setTimeout(() => {
      const currentCount = displayedImages.length
      const nextBatch = images.slice(currentCount, currentCount + 12)
      if (nextBatch.length > 0) {
        setDisplayedImages((prev) => [...prev, ...nextBatch])
      }
      setIsLoadingMore(false)
    }, 500)
  }, [images, displayedImages.length, isLoadingMore])

  // Intersection Observer for infinity scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && displayedImages.length < images.length) {
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
  }, [displayedImages.length, images.length, loadMore])

  const toggleFavorite = (imageId: string) => {
    setFavorites((prev) => {
      const newFavorites = new Set(prev)
      if (newFavorites.has(imageId)) {
        newFavorites.delete(imageId)
      } else {
        newFavorites.add(imageId)
      }
      return newFavorites
    })
  }

  if (displayedImages.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        Keine Bilder gefunden
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {displayedImages.map((image) => {
          const isFavorite = favorites.has(image.id)
          return (
            <div
              key={image.id}
              className="relative group rounded-lg border bg-card overflow-hidden hover:shadow-lg transition-shadow"
            >
              {/* Sponsored Badge */}
              {image.isSponsored && (
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
                  toggleFavorite(image.id)
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

              {/* Image */}
              <Link href={`/image/${image.id}`}>
                <div className="relative aspect-square overflow-hidden bg-muted">
                  <img
                    src={image.imageUrl}
                    alt={image.title}
                    className={cn(
                      "w-full h-full object-cover transition-transform duration-300 group-hover:scale-105",
                      image.isLocked && "blur-lg"
                    )}
                  />
                  
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                  {/* Locked Overlay */}
                  {image.isLocked && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                      <div className="flex flex-col items-center gap-1 text-white">
                        <Lock className="size-8" />
                        <span className="text-xs font-medium">Gesperrt</span>
                      </div>
                    </div>
                  )}
                </div>
              </Link>

              {/* Title and Creator Name */}
              <div className="p-3 space-y-1">
                <h3 className="font-semibold text-sm line-clamp-1">
                  {image.title}
                </h3>
                <p className="text-xs text-muted-foreground line-clamp-1">
                  {image.creatorName}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Infinity Scroll Trigger */}
      {displayedImages.length < images.length && (
        <div ref={observerTarget} className="flex justify-center py-8">
          {isLoadingMore && (
            <div className="text-muted-foreground">Lade weitere Bilder...</div>
          )}
        </div>
      )}
    </>
  )
}

