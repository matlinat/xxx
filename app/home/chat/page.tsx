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
      {/* Mobile: Chat-Liste mit Animation */}
      <AnimatePresence mode="wait" initial={false}>
        {!chatId && (
          <motion.div
            key="chat-list-mobile"
            initial={{ x: '-100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '-100%', opacity: 0 }}
            transition={{ type: 'tween', duration: 0.3, ease: 'easeInOut' }}
            className="md:hidden w-full border-r border-border flex-shrink-0 overflow-hidden absolute inset-0"
          >
            <ChatList selectedChatId={chatId || null} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop: Chat-Liste statisch (immer sichtbar) */}
      <div className="hidden md:flex md:w-96 md:max-w-96 border-r border-border flex-shrink-0 overflow-hidden">
        <ChatList selectedChatId={chatId || null} />
      </div>

      {/* Chat-Ansicht mit Animation auf Mobile, statisch auf Desktop */}
      <AnimatePresence mode="wait" initial={false}>
        {chatId ? (
          <motion.div
            key={`chat-${chatId}`}
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'tween', duration: 0.3, ease: 'easeInOut' }}
            className="flex-1 flex flex-col min-w-0 overflow-hidden absolute inset-0 md:relative"
          >
            <ChatView chatId={chatId} showBackButton={true} />
          </motion.div>
        ) : (
          <motion.div
            key="empty-state"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="hidden md:flex flex-1 items-center justify-center text-muted-foreground"
          >
            <div className="text-center">
              <p className="text-lg font-medium mb-2">Kein Chat ausgewählt</p>
              <p className="text-sm">Wählen Sie einen Chat aus der Liste aus</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
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
