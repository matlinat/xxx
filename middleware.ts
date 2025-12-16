// middleware.ts
import { NextResponse, type NextRequest } from 'next/server'
import { createMiddlewareClient } from '@/lib/supabase/middleware'

// Routen die eine bestimmte Rolle erfordern
const protectedRoutes: Record<string, string[]> = {
  '/home/creator': ['creator'],
  '/home/admin': ['admin'],
  '/home/subscriber': ['subscriber'],
}

export async function middleware(request: NextRequest) {
  const { supabase, response } = await createMiddlewareClient(request)
  const pathname = request.nextUrl.pathname

  // Session abrufen
  const { data: { user } } = await supabase.auth.getUser()

  // Prüfen ob die Route geschützt ist
  for (const [route, allowedRoles] of Object.entries(protectedRoutes)) {
    if (pathname.startsWith(route)) {
      // Nicht eingeloggt -> zur Home-Seite
      if (!user) {
        return NextResponse.redirect(new URL('/home', request.url))
      }

      // Rolle aus der users-Tabelle laden
      const { data: profile } = await supabase
        .from('users')
        .select('role')
        .eq('auth_user_id', user.id)
        .single()

      const userRole = profile?.role

      // Rolle nicht erlaubt -> zur Home-Seite
      if (!userRole || !allowedRoles.includes(userRole)) {
        return NextResponse.redirect(new URL('/home', request.url))
      }

      // Zugriff erlaubt
      break
    }
  }

  return response
}

export const config = {
  matcher: [
    // Geschützte Bereiche
    '/home/creator/:path*',
    '/home/admin/:path*',
    '/home/subscriber/:path*',
  ],
}
