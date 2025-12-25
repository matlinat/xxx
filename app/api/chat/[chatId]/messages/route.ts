import { NextRequest, NextResponse } from 'next/server'
import { getChatMessages } from '@/lib/supabase/chat'
import { createClient } from '@/lib/supabase/server'
import { verifyUserInChat } from '@/lib/supabase/chat'

/**
 * GET /api/chat/[chatId]/messages
 * Fetch messages with optional pagination and incremental sync
 * 
 * Query params:
 * - after: ISO timestamp - get messages after this time
 * - before: ISO timestamp - get messages before this time
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
    
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }
    
    // Verify access
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
    
    const messages = await getChatMessages(chatId, options)
    
    return NextResponse.json(messages)
  } catch (error) {
    console.error('Error in messages API:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

