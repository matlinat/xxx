// app/api/test-redis/route.ts
import { NextResponse } from 'next/server'
import { redis, testRedisConnection, testRedisOperations } from '@/lib/redis'

/**
 * Test Redis connection and operations
 */
export async function GET() {
  const results: any = {
    timestamp: new Date().toISOString(),
    environment: {
      url: !!process.env.UPSTASH_REDIS_REST_URL,
      token: !!process.env.UPSTASH_REDIS_REST_TOKEN,
    },
    tests: {},
  }

  try {
    // Test 1: Connection
    results.tests.connection = {
      name: 'Connection Test',
      result: await testRedisConnection(),
    }

    // Test 2: Basic Operations
    results.tests.operations = {
      name: 'Set/Get Operations',
      result: await testRedisOperations(),
    }

    // Test 3: TTL Test
    try {
      await redis.set('test:ttl', 'value', { ex: 3 })
      const ttl = await redis.ttl('test:ttl')
      results.tests.ttl = {
        name: 'TTL Test',
        success: ttl > 0 && ttl <= 3,
        ttl,
      }
      await redis.del('test:ttl')
    } catch (error) {
      results.tests.ttl = {
        name: 'TTL Test',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }

    // Test 4: Keys Pattern (for typing indicator)
    try {
      // Set some test keys
      await redis.set('typing:test-chat:user1', 'User 1', { ex: 10 })
      await redis.set('typing:test-chat:user2', 'User 2', { ex: 10 })
      
      // Try to get keys
      const keys = await redis.keys('typing:test-chat:*')
      
      results.tests.keys = {
        name: 'Keys Pattern Test',
        success: Array.isArray(keys) && keys.length > 0,
        keys,
        note: 'If keys is empty, Upstash may not support KEYS command with REST API',
      }
      
      // Cleanup
      await redis.del('typing:test-chat:user1')
      await redis.del('typing:test-chat:user2')
    } catch (error) {
      results.tests.keys = {
        name: 'Keys Pattern Test',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        note: 'Upstash REST API does not support KEYS command - need alternative approach',
      }
    }

    // Test 5: Typing simulation
    try {
      await redis.set('typing:test:user123', 'Test User', { ex: 3 })
      const value = await redis.get('typing:test:user123')
      const ttl = await redis.ttl('typing:test:user123')
      
      results.tests.typing = {
        name: 'Typing Indicator Simulation',
        success: !!value && ttl > 0,
        value,
        ttl,
      }
      
      await redis.del('typing:test:user123')
    } catch (error) {
      results.tests.typing = {
        name: 'Typing Indicator Simulation',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }

  } catch (error) {
    results.error = error instanceof Error ? error.message : 'Unknown error'
  }

  const allTestsPassed = Object.values(results.tests).every(
    (test: any) => test.success || test.result?.success
  )

  return NextResponse.json(
    {
      success: allTestsPassed,
      message: allTestsPassed
        ? '✅ All Redis tests passed!'
        : '⚠️ Some Redis tests failed',
      ...results,
    },
    { status: allTestsPassed ? 200 : 500 }
  )
}

