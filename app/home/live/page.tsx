// app/home/live/page.tsx
"use client"

import { useState, useEffect, useCallback } from "react"
import { LiveCamsFilters } from "@/components/live-cams/live-cams-filters"
import { LiveCamsGrid } from "@/components/live-cams/live-cams-grid"
import { Loader2 } from "lucide-react"

interface LiveCam {
  id: string
  creatorName: string
  avatarUrl: string
  isSponsored: boolean
  isFavorite: boolean
}

export default function LiveCamsPage() {
  const [cams, setCams] = useState<LiveCam[]>([])
  const [filteredCams, setFilteredCams] = useState<LiveCam[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>({})

  // Generate 40 dummy cams
  useEffect(() => {
    const dummyCams: LiveCam[] = Array.from({ length: 40 }, (_, i) => ({
      id: `cam-${i + 1}`,
      creatorName: `Creator ${i + 1}`,
      avatarUrl: `https://placehold.co/200x200/${['pink', 'purple', 'rose', 'fuchsia', 'violet'][i % 5]}/white?text=C${i + 1}`,
      isSponsored: i < 4,
      isFavorite: Math.random() > 0.7,
    }))
    setCams(dummyCams)
    setFilteredCams(dummyCams)
  }, [])

  // Filter cams when filters change
  useEffect(() => {
    if (Object.keys(activeFilters).length === 0) {
      setFilteredCams(cams)
      return
    }

    setIsLoading(true)
    // Simulate API call delay
    const timer = setTimeout(() => {
      // TODO: Implement actual filtering with Supabase
      // For now, just return all cams
      setFilteredCams(cams)
      setIsLoading(false)
    }, 500)

    return () => clearTimeout(timer)
  }, [activeFilters, cams])

  const handleFilterChange = useCallback((filters: Record<string, string[]>) => {
    setActiveFilters(filters)
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-6">
        {/* Filters */}
        <LiveCamsFilters onFilterChange={handleFilterChange} />

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="size-8 animate-spin text-purple-500" />
          </div>
        )}

        {/* Cams Grid */}
        {!isLoading && (
          <LiveCamsGrid cams={filteredCams} />
        )}
      </div>
    </div>
  )
}

