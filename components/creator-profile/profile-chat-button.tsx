// components/creator-profile/profile-chat-button.tsx
"use client"

import { MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ProfileChatButtonProps {
  isOnline: boolean
  username: string
}

export function ProfileChatButton({ isOnline, username }: ProfileChatButtonProps) {
  if (!isOnline) return null

  const handleChat = () => {
    // TODO: Implement chat functionality
    console.log(`Start chat with ${username}`)
  }

  return (
    <Button
      onClick={handleChat}
      size="lg"
      className={cn(
        "fixed bottom-6 right-6 z-50",
        "h-14 px-6 rounded-full shadow-2xl",
        "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700",
        "text-white font-semibold text-base",
        "flex items-center gap-2",
        "animate-pulse hover:animate-none",
        "md:bottom-8 md:right-8"
      )}
    >
      <MessageCircle className="size-5" />
      <span>Let's Chat</span>
    </Button>
  )
}

