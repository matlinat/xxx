// lib/supabase/chat.ts
import { createClient } from './server'
import { supabaseAdmin } from './admin'

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface Chat {
  id: string
  creator_id: string
  subscriber_id: string
  created_at: string
  updated_at: string
}

export interface ChatWithParticipant extends Chat {
  participant: {
    id: string
    name: string
    avatar_url: string | null
    username: string | null
    online: boolean
  }
  last_message: {
    content: string
    created_at: string
    message_type: string
  } | null
  unread_count: number
}

export interface ChatMessage {
  id: string
  chat_id: string
  sender_id: string
  message_type: 'text' | 'image' | 'video' | 'paid_media'
  content: string | null
  media_url: string | null
  price: number | null
  unlocked_by: string[]
  read_at: string | null
  created_at: string
}

export interface ChatMessageWithSender extends ChatMessage {
  sender: {
    id: string
    name: string
    avatar_url: string | null
    username: string | null
  }
}

export interface ChatParticipant {
  id: string
  chat_id: string
  user_id: string
  last_read_at: string | null
  notifications_enabled: boolean
  created_at: string
  updated_at: string
}

// ============================================
// CHAT OPERATIONS
// ============================================

/**
 * Get or create a chat between two users
 * Ensures only one chat exists between any two users
 */
export async function getOrCreateChat(
  currentUserId: string,
  otherUserId: string
): Promise<{ chat: Chat; isNew: boolean }> {
  const supabase = await createClient()

  // Try to find existing chat (either direction)
  const { data: existingChat, error: findError } = await supabase
    .from('chats')
    .select('*')
    .or(
      `and(creator_id.eq.${currentUserId},subscriber_id.eq.${otherUserId}),and(creator_id.eq.${otherUserId},subscriber_id.eq.${currentUserId})`
    )
    .maybeSingle()

  if (findError) {
    console.error('Error finding chat:', findError)
    throw new Error('Fehler beim Suchen des Chats')
  }

  if (existingChat) {
    return { chat: existingChat, isNew: false }
  }

  // Create new chat
  const { data: newChat, error: createError } = await supabase
    .from('chats')
    .insert({
      creator_id: currentUserId,
      subscriber_id: otherUserId,
    })
    .select()
    .single()

  if (createError) {
    console.error('Error creating chat:', createError)
    throw new Error('Fehler beim Erstellen des Chats')
  }

  // Create participant records for both users
  const { error: participantsError } = await supabase
    .from('chat_participants')
    .insert([
      { chat_id: newChat.id, user_id: currentUserId },
      { chat_id: newChat.id, user_id: otherUserId },
    ])

  if (participantsError) {
    console.error('Error creating participants:', participantsError)
    // Non-fatal, participants will be created lazily if needed
  }

  return { chat: newChat, isNew: true }
}

/**
 * Get a single chat by ID
 */
export async function getChatById(chatId: string): Promise<Chat | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('chats')
    .select('*')
    .eq('id', chatId)
    .maybeSingle()

  if (error) {
    console.error('Error fetching chat:', error)
    throw new Error('Fehler beim Laden des Chats')
  }

  return data
}

/**
 * Get all chats for a user with participant info and last message
 */
