# Chat System Setup Guide

## Überblick

Das Chat-System kombiniert **Upstash Redis** für Echtzeit-Kommunikation und **Supabase PostgreSQL** für persistente Datenspeicherung. Es unterstützt Credits-basierte Monetarisierung über das bestehende Wallet-System.

## Architektur

```
Client (Next.js)
  ├─ Server Actions (app/home/chat/actions.ts)
  │   ├─ Credit-Check (Wallet)
  │   ├─ Redis Pub/Sub (Realtime)
  │   └─ Supabase (Persistenz)
  │
  ├─ Redis (Upstash)
  │   ├─ Pub/Sub für Nachrichten
  │   ├─ Online-Status
  │   ├─ Typing-Indicator
  │   └─ Rate-Limiting
  │
  └─ Supabase
      ├─ PostgreSQL (chats, chat_messages, chat_participants)
      └─ Storage (chat-media für Bilder/Videos)
```

## 1. Redis Setup (Upstash)

### 1.1 Upstash Account erstellen

1. Gehe zu [https://upstash.com](https://upstash.com)
2. Erstelle einen Account
3. Erstelle eine neue Redis Database
   - Region: **Europe (Frankfurt)** für niedrigste Latenz
   - Type: **Regional** (nicht Global für bessere Performance)
   - Eviction: **allkeys-lru** (optional, für automatisches Cleanup)

### 1.2 Credentials holen

1. In Upstash Dashboard → Database auswählen
2. Unter **REST API** findest du:
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`

### 1.3 Environment Variables

Füge folgende Zeilen zu `.env.local` hinzu:

```env
# Redis (Upstash) - für Chat-System
UPSTASH_REDIS_REST_URL=https://your-redis-xxxxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=AXxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

⚠️ **Wichtig:** Diese Credentials sind **Secret** und dürfen NICHT in Git committed werden!

### 1.4 Redis Connection testen

Erstelle eine Test-Route (optional, zum Testen):

```typescript
// app/api/test-redis/route.ts
import { testRedisConnection, testRedisOperations } from '@/lib/redis'
import { NextResponse } from 'next/server'

export async function GET() {
  const connected = await testRedisConnection()
  const operations = await testRedisOperations()
  
  return NextResponse.json({
    connected,
    operations,
  })
}
```

Rufe auf: `http://localhost:3000/api/test-redis`

Erwartete Response:
```json
{
  "connected": true,
  "operations": {
    "success": true
  }
}
```

## 2. Supabase Setup

### 2.1 Schema installieren

1. Öffne **Supabase Dashboard** → Dein Projekt
2. Gehe zu **SQL Editor**
3. Öffne Datei `docs/chat-schema.sql`
4. Kopiere den gesamten Inhalt
5. Füge ihn in den SQL Editor ein
6. Klicke **RUN**

Das Schema erstellt:
- ✅ Tabelle `chats` (Chat-Threads)
- ✅ Tabelle `chat_messages` (Nachrichten)
- ✅ Tabelle `chat_participants` (Teilnehmer-Metadaten)
- ✅ RLS Policies (Row Level Security)
- ✅ Indexes für Performance
- ✅ Trigger für Auto-Timestamps
- ✅ Helper-Funktionen (z.B. `get_unread_count()`)

### 2.2 Storage Bucket erstellen

1. Gehe zu **Storage** in Supabase Dashboard
2. Klicke **Create Bucket**
   - Name: `chat-media`
   - Public: **No** (privat mit RLS)
   - File size limit: `52428800` (50MB)
   - Allowed MIME types:
     - `image/jpeg`
     - `image/png`
     - `image/webp`
     - `image/gif`
     - `video/mp4`
     - `video/webm`

3. **Storage Policies erstellen** (SQL Editor):

```sql
-- Users können in ihren eigenen Ordner hochladen
CREATE POLICY "Users can upload chat media"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'chat-media'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Users können Media in ihren Chats ansehen
CREATE POLICY "Users can view chat media"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'chat-media'
    AND EXISTS (
      SELECT 1 FROM chat_messages cm
      JOIN chats c ON c.id = cm.chat_id
      WHERE cm.media_url LIKE '%' || storage.objects.name
      AND (c.creator_id = auth.uid() OR c.subscriber_id = auth.uid())
    )
  );
```

### 2.3 Schema verifizieren

Führe folgende Queries aus um sicherzustellen, dass alles korrekt eingerichtet ist:

```sql
-- Tabellen prüfen
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('chats', 'chat_messages', 'chat_participants');

-- RLS aktiviert?
SELECT tablename, rowsecurity FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('chats', 'chat_messages', 'chat_participants');

-- Policies vorhanden?
SELECT schemaname, tablename, policyname FROM pg_policies
WHERE tablename IN ('chats', 'chat_messages', 'chat_participants');
```

Erwartetes Ergebnis:
- 3 Tabellen gefunden ✅
- RLS enabled für alle 3 ✅
- Mindestens 7 Policies ✅

## 3. Testdaten einfügen (Optional)

Für erste Tests kannst du manuell Testdaten einfügen:

```sql
-- Test-Chat erstellen (ersetze UUIDs mit echten User-IDs aus auth.users)
INSERT INTO chats (creator_id, subscriber_id)
VALUES (
  'YOUR_CREATOR_USER_ID',
  'YOUR_SUBSCRIBER_USER_ID'
)
RETURNING *;

-- Test-Nachricht
INSERT INTO chat_messages (chat_id, sender_id, message_type, content)
VALUES (
  'CHAT_ID_FROM_ABOVE',
  'YOUR_USER_ID',
  'text',
  'Hello, this is a test message!'
)
RETURNING *;

-- Participant-Records erstellen
INSERT INTO chat_participants (chat_id, user_id)
VALUES 
  ('CHAT_ID', 'USER_1_ID'),
  ('CHAT_ID', 'USER_2_ID');
```

## 4. Entwicklungs-Workflow

### 4.1 Dev Server starten

```bash
npm run dev
```

### 4.2 Redis testen

```typescript
import { redis, testRedisConnection } from '@/lib/redis'

// Connection testen
const isConnected = await testRedisConnection()
console.log('Redis connected:', isConnected)

// Einfache Operation
await redis.set('test:key', 'Hello Redis!')
const value = await redis.get('test:key')
console.log('Retrieved:', value)
```

### 4.3 Supabase testen

```typescript
import { createClient } from '@/lib/supabase/server'

const supabase = await createClient()

// Chats laden
const { data: chats, error } = await supabase
  .from('chats')
  .select('*')

console.log('Chats:', chats)
```

## 5. Troubleshooting

### Redis Connection Fehler

**Problem:** `Redis connection failed: fetch failed`

**Lösung:**
1. Überprüfe `.env.local` - sind die Credentials korrekt?
2. Sind die Environment Variables geladen? Restart dev server
3. Ist Upstash Database aktiv? (Prüfe Dashboard)
4. Netzwerk-Problem? Teste mit `curl`:
   ```bash
   curl https://your-redis-xxxxx.upstash.io/ping \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```

### Supabase RLS Fehler

**Problem:** `new row violates row-level security policy`

**Lösung:**
1. Sind RLS Policies korrekt installiert? (siehe 2.3)
2. Ist User authentifiziert? `auth.uid()` muss gesetzt sein
3. Policy-Logik prüfen - darf dieser User diese Action?

### Storage Upload Fehler

**Problem:** `new row violates row-level security policy for table "objects"`

**Lösung:**
1. Sind Storage Policies erstellt? (siehe 2.2)
2. Folder-Struktur korrekt? Format: `{user_id}/{chat_id}/{filename}`
3. MIME-Type erlaubt? Prüfe Bucket-Settings

## 6. Nächste Schritte

Nach erfolgreichem Setup:

✅ **Schritt 1 abgeschlossen**: Infrastructure steht

➡️ **Schritt 2**: Basis-Chat implementieren (Text-only, ohne Realtime)
- `lib/supabase/chat.ts` - DB Functions
- `app/home/chat/actions.ts` - Server Actions
- UI-Integration

## 7. Monitoring & Performance

### Redis Monitoring

1. **Upstash Dashboard** zeigt:
   - Request-Count
   - Latency
   - Storage usage
   - Error rate

2. **Logging in Code:**
   ```typescript
   console.log('[Redis] Publishing message to:', chatId)
   ```

### Supabase Monitoring

1. **Supabase Dashboard** → Database → Logs
2. Slow Query Log aktivieren
3. Connection Pool überwachen

## 8. Kosten

### Upstash (Free Tier)

- **10,000 requests/day** (ausreichend für MVP)
- **256MB Storage**
- Upgrade: Pay-as-you-go ab $0.2/100K requests

### Supabase (Free Tier)

- **500MB Database**
- **1GB Storage**
- **2GB Bandwidth**
- Upgrade: Pro Plan $25/mo

💡 Für Production: Beide Services skalieren automatisch nach Bedarf.

## Support

Bei Problemen:
1. Prüfe Logs: `npm run dev` Terminal output
2. Supabase Logs: Dashboard → Logs
3. Redis Dashboard: Upstash → Analytics

---

**Status:** Infrastructure Setup abgeschlossen ✅

**Nächster Schritt:** Basis-Chat implementieren → `docs/chat-schema.sql` ist bereit für Schritt 2

