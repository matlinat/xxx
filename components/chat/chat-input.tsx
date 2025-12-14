"use client"

import * as React from "react"
import { Smile, Paperclip, Mic, Send, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import dynamic from "next/dynamic"
import { Theme } from "emoji-picker-react"

// Dynamically import emoji picker to avoid SSR issues
const EmojiPicker = dynamic(
  () => import("emoji-picker-react").then((mod) => mod.default),
  { ssr: false }
)

interface ChatInputProps {
  onSend: (message: string) => void
  className?: string
}

export function ChatInput({ onSend, className }: ChatInputProps) {
  const [message, setMessage] = React.useState("")
  const [showEmojiPicker, setShowEmojiPicker] = React.useState(false)
  const [attachedFile, setAttachedFile] = React.useState<string | null>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)

  const handleSend = () => {
    if (message.trim() || attachedFile) {
      onSend(message)
      setMessage("")
      setAttachedFile(null)
      setShowEmojiPicker(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleEmojiClick = (emojiData: { emoji: string }) => {
    setMessage((prev) => prev + emojiData.emoji)
    setShowEmojiPicker(false)
  }

  const handleFileAttach = () => {
    // File input trigger (UI only for now)
    const input = document.createElement("input")
    input.type = "file"
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        setAttachedFile(file.name)
      }
    }
    input.click()
  }

  return (
    <div className={cn("border-t border-border bg-background p-4", className)}>
      {/* Attached File Display */}
      {attachedFile && (
        <div className="mb-2 flex items-center gap-2">
          <Badge variant="secondary" className="flex items-center gap-1">
            {attachedFile}
            <button
              type="button"
              onClick={() => setAttachedFile(null)}
              className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
            >
              <X className="size-3" />
            </button>
          </Badge>
        </div>
      )}

      {/* Input Area */}
      <div className="flex items-center gap-2">
        {/* Emoji Button */}
        <div className="relative">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className={cn(showEmojiPicker && "bg-accent")}
          >
            <Smile className="size-5" />
          </Button>
          {showEmojiPicker && (
            <div className="absolute bottom-full right-0 mb-2 z-50">
              <EmojiPicker
                onEmojiClick={handleEmojiClick}
                theme={Theme.LIGHT}
                width={350}
                height={400}
              />
            </div>
          )}
        </div>

        {/* File Attach Button */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={handleFileAttach}
        >
          <Paperclip className="size-5" />
        </Button>

        {/* Microphone Button */}
        <Button type="button" variant="ghost" size="icon">
          <Mic className="size-5" />
        </Button>

        {/* Message Input */}
        <Input
          ref={inputRef}
          type="text"
          placeholder="Enter message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          className="flex-1"
        />

        {/* Send Button */}
        <Button
          type="button"
          onClick={handleSend}
          disabled={!message.trim() && !attachedFile}
          size="icon"
          className="bg-primary hover:bg-primary/90"
        >
          <Send className="size-5" />
        </Button>
      </div>
    </div>
  )
}
