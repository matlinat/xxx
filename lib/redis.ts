// lib/redis.ts
import 'server-only'
import { Redis } from '@upstash/redis'

// Initialize Upstash Redis client
// Requires UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN in .env.local
export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

/**
 * Test Redis connection
 * Returns true if connection is successful
 */
export async function testRedisConnection(): Promise<boolean> {
  try {
    const result = await redis.ping()
    return result === 'PONG'
  } catch (error) {
    console.error('Redis connection test failed:', error)
    return false
  }
}

/**
 * Test basic Redis operations (set/get)
 */
export async function testRedisOperations(): Promise<{
  success: boolean
  error?: string
  details?: string
}> {
  try {
    const testKey = 'test:redis:setup'
    const testValue = { timestamp: Date.now(), test: true }

    // Set a value with 60s expiration
    await redis.set(testKey, testValue, { ex: 60 })

    // Get the value back
    const result = await redis.get<{ timestamp: number; test: boolean }>(testKey)

    // Cleanup
    await redis.del(testKey)

    // Verify result
    const success = 
      result !== null &&
      typeof result === 'object' &&
      'timestamp' in result &&
      'test' in result &&
      result.test === true &&
      typeof result.timestamp === 'number'

    return {
      success,
      details: success ? 'Redis set/get operations working correctly' : `Unexpected result: ${JSON.stringify(result)}`,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

// ============================================
// CHAT-SPECIFIC REDIS FUNCTIONS
// ============================================

/**
 * Publish a message to a chat channel
 * Used for real-time message delivery
 */
export async function publishChatMessage(
  chatId: string,
  message: {
    id: string
    sender_id: string
    content: string
    type: string
    created_at: string
  }
): Promise<number> {
  const channel = `chat:${chatId}:messages`
  return await redis.publish(channel, message)
}

/**
 * Get channel name for chat messages
 */
export function getChatMessageChannel(chatId: string): string {
  return `chat:${chatId}:messages`
}

/**
 * Get channel name for typing events
 */
export function getTypingChannel(chatId: string): string {
  return `chat:${chatId}:typing`
}

/**
 * Publish a typing event
 * Sets a key that expires after 3 seconds
 */
export async function publishTypingEvent(
  chatId: string,
  userId: string,
  userName: string
): Promise<void> {
  const key = `typing:${chatId}:${userId}`
  await redis.set(key, userName, { ex: 3 }) // Expires after 3 seconds
}

/**
 * Get all users currently typing in a chat
 */
export async function getTypingUsers(
  chatId: string,
  currentUserId: string
): Promise<string[]> {
  const pattern = `typing:${chatId}:*`
  const keys = await redis.keys(pattern)
  
  const typingUsers: string[] = []
  
  for (const key of keys) {
    // Extract userId from key
    const userId = key.split(':')[2]
    
    // Don't include current user
    if (userId === currentUserId) continue
    
    // Get userName
    const userName = await redis.get<string>(key)
    if (userName) {
      typingUsers.push(userName)
    }
  }
  
  return typingUsers
}

// ============================================
// RATE LIMITING (Basic - will be enhanced later)
// ============================================

/**
 * Check rate limit for a user action
 * Returns whether the action is allowed
 */
export async function checkRateLimit(
  userId: string,
  action: string,
  maxAttempts: number,
  windowSeconds: number
): Promise<{
  allowed: boolean
  remaining: number
  resetAt: Date
}> {
  const key = `ratelimit:${action}:${userId}`
  const now = Date.now()
  const windowMs = windowSeconds * 1000

  try {
    // Get current count
    const current = await redis.get<number>(key)

    if (!current) {
      // First attempt in this window
      await redis.set(key, 1, { ex: windowSeconds })
      return {
        allowed: true,
        remaining: maxAttempts - 1,
        resetAt: new Date(now + windowMs),
      }
    }

    if (current >= maxAttempts) {
      // Rate limit exceeded
      const ttl = await redis.ttl(key)
      return {
        allowed: false,
        remaining: 0,
        resetAt: new Date(now + (ttl > 0 ? ttl * 1000 : windowMs)),
      }
    }

    // Increment counter
    await redis.incr(key)

    return {
      allowed: true,
      remaining: maxAttempts - current - 1,
      resetAt: new Date(now + windowMs),
    }
  } catch (error) {
    console.error('Rate limit check failed:', error)
    // On error, allow the action (fail open)
    return {
      allowed: true,
      remaining: maxAttempts,
      resetAt: new Date(now + windowMs),
    }
  }
}

