// lib/supabase/creator-profiles.ts
import { createClient } from './server'

export interface CreatorProfile {
  id: string
  user_id: string
  nickname: string | null
  avatar_url: string | null
  cover_url: string | null
  is_online: boolean
  available_for: 'live-chat' | 'live-video' | 'offline'
  fans_count: number
  about: string | null
  gender: string | null
  age: number | null
  location: string | null
  languages: string[] | null
  relationship_status: string | null
  sexual_orientation: string | null
  height: number | null
  weight: number | null
  hair_color: string | null
  eye_color: string | null
  zodiac_sign: string | null
  tattoos: string | null
  piercings: string | null
  intimate_shaving: string | null
  body_type: string | null
  penis_size: string | null
  sexual_preferences: string[] | null
  created_at: string
  updated_at: string
}

export interface CreatorProfileWithUsername extends CreatorProfile {
  username: string
}

/**
 * Lädt ein Creator-Profil über die user_id
 */
export async function getCreatorProfileByUserId(userId: string): Promise<CreatorProfile | null> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('creator_profiles')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      // Kein Profil gefunden
      return null
    }
    console.error('Error fetching creator profile:', error)
    return null
  }

  return data
}

/**
 * Lädt ein Creator-Profil über den username
 * Für öffentliche Profile
 */
export async function getCreatorProfileByUsername(username: string): Promise<CreatorProfileWithUsername | null> {
  const supabase = await createClient()
  
  // Zuerst User über username finden
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('auth_user_id, username')
    .eq('username', username)
    .eq('role', 'creator')
    .single()

  if (userError || !userData) {
    return null
  }

  // Dann Profil über user_id laden
  const profile = await getCreatorProfileByUserId(userData.auth_user_id)
  
  if (!profile) {
    return null
  }

  return {
    ...profile,
    username: userData.username,
  }
}

/**
 * Speichert oder aktualisiert ein Creator-Profil
 */
export async function saveCreatorProfile(
  userId: string,
  profileData: Partial<Omit<CreatorProfile, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
): Promise<{ error?: string; data?: CreatorProfile }> {
  const supabase = await createClient()
  
  // Prüfe ob Profil bereits existiert
  const existing = await getCreatorProfileByUserId(userId)
  
  if (existing) {
    // Update
    const { data, error } = await supabase
      .from('creator_profiles')
      .update({
        ...profileData,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      console.error('Error updating creator profile:', error)
      return { error: error.message }
    }

    return { data }
  } else {
    // Insert
    const { data, error } = await supabase
      .from('creator_profiles')
      .insert({
        user_id: userId,
        ...profileData,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating creator profile:', error)
      return { error: error.message }
    }

    return { data }
  }
}
