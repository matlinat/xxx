"use client"

import * as React from "react"
import { ChatList } from "@/components/chat/chat-list"
import { ChatView } from "@/components/chat/chat-view"
import { useParams } from "next/navigation"
import { motion } from "motion/react"

export default function ChatDetailPage() {
  const params = useParams()
  const chatId = params.chatId as string

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-background overflow-hidden">
      {/* Chat-Liste: nur auf Desktop sichtbar */}
      <div className="hidden md:flex md:w-96 md:max-w-96 border-r border-border flex-shrink-0 overflow-hidden">
        <ChatList selectedChatId={chatId} />
      </div>

      {/* Mobile: Chat-Ansicht mit Slide-Animation */}
      <motion.div
        key={`chat-mobile-${chatId}`}
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        transition={{ type: 'tween', duration: 0.3, ease: 'easeInOut' }}
        className="md:hidden flex-1 flex flex-col min-w-0 overflow-hidden"
      >
        <ChatView chatId={chatId} showBackButton={true} />
      </motion.div>

      {/* Desktop: Chat-Ansicht ohne Animation */}
      <div className="hidden md:flex flex-1 flex-col min-w-0 overflow-hidden">
        <ChatView chatId={chatId} showBackButton={false} />
      </div>
    </div>
  )
}
