"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Search, Plus, CheckCheck } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  generateDummyChats,
  formatTimestamp,
  type Chat,
} from "./chat-utils"

interface ChatListProps {
  selectedChatId: string | null
}

export function ChatList({ selectedChatId }: ChatListProps) {
  const [searchQuery, setSearchQuery] = React.useState("")
  const [chats] = React.useState<Chat[]>(generateDummyChats())
  const pathname = usePathname()

  const filteredChats = chats.filter((chat) =>
    chat.participant.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="flex flex-col h-full w-full bg-background overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border flex-shrink-0">
        <h2 className="text-xl font-bold">Chats</h2>
        <Button variant="ghost" size="icon" className="rounded-full">
          <Plus className="size-5" />
        </Button>
      </div>

      {/* Search */}
      <div className="p-4 border-b border-border flex-shrink-0">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Chats durchsuchen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {filteredChats.map((chat) => {
          const isActive = selectedChatId === chat.id
          const chatUrl = `/home/chat/${chat.id}`

          return (
            <Link
              key={chat.id}
              href={chatUrl}
              className={cn(
                "flex items-center gap-3 p-4 border-b border-border hover:bg-accent/50 transition-colors",
                isActive && "bg-accent"
              )}
            >
              {/* Avatar mit Online-Status */}
              <div className="relative flex-shrink-0">
                <Avatar className="size-12">
                  {chat.participant.avatar ? (
                    <AvatarImage src={chat.participant.avatar} />
                  ) : null}
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                    {chat.participant.initials}
                  </AvatarFallback>
                </Avatar>
                {chat.participant.online && (
                  <div className="absolute bottom-0 right-0 size-3 bg-green-500 border-2 border-background rounded-full" />
                )}
              </div>

              {/* Chat Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-medium truncate">{chat.participant.name}</h3>
                  <span className="text-xs text-muted-foreground ml-2 flex-shrink-0">
                    {formatTimestamp(chat.lastMessage.timestamp)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {chat.lastMessage.read && (
                    <CheckCheck className="size-4 text-green-500 flex-shrink-0" />
                  )}
                  <p className="text-sm text-muted-foreground truncate">
                    {chat.lastMessage.text}
                  </p>
                </div>
              </div>

              {/* Unread Badge */}
              {chat.unreadCount > 0 && (
                <Badge
                  variant="default"
                  className="bg-green-500 text-white rounded-full size-6 flex items-center justify-center p-0 text-xs font-semibold flex-shrink-0"
                >
                  {chat.unreadCount}
                </Badge>
              )}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
