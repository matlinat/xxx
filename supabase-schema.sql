-- ============================================
-- Supabase Database Schema für xxx.io
-- ============================================
-- 
-- Dieses Script erstellt alle benötigten Tabellen
-- mit Row Level Security (RLS) Policies
--
-- Ausführung: Supabase Dashboard → SQL Editor
-- ============================================

-- ============================================
-- 1. Users Tabelle
-- ============================================
-- Erweitert die auth.users mit zusätzlichen Profildaten

CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index für schnelle Lookups
CREATE INDEX IF NOT EXISTS idx_users_auth_user_id ON public.users(auth_user_id);

-- Updated_at Trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS aktivieren
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Policy: Benutzer können nur ihre eigenen Daten sehen
CREATE POLICY "Users can view own profile"
  ON public.users
  FOR SELECT
  USING (auth_user_id = auth.uid());

-- Policy: Benutzer können nur ihre eigenen Daten aktualisieren
CREATE POLICY "Users can update own profile"
  ON public.users
  FOR UPDATE
  USING (auth_user_id = auth.uid());

-- Policy: Service Role kann alle Operationen durchführen (für Server Actions)
-- Diese Policy ist notwendig, damit die Registrierung funktioniert
CREATE POLICY "Service role can manage all users"
  ON public.users
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- ============================================
-- 2. xxx_jobs Tabelle
-- ============================================
-- Speichert alle Bildverarbeitungs-Jobs

CREATE TABLE IF NOT EXISTS public.xxx_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  original_path TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'processing',
  processed_path TEXT,
  meta JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT status_check CHECK (status IN ('processing', 'done', 'failed'))
);

-- Indexes für Performance
CREATE INDEX IF NOT EXISTS idx_xxx_jobs_user_id ON public.xxx_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_xxx_jobs_status ON public.xxx_jobs(status);
CREATE INDEX IF NOT EXISTS idx_xxx_jobs_created_at ON public.xxx_jobs(created_at DESC);

-- Updated_at Trigger
CREATE TRIGGER update_xxx_jobs_updated_at
  BEFORE UPDATE ON public.xxx_jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS aktivieren
ALTER TABLE public.xxx_jobs ENABLE ROW LEVEL SECURITY;

-- Policy: Benutzer können nur ihre eigenen Jobs sehen
CREATE POLICY "Users can view own jobs"
  ON public.xxx_jobs
  FOR SELECT
  USING (
    user_id = auth.uid() OR 
    user_id IS NULL -- Anonyme Jobs können von allen gesehen werden (optional, anpassen falls nötig)
  );

-- Policy: Benutzer können ihre eigenen Jobs erstellen
CREATE POLICY "Users can create own jobs"
  ON public.xxx_jobs
  FOR INSERT
  WITH CHECK (
    user_id = auth.uid() OR 
    user_id IS NULL -- Erlaubt anonyme Jobs
  );

-- Policy: Benutzer können ihre eigenen Jobs aktualisieren
CREATE POLICY "Users can update own jobs"
  ON public.xxx_jobs
  FOR UPDATE
  USING (
    user_id = auth.uid() OR 
    user_id IS NULL
  );

-- Policy: Service Role kann alle Operationen durchführen (für API Routes)
CREATE POLICY "Service role can manage all jobs"
  ON public.xxx_jobs
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- ============================================
-- 3. Storage Buckets Setup (optional)
-- ============================================
-- Diese Buckets müssen manuell im Supabase Dashboard erstellt werden:
-- Storage → Create Bucket
--
-- Bucket: originals (oder der Name aus SUPABASE_BUCKET_ORIGINALS)
-- - Public: false (private)
-- - File size limit: nach Bedarf (z.B. 10MB)
-- - Allowed MIME types: image/*
--
-- Bucket: processed (oder der Name aus SUPABASE_BUCKET_PROCESSED)
-- - Public: false (private)
-- - File size limit: nach Bedarf
-- - Allowed MIME types: image/png, image/jpeg, image/webp
--
-- Storage Policies werden hier nicht erstellt, da sie über das Dashboard
-- oder separate SQL-Statements konfiguriert werden sollten.

-- ============================================
-- Hinweise:
-- ============================================
-- 1. Nach dem Ausführen dieses Scripts:
--    - Prüfe die RLS Policies im Dashboard
--    - Teste die Zugriffe mit verschiedenen Benutzern
--
-- 2. Storage Buckets:
--    - Erstelle die Buckets manuell im Dashboard
--    - Setze Storage Policies für Upload/Download
--
-- 3. Service Role:
--    - Wird automatisch von Supabase verwaltet
--    - Wird in API Routes verwendet (supabaseAdmin)
--    - Umgeht RLS (daher vorsichtig verwenden)

