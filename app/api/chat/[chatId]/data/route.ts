import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getChatById, getChatMessages, verifyUserInChat } from '@/lib/supabase/chat'
import { getWalletBalance } from '@/lib/supabase/wallet'
import { markMessagesAsRead } from '@/lib/supabase/chat'

/**
 * OPTIMIZED API ROUTE: Much faster than Server Actions
 * GET /api/chat/[chatId]/data
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ chatId: string }> }
) {
  const perfStart = performance.now()
  const perfMetrics: Record<string, number> = {}

  try {
    const { chatId } = await params
    
    const authStart = performance.now()
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    perfMetrics.auth = Math.round(performance.now() - authStart)

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Verify access
    const accessStart = performance.now()
    const hasAccess = await verifyUserInChat(chatId, user.id)
    perfMetrics.accessCheck = Math.round(performance.now() - accessStart)

    if (!hasAccess) {
      return NextResponse.json(
        { success: false, error: 'Access denied' },
        { status: 403 }
      )
    }

    // Step 1: Get chat info first (needed for otherUserId)
    const chatStart = performance.now()
    const chat = await getChatById(chatId)
    perfMetrics.chatFetch = Math.round(performance.now() - chatStart)

    if (!chat) {
      return NextResponse.json(
        { success: false, error: 'Chat not found' },
        { status: 404 }
      )
    }

    const otherUserId = chat.creator_id === user.id ? chat.subscriber_id : chat.creator_id

    // Step 2: Load everything else in parallel (now we know otherUserId)
    const parallelStart = performance.now()
    const [messages, walletBalance, profile] = await Promise.all([
      getChatMessages(chatId),
      getWalletBalance(user.id),
      supabase
        .from('creator_profiles')
        .select('user_id, display_name, avatar_url, username')
        .eq('user_id', otherUserId)
        .single()
        .then(res => res.data),
    ])
    perfMetrics.parallelQueries = Math.round(performance.now() - parallelStart)

    // Mark as read (fire and forget)
    markMessagesAsRead(chatId, user.id).catch(console.error)

    perfMetrics.total = Math.round(performance.now() - perfStart)

    return NextResponse.json({
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
      messages,
      walletBalance: walletBalance.balance,
      currentUserId: user.id,
      _perf: perfMetrics,
    })
  } catch (error) {
    console.error('Error in chat data API:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
