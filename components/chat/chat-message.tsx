"use client"

import * as React from "react"
import { CheckCheck, Check, Clock, AlertCircle } from "lucide-react"
import { formatTimestamp, type Message, type MessageStatus } from "./chat-utils"
import { VideoMessage } from "./video-message"
import { ImageGalleryMessage } from "./image-gallery-message"
import { cn } from "@/lib/utils"

interface ChatMessageProps {
  message: Message
  isOwnMessage: boolean
}

export function ChatMessage({ message, isOwnMessage }: ChatMessageProps) {
  const renderStatusIcon = () => {
    if (!isOwnMessage) return null

    switch (message.status) {
      case 'sending':
        return <Clock className="h-3 w-3 text-muted-foreground animate-pulse" />
      case 'sent':
        return <Check className="h-3 w-3 text-muted-foreground" />
      case 'delivered':
        return (
          <div className="flex -space-x-1">
            <Check className="h-3 w-3 text-muted-foreground" />
            <Check className="h-3 w-3 text-muted-foreground" />
          </div>
        )
      case 'read':
        return (
          <div className="flex -space-x-1">
            <Check className="h-3 w-3 text-blue-500" />
            <Check className="h-3 w-3 text-blue-500" />
          </div>
        )
      case 'failed':
        return (
          <div className="flex items-center gap-1">
            <AlertCircle className="h-3 w-3 text-destructive" />
            <span className="text-xs text-destructive">Retry</span>
          </div>
        )
      default:
        // Fallback to old read check
        if (message.read) {
          return <CheckCheck className="h-4 w-4 text-green-500" />
        }
        return null
    }
  }

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
              : "bg-muted text-foreground",
            message.isOptimistic && "opacity-70"
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

      {/* Timestamp und Status */}
      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        <span>{formatTimestamp(message.timestamp)}</span>
        {renderStatusIcon()}
      </div>
    </div>
  )
}
