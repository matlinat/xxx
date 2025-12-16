'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { saveCreatorProfile, getCreatorProfileByUserId } from '@/lib/supabase/creator-profiles'

// Admin-Client für DB-Eintrag nach Registrierung
const supabaseAdmin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

export async function loginAction(formData: FormData) {
  const email = String(formData.get('email') || '')
  const password = String(formData.get('password') || '')

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return { error: error.message }
  }

  redirect('/home')
}

export async function logoutAction() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/home')
}

export async function registerAction(formData: FormData) {
  const email = String(formData.get('email') || '')
  const password = String(formData.get('password') || '')
  const username = String(formData.get('username') || '')

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  const user = data.user
  if (!user) return { error: 'Registrierung fehlgeschlagen.' }

  // Eintrag in users-Tabelle mit Subscriber-Rolle (Default)
  const { error: insertError } = await supabaseAdmin.from('users').insert({
    auth_user_id: user.id,
    username,
    role: 'subscriber',
  })

  if (insertError) {
    return { error: insertError.message }
  }

  redirect('/confirm')
}

export async function registerCreatorAction(formData: FormData) {
  const email = String(formData.get('email') || '')
  const password = String(formData.get('password') || '')
  const username = String(formData.get('username') || '')

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  const user = data.user
  if (!user) return { error: 'Registrierung fehlgeschlagen.' }

  // Eintrag in users-Tabelle mit Creator-Rolle
  const { error: insertError } = await supabaseAdmin.from('users').insert({
    auth_user_id: user.id,
    username,
    role: 'creator',
  })

  if (insertError) {
    return { error: insertError.message }
  }

  redirect('/confirm')
}

export async function registerSubscriberAction(formData: FormData) {
  const email = String(formData.get('email') || '')
  const password = String(formData.get('password') || '')
  const username = String(formData.get('username') || '')

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  const user = data.user
  if (!user) return { error: 'Registrierung fehlgeschlagen.' }

  // Eintrag in users-Tabelle mit Subscriber-Rolle
  const { error: insertError } = await supabaseAdmin.from('users').insert({
    auth_user_id: user.id,
    username,
    role: 'subscriber',
  })

  if (insertError) {
    return { error: insertError.message }
  }

  redirect('/confirm')
}

export async function saveCreatorProfileAction(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: 'Nicht eingeloggt' }
  }
  
  // Prüfe Creator-Rolle
  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('auth_user_id', user.id)
    .single()
  
  if (profile?.role !== 'creator') {
    return { error: 'Nur Creator können Profile bearbeiten' }
  }
  
  // Formular-Daten extrahieren
  const profileData = {
    nickname: String(formData.get('nickname') || '').trim() || null,
    avatar_url: String(formData.get('avatar_url') || '').trim() || null,
    cover_url: String(formData.get('cover_url') || '').trim() || null,
    is_online: formData.get('is_online') === 'true',
    available_for: (formData.get('available_for') as 'live-chat' | 'live-video' | 'offline') || 'offline',
    fans_count: parseInt(String(formData.get('fans_count') || '0'), 10) || 0,
    about: String(formData.get('about') || '').trim() || null,
    gender: String(formData.get('gender') || '').trim() || null,
    age: formData.get('age') ? parseInt(String(formData.get('age')), 10) : null,
    location: String(formData.get('location') || '').trim() || null,
    languages: formData.get('languages') ? JSON.parse(String(formData.get('languages'))) : null,
    relationship_status: String(formData.get('relationship_status') || '').trim() || null,
    sexual_orientation: String(formData.get('sexual_orientation') || '').trim() || null,
    height: formData.get('height') ? parseInt(String(formData.get('height')), 10) : null,
    weight: formData.get('weight') ? parseInt(String(formData.get('weight')), 10) : null,
    hair_color: String(formData.get('hair_color') || '').trim() || null,
    eye_color: String(formData.get('eye_color') || '').trim() || null,
    zodiac_sign: String(formData.get('zodiac_sign') || '').trim() || null,
    tattoos: String(formData.get('tattoos') || '').trim() || null,
    piercings: String(formData.get('piercings') || '').trim() || null,
    intimate_shaving: String(formData.get('intimate_shaving') || '').trim() || null,
    body_type: String(formData.get('body_type') || '').trim() || null,
    penis_size: String(formData.get('penis_size') || '').trim() || null,
    sexual_preferences: formData.get('sexual_preferences') ? JSON.parse(String(formData.get('sexual_preferences'))) : null,
  }
  
  const result = await saveCreatorProfile(user.id, profileData)
  
  if (result.error) {
    return { error: result.error }
  }
  
  return { success: true, data: result.data }
}

export async function getCreatorProfileAction() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: 'Nicht eingeloggt' }
  }
  
  // Prüfe Creator-Rolle
  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('auth_user_id', user.id)
    .single()
  
  if (profile?.role !== 'creator') {
    return { error: 'Nur Creator können Profile abrufen' }
  }
  
  const creatorProfile = await getCreatorProfileByUserId(user.id)
  
  return { data: creatorProfile }
}
