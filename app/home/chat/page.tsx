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
    <div className="flex h-[calc(100vh-4rem)] bg-background overflow-hidden">
      {/* Chat-Liste: immer sichtbar auf Desktop, auf Mobile nur wenn kein Chat ausgewählt */}
      <div className={`${chatId ? 'hidden md:flex' : 'flex'} w-full md:w-96 md:max-w-96 border-r border-border flex-shrink-0 overflow-hidden`}>
        <ChatList selectedChatId={chatId || null} />
      </div>

      {/* Chat-Ansicht: nur auf Desktop sichtbar wenn kein Chat ausgewählt */}
      <div className={`${chatId ? 'flex' : 'hidden md:flex'} flex-1 flex-col min-w-0 overflow-hidden`}>
        {chatId ? (
          <ChatView chatId={chatId} showBackButton={true} />
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
