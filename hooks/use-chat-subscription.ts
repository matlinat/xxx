// hooks/use-chat-subscription.ts
'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { RealtimeChannel } from '@supabase/supabase-js'

export interface RealtimeMessage {
  id: string
  chat_id: string
  sender_id: string
  message_type: 'text' | 'image' | 'video' | 'paid_media'
  content: string | null
  media_url: string | null
  created_at: string
}

interface UseChatSubscriptionOptions {
  chatId: string
  onMessage: (message: RealtimeMessage) => void
  enabled?: boolean
}

/**
 * Hook to subscribe to real-time chat messages using Supabase Realtime
 * 
 * This provides instant message delivery without Redis complexity
 * Supabase Realtime uses PostgreSQL's LISTEN/NOTIFY under the hood
 */
export function useChatSubscription({
  chatId,
  onMessage,
  enabled = true,
}: UseChatSubscriptionOptions) {
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    if (!enabled || !chatId) return

    let channel: RealtimeChannel

    const setupSubscription = async () => {
      try {
        // Subscribe to INSERT events on chat_messages for this chat
        channel = supabase
          .channel(`chat:${chatId}`)
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'chat_messages',
              filter: `chat_id=eq.${chatId}`,
            },
            (payload) => {
              console.log('[Realtime] New message:', payload)
              const newMessage = payload.new as RealtimeMessage
              onMessage(newMessage)
            }
          )
          .subscribe((status) => {
            console.log('[Realtime] Subscription status:', status)
            if (status === 'SUBSCRIBED') {
              setIsConnected(true)
              setError(null)
            } else if (status === 'CHANNEL_ERROR') {
              setError('Connection error')
              setIsConnected(false)
            } else if (status === 'TIMED_OUT') {
              setError('Connection timeout')
              setIsConnected(false)
            } else if (status === 'CLOSED') {
              setIsConnected(false)
            }
          })
      } catch (err) {
        console.error('[Realtime] Subscription error:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
        setIsConnected(false)
      }
    }

    setupSubscription()

    // Cleanup on unmount
    return () => {
      if (channel) {
        console.log('[Realtime] Unsubscribing from chat:', chatId)
        supabase.removeChannel(channel)
        setIsConnected(false)
      }
    }
  }, [chatId, enabled, onMessage, supabase])

  return {
    isConnected,
    error,
  }
}