export async function getUserChats(userId: string): Promise<ChatWithParticipant[]> {
  const perfStart = performance.now()
  const supabase = await createClient()

  // Get all chats where user is either creator or subscriber
  const chatsStart = performance.now()
  const { data: chats, error: chatsError } = await supabase
    .from('chats')
    .select('*')
    .or(`creator_id.eq.${userId},subscriber_id.eq.${userId}`)
    .order('updated_at', { ascending: false })
  console.log(`[PERF DB] 💬 Fetch chats: ${(performance.now() - chatsStart).toFixed(0)}ms`)

  if (chatsError) {
    console.error('Error fetching chats:', chatsError)
    throw new Error('Fehler beim Laden der Chats')
  }

  if (!chats || chats.length === 0) {
    return []
  }

  // Get other participant's info for each chat
  const chatIds = chats.map((c) => c.id)
  const otherUserIds = chats.map((c) =>
    c.creator_id === userId ? c.subscriber_id : c.creator_id
  )

  // Fetch user profiles
  const profilesStart = performance.now()
  const { data: profiles, error: profilesError } = await supabase
    .from('creator_profiles')
    .select('user_id, display_name, avatar_url, username')
    .in('user_id', otherUserIds)
  console.log(`[PERF DB] 👥 Fetch profiles: ${(performance.now() - profilesStart).toFixed(0)}ms`)

  if (profilesError) {
    console.error('Error fetching profiles:', profilesError)
  }

  // Fetch last message for each chat
  const messagesStart = performance.now()
  const { data: lastMessages, error: messagesError } = await supabase
    .from('chat_messages')
    .select('chat_id, content, created_at, message_type')
    .in('chat_id', chatIds)
    .order('created_at', { ascending: false })
  console.log(`[PERF DB] 💬 Fetch last messages: ${(performance.now() - messagesStart).toFixed(0)}ms`)

  if (messagesError) {
    console.error('Error fetching last messages:', messagesError)
  }

  // Get unread counts in batch (OPTIMIZED: Single query instead of N queries)
  const unreadStart = performance.now()
  const unreadCountsMap = await getUnreadCountsBatch(chatIds, userId)
  console.log(`[PERF DB] 🔢 Batch unread counts: ${(performance.now() - unreadStart).toFixed(0)}ms`)

  // Combine data
  const result = chats.map((chat, index) => {
    const otherUserId = chat.creator_id === userId ? chat.subscriber_id : chat.creator_id
    const profile = profiles?.find((p) => p.user_id === otherUserId)
    const lastMessage = lastMessages?.find((m) => m.chat_id === chat.id)

    return {
      ...chat,
      participant: {
        id: otherUserId,
        name: profile?.display_name || 'Unknown User',
        avatar_url: profile?.avatar_url || null,
        username: profile?.username || null,
        online: false, // Will be populated in later step with Redis
      },
      last_message: lastMessage
        ? {
            content: lastMessage.content || '[Media]',
            created_at: lastMessage.created_at,
            message_type: lastMessage.message_type,
          }
        : null,
      unread_count: unreadCountsMap.get(chat.id) || 0,
    }
  })

  console.log(`[PERF DB] ✅ TOTAL getUserChats: ${(performance.now() - perfStart).toFixed(0)}ms`)
  return result
}

/**
 * Get messages for a chat
 */
export async function getChatMessages(
  chatId: string,
  options: {
    limit?: number
    offset?: number
    beforeTimestamp?: string
  } = {}
): Promise<ChatMessageWithSender[]> {
  const supabase = await createClient()
  const { limit = 50, offset = 0, beforeTimestamp } = options

  let query = supabase
    .from('chat_messages')
    .select('*')
    .eq('chat_id', chatId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (beforeTimestamp) {
    query = query.lt('created_at', beforeTimestamp)
  }

  const { data: messages, error } = await query

  if (error) {
    console.error('Error fetching messages:', error)
    throw new Error('Fehler beim Laden der Nachrichten')
  }

  if (!messages || messages.length === 0) return []

  // Get unique sender IDs
  const senderIds = [...new Set(messages.map((m) => m.sender_id))]

  // Fetch sender profiles separately
  const { data: profiles, error: profilesError } = await supabase
    .from('creator_profiles')
    .select('user_id, display_name, avatar_url, username')
    .in('user_id', senderIds)

  if (profilesError) {
    console.error('Error fetching sender profiles:', profilesError)
  }

  // Combine messages with sender info
  return messages.map((msg) => {
    const profile = profiles?.find((p) => p.user_id === msg.sender_id)
    return {
      id: msg.id,
      chat_id: msg.chat_id,
      sender_id: msg.sender_id,
      message_type: msg.message_type,
      content: msg.content,
      media_url: msg.media_url,
      price: msg.price,
      unlocked_by: msg.unlocked_by || [],
      read_at: msg.read_at,
      created_at: msg.created_at,
      sender: {
        id: msg.sender_id,
        name: profile?.display_name || 'Unknown User',
        avatar_url: profile?.avatar_url || null,
        username: profile?.username || null,
      },
    }
  })
}

/**
 * Insert a new message into a chat
 */
export async function insertMessage(
  chatId: string,
  senderId: string,
  messageType: 'text' | 'image' | 'video' | 'paid_media',
  content: string | null,
  mediaUrl: string | null = null,
  price: number | null = null
): Promise<ChatMessage> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('chat_messages')
    .insert({
      chat_id: chatId,
      sender_id: senderId,
      message_type: messageType,
      content,
      media_url: mediaUrl,
      price,
    })
    .select()
    .single()

  if (error) {
    console.error('Error inserting message:', error)
    throw new Error('Fehler beim Senden der Nachricht')
  }

  return data
}

