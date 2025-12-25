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
    const supabase = await createClient()

    // Verify authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return new Response('Unauthorized', { status: 401 })
    }

    // Verify user has access to this chat
    const hasAccess = await verifyUserInChat(chatId, user.id)
    if (!hasAccess) {
      return new Response('Forbidden', { status: 403 })
    }

    // Get user name
    const { data: profile } = await supabase
      .from('creator_profiles')
      .select('display_name')
      .eq('user_id', user.id)
      .single()

    const userName = profile?.display_name || 'Unknown User'

    // Publish typing event
    await publishTypingEvent(chatId, user.id, userName)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Typing API POST] Error:', error)
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
      return new Response('Unauthorized', { status: 401 })
    }

    // Verify user has access to this chat
    const hasAccess = await verifyUserInChat(chatId, user.id)
    if (!hasAccess) {
      return new Response('Forbidden', { status: 403 })
    }

    // Get typing users
    const typingUsers = await getTypingUsers(chatId, user.id)

    return NextResponse.json({ typingUsers })
  } catch (error) {
    console.error('[Typing API GET] Error:', error)
    return new Response('Internal Server Error', { status: 500 })
  }
}

