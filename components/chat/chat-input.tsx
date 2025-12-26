"use client"

import * as React from "react"
import { Smile, Paperclip, Mic, Send, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { EmojiPickerComponent } from "@/components/ui/emoji-picker"

interface ChatInputProps {
  onSend: (message: string) => void | Promise<void>
  onTyping?: () => void
  className?: string
  disabled?: boolean
}

export function ChatInput({ onSend, onTyping, className, disabled = false }: ChatInputProps) {
  const [message, setMessage] = React.useState("")
  const [showEmojiPicker, setShowEmojiPicker] = React.useState(false)
  const [attachedFile, setAttachedFile] = React.useState<string | null>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const typingTimeoutRef = React.useRef<NodeJS.Timeout | null>(null)

  const handleSend = async () => {
    if ((message.trim() || attachedFile) && !disabled) {
      // Clear typing timeout on send
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
        typingTimeoutRef.current = null
      }
      
      await onSend(message)
      setMessage("")
      setAttachedFile(null)
      setShowEmojiPicker(false)
    }
  }

  const handleMessageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMessage = e.target.value
    setMessage(newMessage)

    // Send typing event with debounce
    if (onTyping && newMessage.trim()) {
      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }

      // Send typing event
      onTyping()

      // Set new timeout to stop sending if user stops typing
      typingTimeoutRef.current = setTimeout(() => {
        typingTimeoutRef.current = null
      }, 3000)
    }
  }

  // Cleanup timeout on unmount
  React.useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
    }
  }, [])

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleEmojiClick = (emoji: string) => {
    console.log('[EMOJI] Selected emoji:', emoji)
    setMessage((prev) => prev + emoji)
    setShowEmojiPicker(false)
    // Focus input after emoji insert
    setTimeout(() => {
      inputRef.current?.focus()
    }, 100)
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
            <>
              {/* Backdrop to close picker */}
              <div 
                className="fixed inset-0 z-[9998]" 
                onClick={() => setShowEmojiPicker(false)}
              />
              <div className="absolute bottom-full left-0 mb-2 z-[9999]">
                <EmojiPickerComponent onEmojiClick={handleEmojiClick} />
              </div>
            </>
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
          onChange={handleMessageChange}
          onKeyPress={handleKeyPress}
          className="flex-1"
        />

        {/* Send Button */}
        <Button
          type="button"
          onClick={handleSend}
          disabled={disabled || (!message.trim() && !attachedFile)}
          size="icon"
          className="bg-primary hover:bg-primary/90"
        >
          <Send className="size-5" />
        </Button>
      </div>
    </div>
  )
}
