"use client"

import * as React from "react"
import { CheckCheck } from "lucide-react"
import { formatTimestamp, type Message } from "./chat-utils"
import { VideoMessage } from "./video-message"
import { ImageGalleryMessage } from "./image-gallery-message"
import { cn } from "@/lib/utils"

interface ChatMessageProps {
  message: Message
}

export function ChatMessage({ message }: ChatMessageProps) {
  return (
    <div className="flex flex-col items-end gap-1 mb-4 px-4">
      {message.type === "text" && (
        <div className="bg-primary text-primary-foreground rounded-lg px-4 py-2 max-w-[70%]">
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
        {message.read && (
          <CheckCheck className={cn("size-4 text-green-500")} />
        )}
      </div>
    </div>
  )
}
