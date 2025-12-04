'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

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

  // Eintrag in users-Tabelle
  const { error: insertError } = await supabaseAdmin.from('users').insert({
    auth_user_id: user.id,
    username,
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
