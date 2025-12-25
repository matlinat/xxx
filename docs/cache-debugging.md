# IndexedDB Cache - Debugging Guide

## Überblick

Dieser Guide hilft dir, Probleme mit dem IndexedDB Cache zu diagnostizieren und zu beheben.

## Quick Check

### 1. Console Logs überprüfen

Öffne die Browser DevTools (F12) und gehe zur Console. Du solltest folgende Logs sehen:

```
[CACHE DB] 🗄️ Initializing ChatCache database...
[CACHE DB] ✅ Database opened successfully
[CACHE DB] 📊 Version: 1
[CACHE DB] 📋 Tables: ["messages", "chats"]
```

Wenn diese Logs fehlen, funktioniert die Datenbank-Initialisierung nicht.

### 2. Debug Panel verwenden

Im Development-Modus erscheint unten rechts ein **"🐛 Cache Debug"** Button. Klicke darauf, um:
- Database-Status zu sehen
- Anzahl gecachter Messages zu prüfen
- Storage Quota zu überprüfen
- Cache zu löschen (zum Testen)

### 3. Browser DevTools - Application Tab

1. Öffne DevTools → Application Tab
2. Gehe zu **IndexedDB** → **ChatCache**
3. Prüfe die Tabellen:
   - `messages`: Sollte gecachte Messages enthalten
   - `chats`: Sollte Metadata pro Chat enthalten

## Häufige Probleme

### Problem 1: Cache wird nicht gespeichert

**Symptome:**
- Console zeigt: `Found 0 messages in cache`
- IndexedDB ist leer in DevTools
- Debug Panel zeigt: `Total Messages: 0`

**Diagnose:**

```javascript
// In Browser Console
await window.debugCache.test('YOUR_CHAT_ID')
```

**Mögliche Ursachen:**

1. **IndexedDB ist deaktiviert**
   - Prüfe: Browser Settings → Privacy → Cookies erlauben
   - Inkognito-Modus hat manchmal IndexedDB deaktiviert

2. **Storage Quota voll**
   - Prüfe Debug Panel → Storage Quota
   - Wenn > 80%, automatischer Cleanup sollte greifen

3. **Browser-Kompatibilität**
   - Teste mit Chrome/Edge (beste Unterstützung)
   - Firefox und Safari können Probleme haben

**Lösung:**

```javascript
// Test cache operations
await window.debugCache.test('YOUR_CHAT_ID')

// Wenn test fehlschlägt, check console für errors
```

### Problem 2: Cache wird geladen, aber nicht angezeigt

**Symptome:**
- Console zeigt: `Found X messages in cache`
- Aber UI zeigt Loading Spinner
- Messages erscheinen erst nach Server-Sync

**Diagnose:**

Prüfe in der Console:
```
[CACHE] ⚡ Loaded from cache: Xms
[CACHE] 📊 Found X messages in cache
```

Wenn diese Logs fehlen, wird der Cache nicht richtig geladen.

**Lösung:**

1. Prüfe ob `getCachedMessagesSafe()` aufgerufen wird
2. Prüfe ob `convertToUIMessage()` korrekt funktioniert
3. Prüfe ob `setMessages()` aufgerufen wird

### Problem 3: Cache ist veraltet (stale)

**Symptome:**
- Alte Messages werden angezeigt
- Neue Messages erscheinen nicht sofort
- Console zeigt: `Cache is stale`

**Diagnose:**

```javascript
// Check cache metadata
await window.debugCache.chat('YOUR_CHAT_ID')
```

Prüfe `lastSyncAt` timestamp. Wenn > 5 Minuten alt, ist Cache stale.

**Erwartetes Verhalten:**
- Stale cache wird automatisch mit Server synchronisiert
- Neue Messages sollten nach Background-Sync erscheinen

**Lösung:**
- Das ist normales Verhalten, Cache wird automatisch aktualisiert
- Wenn Updates nicht erscheinen, prüfe Network Tab für API-Calls

### Problem 4: Messages werden doppelt angezeigt

**Symptome:**
- Gleiche Message erscheint mehrfach
- Nach Reload verschwinden Duplikate

**Diagnose:**

Prüfe Realtime-Subscription:
```
[REALTIME] New message: ...
```

**Ursachen:**
1. Message wird von Realtime UND Server-Sync geladen
2. Duplicate detection funktioniert nicht

**Lösung:**
- Prüfe `handleRealtimeMessage()` Duplicate-Check
- Prüfe ob Message-IDs korrekt sind

### Problem 5: Performance ist langsam trotz Cache

**Symptome:**
- Loading dauert > 100ms trotz Cache
- UI fühlt sich nicht "instant" an

**Diagnose:**

```javascript
// Check performance metrics
// In Console suche nach:
[CACHE METRICS] { 
  hit: true, 
  cacheTime: "XXms",  // Sollte < 50ms sein
  syncTime: "XXXms", 
  total: "XXXms" 
}
```

**Ursachen:**
1. Zu viele Messages im Cache (> 1000)
2. Langsames Device
3. Browser-Extension blockiert IndexedDB

**Lösung:**
```javascript
// Limit cache size
await window.debugCache.db.messages.where('chatId').equals('CHAT_ID').count()
// Wenn > 1000, cleanup durchführen
```

