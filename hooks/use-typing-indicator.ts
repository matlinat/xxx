// hooks/use-typing-indicator.ts
'use client'

import { useEffect, useState, useCallback } from 'react'

interface UseTypingIndicatorOptions {
  chatId: string
  enabled?: boolean
}

/**
 * Hook to handle typing indicator functionality
 * - Sends typing events when user types
 * - Polls for other users typing
 * - Auto-hides after 3 seconds of inactivity
 */
export function useTypingIndicator({
  chatId,
  enabled = true,
}: UseTypingIndicatorOptions) {
  const [typingUsers, setTypingUsers] = useState<string[]>([])
  const [isPolling, setIsPolling] = useState(false)

  // Poll for typing users
  useEffect(() => {
    if (!enabled || !chatId) {
      console.log('[useTypingIndicator] Not enabled or no chatId:', { enabled, chatId })
      return
    }

    console.log('[useTypingIndicator] 🔄 Starting polling for chat:', chatId)

    let intervalId: NodeJS.Timeout

    const pollTypingUsers = async () => {
      try {
        const response = await fetch(`/api/chat/${chatId}/typing`)
        console.log('[useTypingIndicator] 📥 Poll response:', response.status)
        if (response.ok) {
          const data = await response.json()
          console.log('[useTypingIndicator] 👥 Typing users:', data.typingUsers)
          setTypingUsers(data.typingUsers || [])
        } else {
          console.error('[useTypingIndicator] Poll failed:', response.status, await response.text())
        }
      } catch (error) {
        console.error('[useTypingIndicator] Error polling typing users:', error)
      }
    }

    // Poll every 1 second
    intervalId = setInterval(pollTypingUsers, 1000)
    setIsPolling(true)

    // Initial poll
    pollTypingUsers()

    return () => {
      if (intervalId) {
        clearInterval(intervalId)
        console.log('[useTypingIndicator] 🛑 Stopped polling')
      }
      setIsPolling(false)
    }
  }, [chatId, enabled])

  // Send typing event
  const sendTypingEvent = useCallback(async () => {
    if (!enabled || !chatId) {
      console.log('[useTypingIndicator] Cannot send - not enabled or no chatId')
      return
    }

    console.log('[useTypingIndicator] 📤 Sending typing event to:', `/api/chat/${chatId}/typing`)

    try {
      const response = await fetch(`/api/chat/${chatId}/typing`, {
        method: 'POST',
      })
      console.log('[useTypingIndicator] ✅ Typing event sent, status:', response.status)
      if (!response.ok) {
        console.error('[useTypingIndicator] Failed to send:', await response.text())
      }
    } catch (error) {
      console.error('[useTypingIndicator] ❌ Error sending typing event:', error)
    }
  }, [chatId, enabled])

  return {
    typingUsers,
    isPolling,
    sendTypingEvent,
  }
}

