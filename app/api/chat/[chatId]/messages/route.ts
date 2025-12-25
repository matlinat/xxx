import { NextRequest, NextResponse } from 'next/server'
import { getChatMessages, verifyUserInChat } from '@/lib/supabase/chat'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/chat/[chatId]/messages
 * 
 * Fetch chat messages with optional pagination and incremental sync
 * Query params:
 * - after: ISO timestamp - fetch messages after this timestamp (incremental sync)
 * - before: ISO timestamp - fetch messages before this timestamp (pagination)
 * - limit: number - max messages to return (default: 50)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ chatId: string }> }
) {
  try {
    const { chatId } = await params
    const { searchParams } = new URL(request.url)
    const after = searchParams.get('after') // ISO timestamp
    const before = searchParams.get('before') // ISO timestamp
    const limit = parseInt(searchParams.get('limit') || '50')
    
    // Auth check
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' }, 
        { status: 401 }
      )
    }
    
    // Permission check
    const hasAccess = await verifyUserInChat(chatId, user.id)
    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Access denied' }, 
        { status: 403 }
      )
    }
    
    // Build query options
    const options: {
      limit?: number
      beforeTimestamp?: string
      afterTimestamp?: string
    } = { limit }
    
    if (after) {
      options.afterTimestamp = after
    }
    if (before) {
      options.beforeTimestamp = before
    }
    
    // Fetch messages
    const messages = await getChatMessages(chatId, options)
    
    return NextResponse.json({
      success: true,
      messages,
      count: messages.length
    })
    
  } catch (error) {
    console.error('[API /chat/[chatId]/messages] Error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error' 
      }, 
      { status: 500 }
    )
  }
}
