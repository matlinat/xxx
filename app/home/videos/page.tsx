// app/home/videos/page.tsx
"use client"

import { useState, useEffect, useCallback } from "react"
import { VideosFilters } from "@/components/videos/videos-filters"
import { VideosGrid } from "@/components/videos/videos-grid"
import { Loader2 } from "lucide-react"

interface Video {
  id: string
  title: string
  thumbnailUrl: string
  duration: string
  category: string
  isSponsored: boolean
  isFavorite: boolean
}

export default function VideosPage() {
  const [videos, setVideos] = useState<Video[]>([])
  const [filteredVideos, setFilteredVideos] = useState<Video[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>({})

  // Generate 40 dummy videos
  useEffect(() => {
    const categories = ["Anal", "Teens", "Lesben", "MILF", "Blowjob", "Analsex", "Gruppensex", "Hardcore"]
    const dummyVideos: Video[] = Array.from({ length: 40 }, (_, i) => ({
      id: `video-${i + 1}`,
      title: `Video ${i + 1}`,
      thumbnailUrl: `https://placehold.co/400x225/${['pink', 'purple', 'rose', 'fuchsia', 'violet'][i % 5]}/white?text=V${i + 1}`,
      duration: `${Math.floor(Math.random() * 20) + 5}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
      category: categories[i % categories.length],
      isSponsored: i < 4,
      isFavorite: Math.random() > 0.7,
    }))
    setVideos(dummyVideos)
    setFilteredVideos(dummyVideos)
  }, [])

  // Filter videos when filters change
  useEffect(() => {
    if (Object.keys(activeFilters).length === 0) {
      setFilteredVideos(videos)
      return
    }

    setIsLoading(true)
    // Simulate API call delay
    const timer = setTimeout(() => {
      // TODO: Implement actual filtering with Supabase
      // For now, just return all videos
      setFilteredVideos(videos)
      setIsLoading(false)
    }, 500)

    return () => clearTimeout(timer)
  }, [activeFilters, videos])

  const handleFilterChange = useCallback((filters: Record<string, string[]>) => {
    setActiveFilters(filters)
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-6">
        {/* Filters */}
        <VideosFilters onFilterChange={handleFilterChange} />

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="size-8 animate-spin text-purple-500" />
          </div>
        )}

        {/* Videos Grid */}
        {!isLoading && (
          <VideosGrid videos={filteredVideos} />
        )}
      </div>
    </div>
  )
}

