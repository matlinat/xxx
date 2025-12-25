'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { RealtimeChannel } from '@supabase/supabase-js'

interface PresenceState {
  [userId: string]: {
    online_at: string
    user_id: string
    user_name?: string
  }[]
}

export function usePresence(chatId: string, userId?: string) {
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set())
  const [lastSeen, setLastSeen] = useState<Record<string, Date>>({})
  const supabase = createClient()

  useEffect(() => {
    if (!chatId || !userId) return

    const channel: RealtimeChannel = supabase.channel(`presence:${chatId}`, {
      config: {
        presence: { key: userId }
      }
    })

    // Track presence changes
    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState<PresenceState>()
        const online = new Set(Object.keys(state))
        setOnlineUsers(online)
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        setOnlineUsers(prev => new Set([...prev, key]))
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        setOnlineUsers(prev => {
          const updated = new Set(prev)
          updated.delete(key)
          return updated
        })
        
        // Track last seen
        setLastSeen(prev => ({
          ...prev,
          [key]: new Date()
        }))
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          // Announce presence
          await channel.track({
            online_at: new Date().toISOString(),
            user_id: userId
          })
        }
      })

    // Heartbeat to keep presence alive
    const heartbeat = setInterval(() => {
      channel.track({
        online_at: new Date().toISOString(),
        user_id: userId
      })
    }, 30000) // Every 30 seconds

    return () => {
      clearInterval(heartbeat)
      channel.unsubscribe()
    }
  }, [chatId, userId])

  return {
    isOnline: (checkUserId: string) => onlineUsers.has(checkUserId),
    getLastSeen: (checkUserId: string) => lastSeen[checkUserId],
    onlineCount: onlineUsers.size
  }
}

