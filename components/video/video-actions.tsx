"use client"

import { Button } from "@/components/ui/button"
import { Heart, Share2, Download } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"

interface VideoActionsProps {
  likes: number
  isLiked?: boolean
  isFavorite?: boolean
  onLike?: () => void
  onFavorite?: () => void
  onShare?: () => void
  onDownload?: () => void
}

export function VideoActions({
  likes,
  isLiked = false,
  isFavorite = false,
  onLike,
  onFavorite,
  onShare,
  onDownload,
}: VideoActionsProps) {
  const [isLikedState, setIsLikedState] = useState(isLiked)
  const [isFavoriteState, setIsFavoriteState] = useState(isFavorite)
  const [likesCount, setLikesCount] = useState(likes)

  const handleLike = () => {
    setIsLikedState(!isLikedState)
    setLikesCount((prev) => (isLikedState ? prev - 1 : prev + 1))
    onLike?.()
    // TODO: Implement actual like logic with Supabase
  }

  const handleFavorite = () => {
    setIsFavoriteState(!isFavoriteState)
    onFavorite?.()
    // TODO: Implement actual favorite logic with Supabase
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: document.title,
        url: window.location.href,
      }).catch(() => {})
    } else {
      navigator.clipboard.writeText(window.location.href)
    }
    onShare?.()
  }

  const handleDownload = () => {
    onDownload?.()
    // TODO: Implement download logic
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handleLike}
        className={cn(
          "gap-2",
          isLikedState && "bg-red-500 text-white border-red-500 hover:bg-red-600"
        )}
      >
        <Heart className={cn("size-4", isLikedState && "fill-current")} />
        <span>{new Intl.NumberFormat("de-DE").format(likesCount)}</span>
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={handleFavorite}
        className={cn(
          "gap-2",
          isFavoriteState && "bg-pink-500 text-white border-pink-500 hover:bg-pink-600"
        )}
      >
        <Heart className={cn("size-4", isFavoriteState && "fill-current")} />
        <span>Favorit</span>
      </Button>

      <Button variant="outline" size="sm" onClick={handleShare} className="gap-2">
        <Share2 className="size-4" />
        <span>Teilen</span>
      </Button>

      <Button variant="outline" size="sm" onClick={handleDownload} className="gap-2">
        <Download className="size-4" />
        <span>Download</span>
      </Button>
    </div>
  )
}

