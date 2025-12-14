"use client"

import * as React from "react"
import { Video, Phone, PhoneOff, MoreVertical } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChatMessage } from "./chat-message"
import { ChatInput } from "./chat-input"
import {
  generateDummyChats,
  generateDummyMessages,
  type Message,
} from "./chat-utils"

interface ChatViewProps {
  chatId: string
}

export function ChatView({ chatId }: ChatViewProps) {
  const [messages, setMessages] = React.useState<Message[]>([])
  const chats = generateDummyChats()
  const chat = chats.find((c) => c.id === chatId)

  React.useEffect(() => {
    if (chatId) {
      setMessages(generateDummyMessages(chatId))
    }
  }, [chatId])

  const handleSend = (messageText: string) => {
    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      type: "text",
      content: messageText,
      timestamp: new Date(),
      read: false,
    }
    setMessages((prev) => [...prev, newMessage])
  }

  if (!chat) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        <p>Chat nicht gefunden</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Avatar className="size-10">
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
          <div>
            <h3 className="font-semibold">{chat.participant.name}</h3>
            <p className="text-xs text-green-500">Online</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon">
            <Video className="size-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <PhoneOff className="size-5" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="size-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Profil anzeigen</DropdownMenuItem>
              <DropdownMenuItem>Chat löschen</DropdownMenuItem>
              <DropdownMenuItem>Benachrichtigungen stummschalten</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto py-4">
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
      </div>

      {/* Input Area */}
      <ChatInput onSend={handleSend} />
    </div>
  )
}
