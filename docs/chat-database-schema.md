# Chat Datenbank-Schema

Dieses Dokument beschreibt die Datenbank-Struktur für die Chat-Funktionalität.

## Tabellen

### 1. `chats` - Chat-Konversationen

Speichert die Chat-Konversationen zwischen Benutzern.

```sql
CREATE TABLE chats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_chats_updated_at ON chats(updated_at DESC);
```

### 2. `chat_participants` - Chat-Teilnehmer

Verbindet Benutzer mit Chat-Konversationen (Many-to-Many Beziehung).

```sql
CREATE TABLE chat_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chat_id UUID REFERENCES chats(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(auth_user_id) ON DELETE CASCADE,
  joined_at TIMESTAMP DEFAULT NOW(),
  last_read_at TIMESTAMP,
  UNIQUE(chat_id, user_id)
);

CREATE INDEX idx_chat_participants_chat_id ON chat_participants(chat_id);
CREATE INDEX idx_chat_participants_user_id ON chat_participants(user_id);
```

### 3. `messages` - Nachrichten

Speichert einzelne Nachrichten innerhalb einer Chat-Konversation.

```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chat_id UUID REFERENCES chats(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES users(auth_user_id) ON DELETE CASCADE,
  content TEXT,
  message_type VARCHAR(20) DEFAULT 'text', -- text, video, image_gallery, audio, file
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  read_at TIMESTAMP,
  deleted_at TIMESTAMP
);

CREATE INDEX idx_messages_chat_id ON messages(chat_id, created_at DESC);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);
```

### 4. `message_attachments` - Nachrichten-Anhänge

Speichert Datei-Anhänge für Nachrichten (Videos, Bilder, Dateien).

```sql
CREATE TABLE message_attachments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_type VARCHAR(50) NOT NULL, -- video, image, audio, file
  file_name TEXT,
  file_size BIGINT,
  thumbnail_url TEXT, -- Für Videos und Bilder
  duration INTEGER, -- Für Videos und Audio (in Sekunden)
  width INTEGER, -- Für Bilder und Videos
  height INTEGER, -- Für Bilder und Videos
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_message_attachments_message_id ON message_attachments(message_id);
CREATE INDEX idx_message_attachments_file_type ON message_attachments(file_type);
```

## Funktionen und Trigger

### Update `updated_at` für Chats

```sql
CREATE OR REPLACE FUNCTION update_chats_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE chats
  SET updated_at = NOW()
  WHERE id = NEW.chat_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_chats_updated_at
AFTER INSERT ON messages
FOR EACH ROW
EXECUTE FUNCTION update_chats_updated_at();
```

### Update `updated_at` für Messages

```sql
CREATE OR REPLACE FUNCTION update_messages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_messages_updated_at
BEFORE UPDATE ON messages
FOR EACH ROW
EXECUTE FUNCTION update_messages_updated_at();
```

## Row Level Security (RLS) Policies

### Chats

```sql
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view chats they participate in"
ON chats FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM chat_participants
    WHERE chat_participants.chat_id = chats.id
    AND chat_participants.user_id = auth.uid()
  )
);
```

### Messages

```sql
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages in their chats"
ON messages FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM chat_participants
    WHERE chat_participants.chat_id = messages.chat_id
    AND chat_participants.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert messages in their chats"
ON messages FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM chat_participants
    WHERE chat_participants.chat_id = messages.chat_id
    AND chat_participants.user_id = auth.uid()
  )
  AND messages.sender_id = auth.uid()
);

CREATE POLICY "Users can update their own messages"
ON messages FOR UPDATE
USING (sender_id = auth.uid())
WITH CHECK (sender_id = auth.uid());
```

### Chat Participants

```sql
ALTER TABLE chat_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view participants in their chats"
ON chat_participants FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM chat_participants cp
    WHERE cp.chat_id = chat_participants.chat_id
    AND cp.user_id = auth.uid()
  )
);
```

## Views für häufig verwendete Queries

### Chat-Liste mit letzter Nachricht

```sql
CREATE VIEW chat_list_view AS
SELECT 
  c.id as chat_id,
  c.updated_at,
  cp.user_id,
  (
    SELECT json_agg(
      json_build_object(
        'id', cp2.user_id,
        'name', u.username,
        'avatar', u.avatar_url,
        'online', false -- TODO: Implementiere Online-Status
      )
    )
    FROM chat_participants cp2
    JOIN users u ON u.auth_user_id = cp2.user_id
    WHERE cp2.chat_id = c.id
    AND cp2.user_id != cp.user_id
  ) as participants,
  (
    SELECT json_build_object(
      'id', m.id,
      'content', m.content,
      'type', m.message_type,
      'timestamp', m.created_at,
      'read', m.read_at IS NOT NULL
    )
    FROM messages m
    WHERE m.chat_id = c.id
    ORDER BY m.created_at DESC
    LIMIT 1
  ) as last_message,
  (
    SELECT COUNT(*)
    FROM messages m
    WHERE m.chat_id = c.id
    AND m.sender_id != cp.user_id
    AND (m.read_at IS NULL OR m.read_at > cp.last_read_at)
  ) as unread_count
FROM chats c
JOIN chat_participants cp ON cp.chat_id = c.id
WHERE cp.user_id = auth.uid()
ORDER BY c.updated_at DESC;
```

## Supabase Realtime Subscriptions

Für Echtzeit-Updates können folgende Subscriptions verwendet werden:

```typescript
// Neue Nachrichten abonnieren
supabase
  .channel(`chat:${chatId}`)
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'messages',
    filter: `chat_id=eq.${chatId}`
  }, (payload) => {
    // Neue Nachricht empfangen
    console.log('New message:', payload.new)
  })
  .subscribe()

// Chat-Updates abonnieren
supabase
  .channel(`chat-updates:${userId}`)
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'chats',
    filter: `id=in.(${chatIds.join(',')})`
  }, (payload) => {
    // Chat wurde aktualisiert
    console.log('Chat updated:', payload.new)
  })
  .subscribe()
```

## Migration-Reihenfolge

1. Erstelle `chats` Tabelle
2. Erstelle `chat_participants` Tabelle
3. Erstelle `messages` Tabelle
4. Erstelle `message_attachments` Tabelle
5. Erstelle Funktionen und Trigger
6. Aktiviere RLS und erstelle Policies
7. Erstelle Views
8. Erstelle Indizes für Performance