## Debug Tools

### Browser Console Commands

```javascript
// Check specific chat
await window.debugCache.chat('CHAT_ID')

// Check all cache
await window.debugCache.full()

// Test cache operations
await window.debugCache.test('CHAT_ID')

// Clear all cache
await window.debugCache.clear()

// Direct database access
window.debugCache.db
```

### Console Output Interpretation

**Guter Cache-Hit:**
```
[CACHE] ⚡ Loaded from cache: 25ms
[CACHE] 📊 Found 50 messages in cache
[CACHE] 🔄 Server sync: 650ms
[CACHE METRICS] { hit: true, cacheTime: "25ms", syncTime: "650ms", total: "675ms", messages: 50 }
```

**Cache-Miss (first load):**
```
[CACHE] ⚡ Loaded from cache: 15ms
[CACHE] 📊 Found 0 messages in cache
[CACHE] 🔄 Server sync: 850ms
[CACHE METRICS] { hit: false, cacheTime: "15ms", syncTime: "850ms", total: "865ms", messages: 0 }
```

**Incremental Sync:**
```
[CACHE] ⚡ Loaded from cache: 30ms
[CACHE] 📊 Found 50 messages in cache
[CACHE] 🔄 Incremental sync: 3 new messages in 120ms
```

## Testing Checklist

- [ ] Database öffnet erfolgreich (siehe Console)
- [ ] Messages werden gecacht nach erstem Load
- [ ] Bei zweitem Load kommen Messages aus Cache (< 50ms)
- [ ] Background Sync holt neue Messages
- [ ] Realtime Messages werden sofort angezeigt UND gecacht
- [ ] Storage Quota Management funktioniert
- [ ] Cache wird nach 30 Tagen aufgeräumt
- [ ] Offline-Modus zeigt gecachte Messages

## Manual Testing Steps

### Test 1: Cache-First Loading

1. Öffne Chat zum ersten Mal
2. Warte bis Messages geladen sind
3. Check Console: Messages sollten gecacht werden
4. Reload Page (F5)
5. Messages sollten SOFORT erscheinen (< 50ms)
6. Check Console: Cache-Hit sollte geloggt werden

**Erwartetes Ergebnis:**
- First load: 800-1200ms
- Second load: 30-50ms (aus Cache)

### Test 2: Incremental Sync

1. Öffne Chat (cached)
2. In anderem Browser: Sende neue Message
3. Original Browser: Message sollte via Realtime erscheinen
4. Reload Original Browser
5. Message sollte noch da sein (wurde gecacht)

**Erwartetes Ergebnis:**
- Realtime Message erscheint sofort
- Nach Reload ist Message im Cache

### Test 3: Offline Support

1. Öffne Chat (ensure cached)
2. DevTools → Network Tab → Set to "Offline"
3. Reload Page
4. Messages sollten aus Cache erscheinen
5. Network requests sollten fehlschlagen (erwartetes Verhalten)

**Erwartetes Ergebnis:**
- Messages aus Cache erscheinen
- Server-Sync schlägt fehl (ok)

### Test 4: Storage Quota

```javascript
// Check quota
const quota = await window.debugCache.db.table('messages').count()
console.log('Total messages:', quota)

// Should trigger cleanup at > 80% quota
```

## Common Error Messages

### `QuotaExceededError`
**Ursache:** Storage quota voll  
**Lösung:** `await window.debugCache.clear()` oder auto-cleanup abwarten

### `InvalidStateError`
**Ursache:** Database ist geschlossen  
**Lösung:** Reload page, prüfe ob Database richtig initialisiert wird

### `NotFoundError`
**Ursache:** Tabelle oder Record existiert nicht  
**Lösung:** Prüfe Database-Version, evtl. Cache clear nötig

### `ConstraintError`
**Ursache:** Duplicate Primary Key  
**Lösung:** Prüfe ob Message-IDs unique sind

## Support

Wenn du immer noch Probleme hast:

1. **Sammle Debug-Info:**
   ```javascript
   await window.debugCache.full()
   // Copy output
   ```

2. **Check Browser:**
   - Browser Version
   - Inkognito-Modus?
   - Extensions aktiv?

3. **Check Console:**
   - Alle Error Messages
   - Stack Traces

4. **Check Network Tab:**
   - API calls erfolgreich?
   - Response Format korrekt?

## Best Practices

1. **Development:** Nutze Debug Panel und Console Logs
2. **Testing:** Clear Cache zwischen Tests
3. **Production:** Monitor Cache Hit Rate in Analytics
4. **Performance:** Keep cache size < 1000 messages per chat

## Feature Flags

Falls Cache Probleme macht, kann er deaktiviert werden:

```typescript
// In chat-view.tsx
const ENABLE_CACHE = false // Disable cache completely

// Dann:
if (ENABLE_CACHE) {
  const cachedMessages = await getCachedMessagesSafe(chatId, 50)
  // ...
}
```

## Monitoring in Production

Add to Analytics:

```typescript
// Track cache metrics
if (cacheHit) {
  analytics.track('cache_hit', {
    cacheTime,
    messageCount,
  })
} else {
  analytics.track('cache_miss', {
    serverTime,
  })
}
```

