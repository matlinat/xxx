"use client"

import { Button } from "@/components/ui/button"
import { Heart } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"

interface VideoActionsProps {
  likes: number
  isLiked?: boolean
  isFavorite?: boolean
  onLike?: () => void
  onFavorite?: () => void
}

export function VideoActions({
  likes,
  isLiked = false,
  isFavorite = false,
  onLike,
  onFavorite,
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
    </div>
  )
}

