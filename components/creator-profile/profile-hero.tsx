// components/creator-profile/profile-hero.tsx
"use client"

import { Users, Video, MessageCircle } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

type AvailableFor = "live-chat" | "live-video" | "offline"

interface ProfileHeroProps {
  nickname: string
  avatarUrl: string
  coverUrl: string
  isOnline: boolean
  availableFor: AvailableFor
  fansCount: number
}

function formatFansCount(count: number): string {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`
  }
  return count.toLocaleString("de-DE")
}

function getAvailabilityText(availableFor: AvailableFor): string {
  switch (availableFor) {
    case "live-chat":
      return "Live Chat verfügbar"
    case "live-video":
      return "Live Video verfügbar"
    case "offline":
      return "Offline"
  }
}

function getAvailabilityIcon(availableFor: AvailableFor) {
  switch (availableFor) {
    case "live-chat":
      return MessageCircle
    case "live-video":
      return Video
    case "offline":
      return null
  }
}

export function ProfileHero({
  nickname,
  avatarUrl,
  coverUrl,
  isOnline,
  availableFor,
  fansCount,
}: ProfileHeroProps) {
  const AvailabilityIcon = getAvailabilityIcon(availableFor)
  const initials = nickname
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className="relative">
      {/* Cover Image - größer auf Mobile, ursprünglich auf Desktop */}
      <div className="relative h-48 sm:h-72 md:h-56 lg:h-64 w-full overflow-hidden bg-gradient-to-r from-purple-600 to-pink-600">
        <img
          src={coverUrl}
          alt={`${nickname} Cover`}
          className="w-full h-full object-cover"
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
      </div>

      {/* Profile Info Container */}
      <div className="relative mx-auto max-w-7xl px-4">
        <div className="flex flex-col md:flex-row md:items-end gap-4 -mt-24 md:-mt-16 items-center md:items-end">
          {/* Avatar - 2x größer Mobile, 1.5x größer Desktop */}
          <div className="relative">
            <Avatar className="size-48 md:size-64 border-4 border-background shadow-xl">
              <AvatarImage src={avatarUrl} alt={nickname} />
              <AvatarFallback className="text-4xl md:text-5xl bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                {initials}
              </AvatarFallback>
            </Avatar>
            {/* Online Indicator */}
            {isOnline && (
              <span className="absolute bottom-2 right-2 size-6 md:size-8 rounded-full bg-green-500 border-4 border-background" />
            )}
          </div>

          {/* Name & Status - zentriert auf Mobile, linksbündig auf Desktop */}
          <div className="flex-1 pb-2 md:pb-4 text-center md:text-left">
            <h1 className="text-2xl md:text-3xl font-bold">{nickname}</h1>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-1 text-sm text-muted-foreground">
              {/* Online Status */}
              <span
                className={cn(
                  "flex items-center gap-1.5",
                  isOnline ? "text-green-500" : "text-muted-foreground"
                )}
              >
                <span
                  className={cn(
                    "size-2 rounded-full",
                    isOnline ? "bg-green-500 animate-pulse" : "bg-muted-foreground"
                  )}
                />
                {isOnline ? "Online" : "Offline"}
              </span>

              {/* Availability */}
              {isOnline && AvailabilityIcon && (
                <span className="flex items-center gap-1.5 text-purple-400">
                  <AvailabilityIcon className="size-4" />
                  {getAvailabilityText(availableFor)}
                </span>
              )}

              {/* Fans Counter */}
              <span className="flex items-center gap-1.5">
                <Users className="size-4" />
                {formatFansCount(fansCount)} Fans
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

