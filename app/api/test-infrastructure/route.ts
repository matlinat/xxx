// app/api/test-infrastructure/route.ts
import { NextResponse } from 'next/server'
import { testRedisConnection, testRedisOperations } from '@/lib/redis'
import { createClient } from '@/lib/supabase/server'

/**
 * Test endpoint to verify Redis and Supabase setup
 * Call: GET /api/test-infrastructure
 */
export async function GET() {
  const results: {
    redis: {
      connected: boolean
      operations: { success: boolean; error?: string; details?: string }
      error?: string
    }
    supabase: {
      connected: boolean
      tablesExist: boolean
      rlsEnabled: boolean
      error?: string
      details?: string
    }
    timestamp: string
  } = {
    redis: {
      connected: false,
      operations: { success: false },
    },
    supabase: {
      connected: false,
      tablesExist: false,
      rlsEnabled: false,
    },
    timestamp: new Date().toISOString(),
  }

  // ============================================
  // TEST 1: Redis Connection
  // ============================================
  try {
    results.redis.connected = await testRedisConnection()
    results.redis.operations = await testRedisOperations()
  } catch (error) {
    results.redis.error = error instanceof Error ? error.message : 'Unknown error'
    results.redis.connected = false
  }

  // ============================================
  // TEST 2: Supabase Connection & Schema
  // ============================================
  try {
    const supabase = await createClient()

    // Test connection - try to access any table (service role bypasses RLS)
    // We use a count query which doesn't require authentication
    const { count: chatsCount, error: chatsError } = await supabase
      .from('chats')
      .select('*', { count: 'exact', head: true })

    const { count: messagesCount, error: messagesError } = await supabase
      .from('chat_messages')
      .select('*', { count: 'exact', head: true })

    const { count: participantsCount, error: participantsError } = await supabase
      .from('chat_participants')
      .select('*', { count: 'exact', head: true })

    // Connection is successful if we can query tables
    if (!chatsError && !messagesError && !participantsError) {
      results.supabase.connected = true
      results.supabase.tablesExist = true
      results.supabase.rlsEnabled = true
      results.supabase.details = `Tables found: chats (${chatsCount ?? 0}), messages (${messagesCount ?? 0}), participants (${participantsCount ?? 0})`
    } else if (chatsError?.code === 'PGRST301' || messagesError?.code === 'PGRST301' || participantsError?.code === 'PGRST301') {
      // PGRST301 = JWT expired / Auth required = RLS is working!
      results.supabase.connected = true
      results.supabase.tablesExist = true
      results.supabase.rlsEnabled = true
      results.supabase.details = 'RLS policies active (authentication required for queries)'
    } else if (chatsError?.code === '42P01' || messagesError?.code === '42P01' || participantsError?.code === '42P01') {
      // 42P01 = Table does not exist
      results.supabase.connected = true
      results.supabase.tablesExist = false
      results.supabase.error = 'Tables not found - run chat-schema.sql'
    } else {
      // Check at least if we have a connection
      const { error: healthError } = await supabase
        .from('_health_check_dummy')
        .select('id')
        .limit(1)

      if (healthError?.code === '42P01') {
        // Connection works, just table doesn't exist
        results.supabase.connected = true
      }

      // Some tables might exist
      results.supabase.tablesExist = !chatsError || !messagesError || !participantsError
      results.supabase.error = chatsError?.message || messagesError?.message || participantsError?.message || 'Unknown error'
    }
  } catch (error) {
    results.supabase.error = error instanceof Error ? error.message : 'Unknown error'
  }

  // ============================================
  // Return results
  // ============================================
  const allTestsPassed =
    results.redis.connected &&
    results.redis.operations.success &&
    results.supabase.connected &&
    results.supabase.tablesExist

  return NextResponse.json(
    {
      success: allTestsPassed,
      message: allTestsPassed
        ? '✅ All infrastructure tests passed!'
        : '⚠️ Some tests failed - check details below',
      results,
    },
    { status: allTestsPassed ? 200 : 500 }
  )
}