/**
 * Get unread message count for a user in a chat
 */
export async function getUnreadCount(chatId: string, userId: string): Promise<number> {
  const supabase = await createClient()

  // Get last_read_at from participants
  const { data: participant } = await supabase
    .from('chat_participants')
    .select('last_read_at')
    .eq('chat_id', chatId)
    .eq('user_id', userId)
    .maybeSingle()

  const lastReadAt = participant?.last_read_at

  // Count messages after last_read_at from other users
  let query = supabase
    .from('chat_messages')
    .select('id', { count: 'exact', head: true })
    .eq('chat_id', chatId)
    .neq('sender_id', userId)

  if (lastReadAt) {
    query = query.gt('created_at', lastReadAt)
  }

  const { count, error } = await query

  if (error) {
    console.error('Error getting unread count:', error)
    return 0
  }

  return count || 0
}

/**
 * OPTIMIZED: Get unread counts for multiple chats in batch
 * Reduces N separate queries to 2 queries total
 */
export async function getUnreadCountsBatch(
  chatIds: string[],
  userId: string
): Promise<Map<string, number>> {
  const supabase = await createClient()
  const unreadCounts = new Map<string, number>()

  if (chatIds.length === 0) {
    return unreadCounts
  }

  // Get all participants data in one query
  const { data: participants } = await supabase
    .from('chat_participants')
    .select('chat_id, last_read_at')
    .in('chat_id', chatIds)
    .eq('user_id', userId)

  // Create map of last_read_at by chat_id
  const lastReadAtMap = new Map<string, string | null>()
  participants?.forEach((p) => {
    lastReadAtMap.set(p.chat_id, p.last_read_at)
  })

  // Count unread messages for all chats
  // We'll do this per-chat to respect last_read_at, but in a more efficient way
  const countPromises = chatIds.map(async (chatId) => {
    const lastReadAt = lastReadAtMap.get(chatId)
    
    let query = supabase
      .from('chat_messages')
      .select('id', { count: 'exact', head: true })
      .eq('chat_id', chatId)
      .neq('sender_id', userId)

    if (lastReadAt) {
      query = query.gt('created_at', lastReadAt)
    }

    const { count } = await query
    return { chatId, count: count || 0 }
  })

  const results = await Promise.all(countPromises)
  results.forEach(({ chatId, count }) => {
    unreadCounts.set(chatId, count)
  })

  return unreadCounts
}

/**
 * Mark messages as read in a chat
 */
export async function markMessagesAsRead(chatId: string, userId: string): Promise<void> {
  const supabase = await createClient()
  const now = new Date().toISOString()

  // Update or create participant record with last_read_at
  const { error } = await supabase
    .from('chat_participants')
    .upsert(
      {
        chat_id: chatId,
        user_id: userId,
        last_read_at: now,
        updated_at: now,
      },
      {
        onConflict: 'chat_id,user_id',
      }
    )

  if (error) {
    console.error('Error marking messages as read:', error)
    throw new Error('Fehler beim Markieren als gelesen')
  }

  // Update individual messages (optional, for more granular read receipts)
  await supabase
    .from('chat_messages')
    .update({ read_at: now })
    .eq('chat_id', chatId)
    .neq('sender_id', userId)
    .is('read_at', null)
}

/**
 * Verify user is participant in chat
 */
export async function verifyUserInChat(chatId: string, userId: string): Promise<boolean> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('chats')
    .select('id')
    .eq('id', chatId)
    .or(`creator_id.eq.${userId},subscriber_id.eq.${userId}`)
    .maybeSingle()

  if (error) {
    console.error('Error verifying user in chat:', error)
    return false
  }

  return !!data
}

