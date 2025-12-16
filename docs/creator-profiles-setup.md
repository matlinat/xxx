# Creator Profiles Setup

Diese Dokumentation beschreibt die Einrichtung der Creator-Profil-Funktionalität.

## Datenbank-Setup

1. Führe das SQL-Script aus `docs/creator-profiles-schema.sql` im Supabase SQL Editor aus
2. Dies erstellt:
   - Die `creator_profiles` Tabelle
   - Indizes für Performance
   - Trigger für `updated_at`
   - RLS Policies für Sicherheit

## Storage Setup

Für Avatar- und Cover-Uploads müssen zwei Supabase Storage Buckets erstellt werden:

1. Gehe zu Supabase Dashboard → Storage
2. Erstelle zwei Buckets:
   - `avatars` - für Avatar-Bilder
   - `covers` - für Cover-Bilder
3. Setze beide Buckets auf "Public" (nicht privat) mit RLS aktiviert

### Storage RLS Policies

Da die Buckets RLS aktiviert haben, müssen Policies erstellt werden:

```sql
-- Erlaube Creator, ihre eigenen Avatare hochzuladen
CREATE POLICY "Creators can upload avatars"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' AND
  auth.uid() IS NOT NULL
);

-- Erlaube öffentlichen Zugriff auf Avatare
CREATE POLICY "Public can view avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- Erlaube Creator, ihre eigenen Covers hochzuladen
CREATE POLICY "Creators can upload covers"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'covers' AND
  auth.uid() IS NOT NULL
);

-- Erlaube öffentlichen Zugriff auf Covers
CREATE POLICY "Public can view covers"
ON storage.objects FOR SELECT
USING (bucket_id = 'covers');
```

**Hinweis:** Die Buckets sollten auf "Public" gesetzt sein (nicht privat), damit die Bilder öffentlich zugänglich sind. RLS Policies kontrollieren den Zugriff.

## Verwendung

### Als Creator

1. Logge dich als Creator ein
2. Gehe zu `/home/creator/profile`
3. Fülle das Profilformular aus
4. Speichere das Profil

### Öffentliches Profil

Das Profil ist öffentlich unter `/creator/[username]` erreichbar, wobei `[username]` der Username aus der `users` Tabelle ist.

## Datenstruktur

Die `creator_profiles` Tabelle ist über `user_id` mit der `users` Tabelle verknüpft:
- `user_id` → `users.auth_user_id`
- Jeder Creator kann nur ein Profil haben (UNIQUE Constraint)
- Beim Löschen eines Users wird das Profil automatisch gelöscht (CASCADE)

## Sicherheit

- RLS Policies stellen sicher, dass:
  - Creator nur ihr eigenes Profil bearbeiten können
  - Öffentliche Profile von allen gelesen werden können
- Middleware schützt die Bearbeitungsroute `/home/creator/profile`
- Server Actions validieren die Creator-Rolle
