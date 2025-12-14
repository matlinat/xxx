"use client"

import * as React from "react"
import { ChatList } from "@/components/chat/chat-list"
import { ChatView } from "@/components/chat/chat-view"
import { useParams } from "next/navigation"

export default function ChatDetailPage() {
  const params = useParams()
  const chatId = params.chatId as string

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-background">
      {/* Chat-Liste (linke Sidebar) */}
      <div className="w-full md:w-96 border-r border-border flex-shrink-0">
        <ChatList selectedChatId={chatId} />
      </div>

      {/* Chat-Ansicht (rechte Seite) */}
      <div className="flex-1 flex flex-col min-w-0">
        <ChatView chatId={chatId} />
      </div>
    </div>
  )
}
