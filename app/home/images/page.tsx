// app/home/images/page.tsx
"use client"

import { useState, useEffect, useCallback } from "react"
import { ImagesFilters } from "@/components/images/images-filters"
import { ImagesGrid } from "@/components/images/images-grid"
import { Loader2 } from "lucide-react"

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

export default function ImagesPage() {
  const [images, setImages] = useState<Image[]>([])
  const [filteredImages, setFilteredImages] = useState<Image[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>({})

  // Generate 40 dummy images
  useEffect(() => {
    const categories = ["Anal", "Teens", "Lesben", "MILF", "Blowjob", "Analsex", "Gruppensex", "Hardcore"]
    const creators = ["Creator 1", "Creator 2", "Creator 3", "Creator 4", "Creator 5"]
    const dummyImages: Image[] = Array.from({ length: 40 }, (_, i) => ({
      id: `image-${i + 1}`,
      title: `Bild ${i + 1}`,
      imageUrl: `https://placehold.co/400x400/${['pink', 'purple', 'rose', 'fuchsia', 'violet'][i % 5]}/white?text=I${i + 1}`,
      category: categories[i % categories.length],
      creatorName: creators[i % creators.length],
      isSponsored: i < 4,
      isFavorite: Math.random() > 0.7,
      isLocked: Math.random() > 0.5,
    }))
    setImages(dummyImages)
    setFilteredImages(dummyImages)
  }, [])

  // Filter images when filters change
  useEffect(() => {
    if (Object.keys(activeFilters).length === 0) {
      setFilteredImages(images)
      return
    }

    setIsLoading(true)
    // Simulate API call delay
    const timer = setTimeout(() => {
      // TODO: Implement actual filtering with Supabase
      // For now, just return all images
      setFilteredImages(images)
      setIsLoading(false)
    }, 500)

    return () => clearTimeout(timer)
  }, [activeFilters, images])

  const handleFilterChange = useCallback((filters: Record<string, string[]>) => {
    setActiveFilters(filters)
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-6">
        {/* Filters */}
        <ImagesFilters onFilterChange={handleFilterChange} />

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="size-8 animate-spin text-purple-500" />
          </div>
        )}

        {/* Images Grid */}
        {!isLoading && (
          <ImagesGrid images={filteredImages} />
        )}
      </div>
    </div>
  )
}

