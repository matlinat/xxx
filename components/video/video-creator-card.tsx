"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { UserPlus, Check } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { cn } from "@/lib/utils"

interface Creator {
  username: string
  nickname: string
  avatarUrl: string
}

interface VideoCreatorCardProps {
  creator: Creator
  fansCount?: number
}

export function VideoCreatorCard({ creator, fansCount }: VideoCreatorCardProps) {
  const [isFollowing, setIsFollowing] = useState(false)

  const handleFollow = () => {
    setIsFollowing(!isFollowing)
    // TODO: Implement actual follow/unfollow logic with Supabase
  }

  return (
    <div className="bg-card border rounded-lg p-4 space-y-4">
      <div className="flex items-start gap-3">
        <Link href={`/creator/${creator.username}`}>
          <Avatar className="size-12 border-2">
            <AvatarImage src={creator.avatarUrl} alt={creator.nickname} />
            <AvatarFallback>{creator.nickname.charAt(0)}</AvatarFallback>
          </Avatar>
        </Link>
        <div className="flex-1 min-w-0">
          <Link href={`/creator/${creator.username}`}>
            <h3 className="font-semibold text-foreground hover:text-primary transition-colors truncate">
              {creator.nickname}
            </h3>
          </Link>
          {fansCount !== undefined && (
            <p className="text-sm text-muted-foreground">
              {new Intl.NumberFormat("de-DE").format(fansCount)} Fans
            </p>
          )}
        </div>
      </div>

      <Button
        onClick={handleFollow}
        variant={isFollowing ? "outline" : "default"}
        className={cn(
          "w-full",
          isFollowing && "border-green-500 text-green-600 hover:bg-green-50 dark:hover:bg-green-950"
        )}
      >
        {isFollowing ? (
          <>
            <Check className="size-4 mr-2" />
            Gefolgt
          </>
        ) : (
          <>
            <UserPlus className="size-4 mr-2" />
            Folgen
          </>
        )}
      </Button>
    </div>
  )
}

