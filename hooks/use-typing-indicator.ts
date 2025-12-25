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
      return
    }

    let intervalId: NodeJS.Timeout

    const pollTypingUsers = async () => {
      try {
        const response = await fetch(`/api/chat/${chatId}/typing`)
        if (response.ok) {
          const data = await response.json()
          setTypingUsers(data.typingUsers || [])
        }
      } catch (error) {
        console.error('Error polling typing users:', error)
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
      }
      setIsPolling(false)
    }
  }, [chatId, enabled])

  // Send typing event
  const sendTypingEvent = useCallback(async () => {
    if (!enabled || !chatId) {
      return
    }

    try {
      await fetch(`/api/chat/${chatId}/typing`, {
        method: 'POST',
      })
    } catch (error) {
      console.error('Error sending typing event:', error)
    }
  }, [chatId, enabled])

  return {
    typingUsers,
    isPolling,
    sendTypingEvent,
  }
}

