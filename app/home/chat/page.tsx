"use client"

import * as React from "react"
import { Suspense } from "react"
import { ChatList } from "@/components/chat/chat-list"
import { ChatView } from "@/components/chat/chat-view"
import { useSearchParams } from "next/navigation"

function ChatContent() {
  const searchParams = useSearchParams()
  const chatId = searchParams.get("chatId")

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-background">
      {/* Chat-Liste (linke Sidebar) */}
      <div className="w-full md:w-96 border-r border-border flex-shrink-0">
        <ChatList selectedChatId={chatId || null} />
      </div>

      {/* Chat-Ansicht (rechte Seite) */}
      <div className="flex-1 flex flex-col min-w-0">
        {chatId ? (
          <ChatView chatId={chatId} />
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <p className="text-lg font-medium mb-2">Kein Chat ausgewählt</p>
              <p className="text-sm">Wählen Sie einen Chat aus der Liste aus</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function ChatPage() {
  return (
    <Suspense fallback={
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <p className="text-muted-foreground">Lade Chats...</p>
      </div>
    }>
      <ChatContent />
    </Suspense>
  )
}
