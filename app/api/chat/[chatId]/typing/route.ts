// app/api/chat/[chatId]/typing/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyUserInChat } from '@/lib/supabase/chat'
import { publishTypingEvent, getTypingUsers } from '@/lib/redis'

/**
 * POST: Publish typing event
 * GET: Get currently typing users
 */

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ chatId: string }> }
) {
  try {
    const { chatId } = await params
    console.log('[Typing API POST] 📤 Received typing event for chat:', chatId)
    
    const supabase = await createClient()

    // Verify authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      console.log('[Typing API POST] ❌ Unauthorized')
      return new Response('Unauthorized', { status: 401 })
    }

    console.log('[Typing API POST] ✅ User authenticated:', user.id)

    // Verify user has access to this chat
    const hasAccess = await verifyUserInChat(chatId, user.id)
    if (!hasAccess) {
      console.log('[Typing API POST] ❌ Forbidden - user not in chat')
      return new Response('Forbidden', { status: 403 })
    }

    console.log('[Typing API POST] ✅ User has access to chat')

    // Get user name
    const { data: profile } = await supabase
      .from('creator_profiles')
      .select('display_name')
      .eq('user_id', user.id)
      .single()

    const userName = profile?.display_name || 'Unknown User'
    console.log('[Typing API POST] 👤 User name:', userName)

    // Publish typing event
    await publishTypingEvent(chatId, user.id, userName)
    console.log('[Typing API POST] ✅ Typing event published')

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Typing API POST] ❌ Error:', error)
    return new Response('Internal Server Error', { status: 500 })
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ chatId: string }> }
) {
  try {
    const { chatId } = await params
    const supabase = await createClient()

    // Verify authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      console.log('[Typing API GET] ❌ Unauthorized')
      return new Response('Unauthorized', { status: 401 })
    }

    // Verify user has access to this chat
    const hasAccess = await verifyUserInChat(chatId, user.id)
    if (!hasAccess) {
      console.log('[Typing API GET] ❌ Forbidden')
      return new Response('Forbidden', { status: 403 })
    }

    // Get typing users
    const typingUsers = await getTypingUsers(chatId, user.id)
    console.log('[Typing API GET] 📥 Returning typing users:', typingUsers)

    return NextResponse.json({ typingUsers })
  } catch (error) {
    console.error('[Typing API GET] ❌ Error:', error)
    return new Response('Internal Server Error', { status: 500 })
  }
}

