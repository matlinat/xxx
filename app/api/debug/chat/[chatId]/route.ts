// app/api/debug/chat/[chatId]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

/**
 * Debug endpoint to inspect chat messages directly from DB
 * GET /api/debug/chat/[chatId]
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ chatId: string }> }
) {
  try {
    const supabase = await createClient()
    const { chatId } = await params

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    // Use admin client to bypass RLS for debugging
    const { data: chatAdmin, error: chatAdminError } = await supabaseAdmin
      .from('chats')
      .select('*')
      .eq('id', chatId)
      .maybeSingle()

    const { data: messagesAdmin, error: messagesAdminError } = await supabaseAdmin
      .from('chat_messages')
      .select('*')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true })

    // Try with user client (to see RLS effects)
    const { data: chatUser, error: chatUserError } = await supabase
      .from('chats')
      .select('*')
      .eq('id', chatId)
      .maybeSingle()

    const { data: messagesUser, error: messagesUserError } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true })

    // Get profiles
    const senderIds = messagesAdmin
      ? [...new Set(messagesAdmin.map((m: any) => m.sender_id))]
      : []
    const { data: profiles } = await supabaseAdmin
      .from('creator_profiles')
      .select('*')
      .in('user_id', senderIds)

    return NextResponse.json({
      debug: {
        chatId,
        authentication: {
          isAuthenticated: !!user,
          userId: user?.id || null,
          email: user?.email || null,
          authError: authError?.message || null,
        },
        adminView: {
          chat: {
            exists: !!chatAdmin,
            data: chatAdmin,
            error: chatAdminError?.message || null,
          },
          messages: {
            count: messagesAdmin?.length || 0,
            data: messagesAdmin,
            error: messagesAdminError?.message || null,
          },
          profiles: {
            count: profiles?.length || 0,
            data: profiles,
          },
        },
        userView: {
          chat: {
            canSee: !!chatUser,
            data: chatUser,
            error: chatUserError?.message || null,
            errorCode: chatUserError?.code || null,
          },
          messages: {
            canSee: (messagesUser?.length || 0) > 0,
            count: messagesUser?.length || 0,
            error: messagesUserError?.message || null,
            errorCode: messagesUserError?.code || null,
          },
        },
        diagnosis: {
          chatExists: !!chatAdmin,
          userIsAuthenticated: !!user,
          userCanAccessChat: !!chatUser,
          messagesExist: (messagesAdmin?.length || 0) > 0,
          userCanSeeMessages: (messagesUser?.length || 0) > 0,
          possibleIssues: [
            !chatAdmin && 'Chat does not exist in DB',
            chatAdmin && !user && 'User not authenticated',
            chatAdmin && user && !chatUser && 'User not allowed to access this chat (RLS)',
            chatAdmin &&
              user &&
              chatUser &&
              messagesAdmin &&
              messagesAdmin.length > 0 &&
              (!messagesUser || messagesUser.length === 0) &&
              'Messages exist but user cannot see them (RLS)',
          ].filter(Boolean),
        },
      },
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : null,
      },
      { status: 500 }
    )
  }
}

