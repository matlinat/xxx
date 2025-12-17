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
      {/* Chat-Liste: nur auf Desktop sichtbar */}
      <div className="hidden md:flex md:w-96 border-r border-border flex-shrink-0">
        <ChatList selectedChatId={chatId} />
      </div>

      {/* Chat-Ansicht: volle Breite auf Mobile, flex-1 auf Desktop */}
      <div className="flex-1 flex flex-col min-w-0 w-full md:w-auto">
        <ChatView chatId={chatId} showBackButton={true} />
      </div>
    </div>
  )
}
