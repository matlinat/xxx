import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (key: string) => req.cookies.get(key)?.value,
        set: (key: string, value: string, options: any) => {
          res.cookies.set({ name: key, value, ...options })
        },
        remove: (key: string, options: any) => {
          res.cookies.set({ name: key, value: '', ...options })
        },
      },
    }
  )

  // This will refresh the session if it's expired
  await supabase.auth.getSession()
  return res
}

export const config = {
  matcher: [
    // Refresh session on these routes. You can narrow this down to only private paths later.
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}