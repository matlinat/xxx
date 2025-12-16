// lib/supabase/user-cache.ts
import { cache } from 'react'
import { createClient } from './server'

export interface UserProfile {
  username: string | null
  avatar_url: string | null
  role: string | null
}

/**
 * Gecachte Funktion zum Laden von User-Profile-Daten
 * Dedupliziert Requests innerhalb eines Request-Zyklus
 */
export const getCachedUserProfile = cache(async (userId: string): Promise<UserProfile | null> => {
  const supabase = await createClient()
  const { data: profile, error } = await supabase
    .from('users')
    .select('username, avatar_url, role')
    .eq('auth_user_id', userId)
    .maybeSingle()

  if (error) {
    console.error('Error fetching user profile:', error)
    return null
  }

  return profile
})

/**
 * Gecachte Funktion zum Laden nur der User-Rolle
 * Für Seiten die nur die Rolle benötigen
 */
export const getCachedUserRole = cache(async (userId: string): Promise<string | null> => {
  const profile = await getCachedUserProfile(userId)
  return profile?.role || null
})

