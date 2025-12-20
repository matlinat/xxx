// app/home/chat/actions.ts
'use server'

import { createClient } from '@/lib/supabase/server'
import {
  getOrCreateChat,
  getChatById,
  getUserChats,
  getChatMessages,
  insertMessage,
  markMessagesAsRead,
  verifyUserInChat,
  type ChatWithParticipant,
  type ChatMessageWithSender,
} from '@/lib/supabase/chat'
import {
  getWalletBalance,
  createExpenseTransaction,
} from '@/lib/supabase/wallet'

// Message costs in credits
const MESSAGE_COSTS = {
  text: 1,
  image: 2,
  video: 5,
  paid_media: 0, // Paid by receiver
} as const

// ============================================
// WALLET OPERATIONS
// ============================================

/**
 * Get current wallet balance
 */
export async function getWalletBalanceAction(): Promise<{
  success: boolean
  balance?: number
  error?: string
}> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: 'Nicht authentifiziert' }
    }

    const walletBalance = await getWalletBalance(user.id)

    return {
      success: true,
      balance: walletBalance.balance,
    }
  } catch (error) {
    console.error('Error in getWalletBalanceAction:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unbekannter Fehler',
    }
  }
}

// ============================================
// CHAT MANAGEMENT
// ============================================

/**
 * Get or create a chat with another user
 */
export async function getOrCreateChatAction(otherUserId: string): Promise<{
  success: boolean
  chatId?: string
  error?: string
}> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: 'Nicht authentifiziert' }
    }

    // Don't allow chat with self
    if (user.id === otherUserId) {
      return { success: false, error: 'Chat mit sich selbst nicht möglich' }
    }

    const { chat } = await getOrCreateChat(user.id, otherUserId)

    return {
      success: true,
      chatId: chat.id,
    }
  } catch (error) {
    console.error('Error in getOrCreateChatAction:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unbekannter Fehler',
    }
  }
}

/**
 * Load all chats for the current user
 */
export async function loadUserChatsAction(): Promise<{
  success: boolean
  chats?: ChatWithParticipant[]
  error?: string
}> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: 'Nicht authentifiziert' }
    }

    const chats = await getUserChats(user.id)

    return {
      success: true,
      chats,
    }
  } catch (error) {
    console.error('Error in loadUserChatsAction:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unbekannter Fehler',
    }
  }
}

/**
 * Load chat by ID (with permission check)
 */
export async function loadChatByIdAction(chatId: string): Promise<{
  success: boolean
  chat?: {
    id: string
    otherUser: {
      id: string
      name: string
      avatar_url: string | null
      username: string | null
    }
  }
  error?: string
}> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: 'Nicht authentifiziert' }
    }

    // Verify user has access to this chat
    const hasAccess = await verifyUserInChat(chatId, user.id)
    if (!hasAccess) {
      return { success: false, error: 'Kein Zugriff auf diesen Chat' }
    }

    const chat = await getChatById(chatId)
    if (!chat) {
      return { success: false, error: 'Chat nicht gefunden' }
    }

    // Get other user's info
    const otherUserId = chat.creator_id === user.id ? chat.subscriber_id : chat.creator_id

    const { data: profile } = await supabase
      .from('creator_profiles')
      .select('user_id, display_name, avatar_url, username')
      .eq('user_id', otherUserId)
      .single()

    return {
      success: true,
      chat: {
        id: chat.id,
        otherUser: {
          id: otherUserId,
          name: profile?.display_name || 'Unknown User',
          avatar_url: profile?.avatar_url || null,
          username: profile?.username || null,
        },
      },
    }
  } catch (error) {
    console.error('Error in loadChatByIdAction:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unbekannter Fehler',
    }
  }
}

// ============================================
// MESSAGE OPERATIONS
// ============================================

/**
 * Load chat history
 */
export async function loadChatHistoryAction(
  chatId: string,
  options?: {
    limit?: number
    offset?: number
    beforeTimestamp?: string
  }
): Promise<{
  success: boolean
  messages?: ChatMessageWithSender[]
  error?: string
}> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: 'Nicht authentifiziert' }
    }

    // Verify user has access
    const hasAccess = await verifyUserInChat(chatId, user.id)
    if (!hasAccess) {
      return { success: false, error: 'Kein Zugriff auf diesen Chat' }
    }

    const messages = await getChatMessages(chatId, options)

    // Reverse to get chronological order (oldest first)
    messages.reverse()

    return {
      success: true,
      messages,
    }
  } catch (error) {
    console.error('Error in loadChatHistoryAction:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unbekannter Fehler',
    }
  }
}

/**
 * Send a text message with credit deduction
 */
export async function sendTextMessageAction(
  chatId: string,
  content: string
): Promise<{
  success: boolean
  message?: ChatMessageWithSender
  newBalance?: number
  error?: string
}> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: 'Nicht authentifiziert' }
    }

    // Validate content
    if (!content || content.trim().length === 0) {
      return { success: false, error: 'Nachricht darf nicht leer sein' }
    }

    if (content.length > 5000) {
      return { success: false, error: 'Nachricht zu lang (max 5000 Zeichen)' }
    }

    // Verify user has access
    const hasAccess = await verifyUserInChat(chatId, user.id)
    if (!hasAccess) {
      return { success: false, error: 'Kein Zugriff auf diesen Chat' }
    }

    // ============================================
    // CREDIT CHECK & DEDUCTION
    // ============================================
    
    const messageCost = MESSAGE_COSTS.text
    
    // Check balance
    const balance = await getWalletBalance(user.id)
    if (balance.balance < messageCost) {
      return {
        success: false,
        error: `Nicht genügend Credits. Benötigt: ${messageCost}, Verfügbar: ${balance.balance.toFixed(2)}`,
      }
    }

    // Deduct credits
    try {
      const { newBalance } = await createExpenseTransaction(
        user.id,
        messageCost,
        'Chat-Nachricht gesendet',
        'chat_message',
        chatId
      )

      // Insert message after successful payment
      const message = await insertMessage(chatId, user.id, 'text', content.trim())

      // Get sender info
      const { data: senderProfile } = await supabase
        .from('creator_profiles')
        .select('user_id, display_name, avatar_url, username')
        .eq('user_id', user.id)
        .single()

      const messageWithSender: ChatMessageWithSender = {
        ...message,
        sender: {
          id: user.id,
          name: senderProfile?.display_name || 'Unknown',
          avatar_url: senderProfile?.avatar_url || null,
          username: senderProfile?.username || null,
        },
      }

      return {
        success: true,
        message: messageWithSender,
        newBalance,
      }
    } catch (creditError) {
      console.error('Credit deduction failed:', creditError)
      return {
        success: false,
        error: 'Fehler beim Abbuchen der Credits',
      }
    }
  } catch (error) {
    console.error('Error in sendTextMessageAction:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unbekannter Fehler',
    }
  }
}

/**
 * Mark messages as read
 */
export async function markAsReadAction(chatId: string): Promise<{
  success: boolean
  error?: string
}> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: 'Nicht authentifiziert' }
    }

    // Verify user has access
    const hasAccess = await verifyUserInChat(chatId, user.id)
    if (!hasAccess) {
      return { success: false, error: 'Kein Zugriff auf diesen Chat' }
    }

    await markMessagesAsRead(chatId, user.id)

    return { success: true }
  } catch (error) {
    console.error('Error in markAsReadAction:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unbekannter Fehler',
    }
  }
}

