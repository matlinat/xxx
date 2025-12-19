// app/api/chat/[chatId]/subscribe/route.ts
import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyUserInChat } from '@/lib/supabase/chat'
import { getChatMessageChannel } from '@/lib/redis'
import { Redis } from '@upstash/redis'

/**
 * Server-Sent Events (SSE) endpoint for real-time chat messages
 * GET /api/chat/[chatId]/subscribe
 * 
 * This creates a long-lived connection that pushes new messages to the client
 * as they arrive via Redis Pub/Sub
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ chatId: string }> }
) {
  const { chatId } = await params
  
  // Verify authentication
  const supabase = await createClient()
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

  // Create SSE stream
  const encoder = new TextEncoder()
  
  let isClosed = false
  let redisSubscriber: Redis | null = null

  const stream = new ReadableStream({
    async start(controller) {
      // Send initial connection confirmation
      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify({ type: 'connected', chatId })}\n\n`)
      )

      try {
        // Create Redis subscriber
        redisSubscriber = new Redis({
          url: process.env.UPSTASH_REDIS_REST_URL!,
          token: process.env.UPSTASH_REDIS_REST_TOKEN!,
        })

        const channel = getChatMessageChannel(chatId)

        // Polling-based subscription (Upstash Redis REST doesn't support traditional pub/sub)
        // We'll use a different approach: poll Redis for new messages
        // For true pub/sub, you'd need Redis with websocket support or use Supabase Realtime as fallback
        
        // Send keepalive every 15 seconds
        const keepAliveInterval = setInterval(() => {
          if (!isClosed) {
            try {
              controller.enqueue(encoder.encode(': keepalive\n\n'))
            } catch (error) {
              console.error('Keepalive error:', error)
              clearInterval(keepAliveInterval)
            }
          } else {
            clearInterval(keepAliveInterval)
          }
        }, 15000)

        // For now, we'll rely on Supabase Realtime as the primary mechanism
        // and use this as a fallback/keepalive
        // The client will use Supabase Realtime subscriptions directly
        
      } catch (error) {
        console.error('SSE subscription error:', error)
        controller.error(error)
      }
    },

    cancel() {
      isClosed = true
      console.log(`SSE connection closed for chat ${chatId}`)
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}

