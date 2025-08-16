import { createClient } from "@supabase/supabase-js";

export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } },
);

export const SUPA_BUCKET_ORIG = process.env.SUPABASE_BUCKET_ORIGINALS!;
export const SUPA_BUCKET_PROC = process.env.SUPABASE_BUCKET_PROCESSED!;


// lib/supabase/client.ts
'use client'
import { createBrowserClient } from '@supabase/ssr'

export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)