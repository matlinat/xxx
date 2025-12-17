"use client"

import * as React from "react"
import { Suspense } from "react"
import { ChatList } from "@/components/chat/chat-list"
import { ChatView } from "@/components/chat/chat-view"
import { useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "motion/react"

function ChatContent() {
  const searchParams = useSearchParams()
  const chatId = searchParams.get("chatId")

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-background overflow-hidden relative">
      {/* Mobile: Chat-Liste (ohne Exit-Animation) */}
      {!chatId && (
        <div className="md:hidden w-full border-r border-border flex-shrink-0 overflow-hidden absolute inset-0">
          <ChatList selectedChatId={chatId || null} />
        </div>
      )}

      {/* Desktop: Chat-Liste statisch (immer sichtbar) */}
      <div className="hidden md:flex md:w-96 md:max-w-96 border-r border-border flex-shrink-0 overflow-hidden">
        <ChatList selectedChatId={chatId || null} />
      </div>

      {/* Mobile: Chat-Ansicht mit Slide-In Animation */}
      {chatId && (
        <motion.div
          key={`chat-mobile-${chatId}`}
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          transition={{ type: 'tween', duration: 0.3, ease: 'easeInOut' }}
          className="md:hidden flex-1 flex flex-col min-w-0 overflow-hidden absolute inset-0"
        >
          <ChatView chatId={chatId} showBackButton={true} />
        </motion.div>
      )}

      {/* Desktop: Chat-Ansicht ohne Animation */}
      {chatId ? (
        <div className="hidden md:flex flex-1 flex-col min-w-0 overflow-hidden">
          <ChatView chatId={chatId} showBackButton={false} />
        </div>
      ) : (
        <div className="hidden md:flex flex-1 items-center justify-center text-muted-foreground">
          <div className="text-center">
            <p className="text-lg font-medium mb-2">Kein Chat ausgewählt</p>
            <p className="text-sm">Wählen Sie einen Chat aus der Liste aus</p>
          </div>
        </div>
      )}
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
