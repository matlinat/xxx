"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Search, Plus, CheckCheck, Loader2 } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { formatTimestamp, getInitials } from "./chat-utils"
import { loadUserChatsAction } from "@/app/home/chat/actions"
import { toast } from "sonner"
import type { ChatWithParticipant } from "@/lib/supabase/chat"

interface ChatListProps {
  selectedChatId: string | null
}

export function ChatList({ selectedChatId }: ChatListProps) {
  const [searchQuery, setSearchQuery] = React.useState("")
  const [chats, setChats] = React.useState<ChatWithParticipant[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const pathname = usePathname()

  // Load chats on mount
  React.useEffect(() => {
    async function loadChats() {
      setIsLoading(true)
      try {
        const result = await loadUserChatsAction()
        if (result.success && result.chats) {
          setChats(result.chats)
        } else {
          toast.error(result.error || "Fehler beim Laden der Chats")
        }
      } catch (error) {
        console.error("Error loading chats:", error)
        toast.error("Fehler beim Laden der Chats")
      } finally {
        setIsLoading(false)
      }
    }

    loadChats()
  }, [])

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
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="size-8 animate-spin text-muted-foreground" />
          </div>
        ) : filteredChats.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-center px-4">
            <p className="text-muted-foreground">
              {searchQuery ? "Keine Chats gefunden" : "Noch keine Chats"}
            </p>
            {!searchQuery && (
              <p className="text-sm text-muted-foreground mt-2">
                Starte einen Chat mit einem Creator
              </p>
            )}
          </div>
        ) : (
          filteredChats.map((chat) => {
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
                    {chat.participant.avatar_url ? (
                      <AvatarImage src={chat.participant.avatar_url} />
                    ) : null}
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                      {getInitials(chat.participant.name)}
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
                    {chat.last_message && (
                      <span className="text-xs text-muted-foreground ml-2 flex-shrink-0">
                        {formatTimestamp(new Date(chat.last_message.created_at))}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-muted-foreground truncate">
                      {chat.last_message?.content || "Neuer Chat"}
                    </p>
                  </div>
                </div>

                {/* Unread Badge */}
                {chat.unread_count > 0 && (
                  <Badge
                    variant="default"
                    className="bg-green-500 text-white rounded-full size-6 flex items-center justify-center p-0 text-xs font-semibold flex-shrink-0"
                  >
                    {chat.unread_count}
                  </Badge>
                )}
              </Link>
            )
          })
        )}
      </div>
    </div>
  )
}
