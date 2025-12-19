"use client"

import * as React from "react"
import { CheckCheck } from "lucide-react"
import { formatTimestamp, type Message } from "./chat-utils"
import { VideoMessage } from "./video-message"
import { ImageGalleryMessage } from "./image-gallery-message"
import { cn } from "@/lib/utils"

interface ChatMessageProps {
  message: Message
  isOwnMessage: boolean
}

export function ChatMessage({ message, isOwnMessage }: ChatMessageProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-1 mb-4 px-4",
        isOwnMessage ? "items-end" : "items-start"
      )}
    >
      {message.type === "text" && (
        <div
          className={cn(
            "rounded-lg px-4 py-2 max-w-[70%]",
            isOwnMessage
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-foreground"
          )}
        >
          <p className="text-sm whitespace-pre-wrap break-words">
            {message.content}
          </p>
        </div>
      )}

      {message.type === "video" && (
        <VideoMessage
          videoUrl={message.videoUrl || ""}
          duration={message.videoDuration || ""}
        />
      )}

      {message.type === "image_gallery" && (
        <ImageGalleryMessage images={message.images || []} />
      )}

      {/* Timestamp und Read-Status */}
      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        <span>{formatTimestamp(message.timestamp)}</span>
        {isOwnMessage && message.read && (
          <CheckCheck className={cn("size-4 text-green-500")} />
        )}
      </div>
    </div>
  )
}
