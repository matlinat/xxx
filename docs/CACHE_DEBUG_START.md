# IndexedDB Cache - Quick Start Debug

## 🚀 Schnellstart zum Debuggen

### Schritt 1: Starte die App

```bash
npm run dev
```

### Schritt 2: Öffne einen Chat

1. Gehe zu `/home/chat`
2. Öffne einen beliebigen Chat
3. Öffne die Browser DevTools (F12)
4. Gehe zum **Console** Tab

### Schritt 3: Prüfe die Console-Logs

Du solltest folgende Logs sehen:

```
✅ ERWARTETE LOGS:

[CACHE DB] 🗄️ Initializing ChatCache database...
[CACHE DB] ✅ Database opened successfully
[CACHE DB] 📊 Version: 1
[CACHE DB] 📋 Tables: ["messages", "chats"]

[CACHE] 🔄 getCachedMessagesSafe called for chat <chatId>
[CACHE] 📖 Loading messages from cache for chat <chatId>
[CACHE] 📊 Found X messages in cache
[CACHE] ⚡ Loaded from cache: XXms

[CACHE] 🔄 Server sync: XXXms
[CACHE] 💾 Saving X messages for chat <chatId>
[CACHE] ✅ Saved X messages to IndexedDB
[CACHE] 📊 Updated metadata: {...}
```

### Schritt 4: Nutze das Debug Panel

Unten rechts solltest du einen **"🐛 Cache Debug"** Button sehen.

Klicke darauf und prüfe:
- ✅ Database: Open
- ✅ Total Messages: > 0
- ✅ Messages (this chat): > 0
- ✅ Chat Metadata: Zeigt Last Sync

### Schritt 5: Teste den Cache

**Test 1 - Cache-Hit:**
1. Lade die Seite neu (F5)
2. Messages sollten SOFORT erscheinen (< 50ms)
3. Console sollte zeigen: `Found X messages in cache`

**Test 2 - IndexedDB prüfen:**
1. DevTools → **Application** Tab
2. Sidebar → **IndexedDB** → **ChatCache**
3. Klicke auf `messages` → Du solltest Messages sehen
4. Klicke auf `chats` → Du solltest Chat-Metadata sehen

## 🔴 Probleme? Quick Fixes

### Problem: Keine Logs in Console

**Check:**
```javascript
// In Browser Console eingeben:
window.debugCache
```

Wenn `undefined`, dann wurde debug-cache.ts nicht geladen.

**Fix:**
1. Prüfe ob du im Development-Modus bist (`NODE_ENV=development`)
2. Reload die Seite

### Problem: Database wird nicht geöffnet

**Error Message:**
```
[CACHE DB] ❌ Failed to open database: ...
```

**Mögliche Ursachen:**
1. IndexedDB ist im Browser deaktiviert
2. Du bist im Inkognito-Modus (manchmal blockiert)
3. Browser-Extension blockiert IndexedDB

**Fix:**
1. Teste in normalem (nicht Inkognito) Chrome/Edge
2. Deaktiviere Browser-Extensions
3. Check Browser Settings → Cookies → IndexedDB erlauben

### Problem: Messages werden nicht gecacht

**Console zeigt:**
```
[CACHE] 📊 Found 0 messages in cache
```

**Debug:**
```javascript
// In Browser Console:
await window.debugCache.test('YOUR_CHAT_ID')
```

Das testet ob cache write/read funktioniert.

**Wenn Test fehlschlägt:**
1. Check Console für Error Messages
2. Check Application Tab → IndexedDB → ChatCache
3. Try: `await window.debugCache.clear()` und dann reload

### Problem: Cache funktioniert, aber UI zeigt alte Daten

**Check:**
```javascript
// In Browser Console:
await window.debugCache.chat('YOUR_CHAT_ID')
```

Prüfe `lastSyncAt`. Wenn > 5 Minuten alt, sollte automatischer Sync laufen.

**Fix:**
1. Warte 10 Sekunden (Background-Sync läuft)
2. Reload die Seite
3. Neue Messages sollten da sein

## 🧪 Vollständiger Test-Ablauf

```javascript
// 1. Check ob debug tools verfügbar sind
window.debugCache
// Sollte object zurückgeben mit: { chat, full, clear, test, db }

// 2. Check full cache status
await window.debugCache.full()
// Zeigt alle gecachten Chats und Messages

// 3. Check specific chat (replace with actual chatId)
await window.debugCache.chat('YOUR_CHAT_ID')
// Zeigt Details für einen Chat

// 4. Test cache operations
await window.debugCache.test('YOUR_CHAT_ID')
// Testet write/read, sollte "All tests passed!" zeigen

// 5. Direct database access
await window.debugCache.db.messages.count()
// Zeigt Anzahl aller Messages

await window.debugCache.db.chats.toArray()
// Zeigt alle gecachten Chats
```

## 📊 Performance Metrics

### Erwartete Werte:

| Metrik | Erwarteter Wert | Gemessen bei |
|--------|-----------------|--------------|
| Cache Load | < 50ms | Cache Hit |
| Server Sync | 500-1000ms | Background |
| Total (First Load) | 800-1200ms | Cache Miss |
| Total (Cached) | 30-100ms | Cache Hit |

### Wie messen?

In der Console nach jedem Page-Load:

```
[CACHE METRICS] { 
  hit: true,           // ← Cache Hit?
  cacheTime: "25ms",   // ← Sollte < 50ms
  syncTime: "650ms",   // ← Background Sync
  total: "675ms",      // ← Gesamt (Cache + Sync)
  messages: 50         // ← Anzahl Messages
}
```

## 🆘 Immer noch Probleme?

1. **Sammle alle Informationen:**
   ```javascript
   // Copy this output:
   console.log('Browser:', navigator.userAgent)
   console.log('Database open:', window.debugCache.db.isOpen())
   await window.debugCache.full()
   ```

2. **Check Browser Compatibility:**
   - ✅ Chrome 90+
   - ✅ Edge 90+
   - ⚠️ Firefox 88+ (kann langsamer sein)
   - ⚠️ Safari 14+ (kann Probleme haben)

3. **Lies die vollständige Debugging-Dokumentation:**
   → `docs/cache-debugging.md`

## 🎯 Success Criteria

Cache funktioniert korrekt wenn:

- ✅ Database öffnet erfolgreich
- ✅ Messages werden nach erstem Load gecacht
- ✅ Bei Reload erscheinen Messages instant (< 50ms)
- ✅ Debug Panel zeigt korrekte Counts
- ✅ Application Tab zeigt Messages in IndexedDB
- ✅ Console zeigt keine Errors
- ✅ Performance Metrics im grünen Bereich

## 🔧 Nützliche Commands

```javascript
// Clear cache und neu starten
await window.debugCache.clear()
location.reload()

// Cache für einen Chat löschen
await window.debugCache.db.messages.where('chatId').equals('CHAT_ID').delete()
await window.debugCache.db.chats.delete('CHAT_ID')

// Alle Messages ansehen
await window.debugCache.db.messages.toArray()

// Storage Quota checken
const estimate = await navigator.storage.estimate()
console.log(`Used: ${(estimate.usage / 1024 / 1024).toFixed(2)} MB`)
console.log(`Quota: ${(estimate.quota / 1024 / 1024).toFixed(2)} MB`)
```

## ✨ Nächste Schritte

Wenn der Cache funktioniert:
1. Teste mit mehreren Chats
2. Teste Offline-Modus
3. Teste mit vielen Messages (> 100)
4. Monitor Performance Metrics
5. Check Storage Quota Usage

Viel Erfolg! 🚀

