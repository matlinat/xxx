// components/videos/video-categories-grid.tsx
"use client"

import Link from "next/link"
import { Play } from "lucide-react"
import { cn } from "@/lib/utils"

interface VideoCategoriesGridProps {
  categories: string[]
}

export function VideoCategoriesGrid({ categories }: VideoCategoriesGridProps) {
  const getCategorySlug = (category: string) => {
    return category
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[()]/g, "")
      .replace(/\//g, "-")
  }

  const getCategoryThumbnail = (category: string) => {
    // Generate a placeholder thumbnail with gray background
    return `https://placehold.co/400x225/808080/white?text=${encodeURIComponent(category)}`
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 gap-4">
      {categories.map((category) => (
        <Link
          key={category}
          href={`/home/videos/kategorie/${getCategorySlug(category)}`}
          className="group relative rounded-lg border bg-card overflow-hidden hover:shadow-lg transition-shadow"
        >
          {/* Thumbnail */}
          <div className="relative aspect-video overflow-hidden bg-muted">
            <img
              src={getCategoryThumbnail(category)}
              alt={category}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />

            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

            {/* Play Icon Overlay */}
            <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/20 transition-colors">
              <div className="size-10 rounded-full bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Play className="size-5 text-black fill-black ml-0.5" />
              </div>
            </div>

            {/* Category Name */}
            <div className="absolute bottom-0 left-0 right-0 p-3">
              <h3 className="text-sm font-semibold text-white line-clamp-2">
                {category}
              </h3>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}

