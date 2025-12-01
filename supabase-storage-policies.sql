-- ============================================
-- Supabase Storage Policies für xxx.io
-- ============================================
-- 
-- WICHTIG: Diese Policies setzen voraus, dass die Buckets
-- bereits im Supabase Dashboard erstellt wurden!
--
-- Bucket-Namen müssen mit den Umgebungsvariablen übereinstimmen:
-- - SUPABASE_BUCKET_ORIGINALS (z.B. "originals")
-- - SUPABASE_BUCKET_PROCESSED (z.B. "processed")
-- ============================================

-- ============================================
-- Storage Bucket: originals
-- ============================================
-- Ersetze 'originals' mit dem tatsächlichen Bucket-Namen aus SUPABASE_BUCKET_ORIGINALS

-- Policy: Benutzer können Dateien in ihren eigenen Ordner hochladen
CREATE POLICY "Users can upload to own folder"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'originals' AND
    (storage.foldername(name))[1] = auth.uid()::text OR
    (storage.foldername(name))[1] = 'anon'
  );

-- Policy: Benutzer können Dateien aus ihrem eigenen Ordner lesen
CREATE POLICY "Users can read own files"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'originals' AND
    (
      (storage.foldername(name))[1] = auth.uid()::text OR
      (storage.foldername(name))[1] = 'anon'
    )
  );

-- Policy: Benutzer können Dateien aus ihrem eigenen Ordner löschen
CREATE POLICY "Users can delete own files"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'originals' AND
    (
      (storage.foldername(name))[1] = auth.uid()::text OR
      (storage.foldername(name))[1] = 'anon'
    )
  );

-- Policy: Service Role kann alle Operationen durchführen
CREATE POLICY "Service role can manage all originals"
  ON storage.objects
  FOR ALL
  USING (
    bucket_id = 'originals' AND
    auth.jwt() ->> 'role' = 'service_role'
  );

-- ============================================
-- Storage Bucket: processed
-- ============================================
-- Ersetze 'processed' mit dem tatsächlichen Bucket-Namen aus SUPABASE_BUCKET_PROCESSED

-- Policy: Nur Service Role kann in processed hochladen (wird von API gemacht)
CREATE POLICY "Service role can upload processed files"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'processed' AND
    auth.jwt() ->> 'role' = 'service_role'
  );

-- Policy: Benutzer können Dateien aus ihrem eigenen Ordner lesen
CREATE POLICY "Users can read own processed files"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'processed' AND
    (
      (storage.foldername(name))[1] = auth.uid()::text OR
      (storage.foldername(name))[1] = 'anon'
    )
  );

-- Policy: Service Role kann alle Operationen durchführen
CREATE POLICY "Service role can manage all processed"
  ON storage.objects
  FOR ALL
  USING (
    bucket_id = 'processed' AND
    auth.jwt() ->> 'role' = 'service_role'
  );

-- ============================================
-- Hinweise:
-- ============================================
-- 1. Bucket-Namen anpassen:
--    - Ersetze 'originals' und 'processed' mit deinen tatsächlichen Bucket-Namen
--    - Diese müssen mit SUPABASE_BUCKET_ORIGINALS und SUPABASE_BUCKET_PROCESSED übereinstimmen
--
-- 2. Bucket-Erstellung:
--    - Gehe zu Supabase Dashboard → Storage
--    - Erstelle die Buckets manuell
--    - Setze "Public bucket" auf false (private)
--
-- 3. Folder-Struktur:
--    - originals: {user_id}/{timestamp}-{filename}
--    - processed: {user_id}/{job_id}_{preset_id}.{ext}
--
-- 4. Testing:
--    - Teste Upload/Download mit verschiedenen Benutzern
--    - Prüfe, dass Benutzer nur ihre eigenen Dateien sehen können

