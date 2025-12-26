"use client"

import * as React from "react"
import { EmojiPicker } from "frimousse"
import { Search } from "lucide-react"
import { cn } from "@/lib/utils"

interface EmojiPickerComponentProps {
  onEmojiClick: (emoji: string) => void
  className?: string
}

export function EmojiPickerComponent({ onEmojiClick, className }: EmojiPickerComponentProps) {
  return (
    <EmojiPicker.Root>
      <div className={cn(
        "bg-background border rounded-lg shadow-lg overflow-hidden",
        "w-[350px] h-[400px] flex flex-col",
        className
      )}>
        {/* Search */}
        <div className="p-3 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <EmojiPicker.Search 
              placeholder="Search emoji..."
              className="w-full pl-9 pr-3 py-2 text-sm border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        {/* Viewport */}
        <EmojiPicker.Viewport className="flex-1 overflow-hidden">
          <EmojiPicker.Loading>
            <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
              Loading emojis...
            </div>
          </EmojiPicker.Loading>
          
          <EmojiPicker.Empty>
            <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
              No emoji found
            </div>
          </EmojiPicker.Empty>
          
          <EmojiPicker.List 
            className="select-none pb-1.5"
            components={{
              CategoryHeader: ({ category, ...props }) => (
                <div
                  className="px-3 pt-3 pb-1.5 font-medium text-xs text-muted-foreground"
                  {...props}
                >
                  {category.label}
                </div>
              ),
              Row: ({ children, ...props }) => (
                <div className="scroll-my-1.5 px-1.5" {...props}>
                  {children}
                </div>
              ),
              Emoji: ({ emoji, ...props }) => (
                <button
                  type="button"
                  {...props}
                  className={cn(
                    "flex size-10 items-center justify-center",
                    "rounded-md text-2xl",
                    "data-[active]:bg-accent",
                    "transition-colors duration-100",
                    "cursor-pointer"
                  )}
                  title={emoji.label}
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    onEmojiClick(emoji.emoji)
                  }}
                >
                  {emoji.emoji}
                </button>
              ),
            }}
          />
        </EmojiPicker.Viewport>
      </div>
    </EmojiPicker.Root>
  )
}

