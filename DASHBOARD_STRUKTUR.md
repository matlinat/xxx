# Dashboard-Struktur - Rollenbasierte Bereiche

## Übersicht

Es gibt jetzt **drei separate Dashboard-Bereiche**, die jeweils nur für die entsprechende Benutzerrolle zugänglich sind:

### 1. Creator Dashboard (`/creator`)
**Rolle:** `creator`  
**Ordner:** `app/(dashboard-creator)/`

**Navigation:**
- Quick Create
- Dashboard
- My Content
- Subscribers
- Analytics

### 2. Subscriber Dashboard (`/subscriber`)
**Rolle:** `subscriber`  
**Ordner:** `app/(dashboard-subscriber)/`

**Navigation:**
- Dashboard
- Subscriptions
- Saved Content
- Notifications

### 3. Admin Dashboard (`/admin`)
**Rolle:** `admin`  
**Ordner:** `app/(dashboard-admin)/`

**Navigation:**
- Dashboard
- User Management
- Content Moderation
- Analytics
- Reports

## Gemeinsame Elemente

Alle drei Dashboards teilen sich die **gleiche untere Sidebar-Navigation**:
- Settings → `/settings`
- Get Help → `/help`
- User Panel (Avatar, Name, Logout)

## Zugriffskontrolle

Die Zugriffskontrolle erfolgt in den jeweiligen `layout.tsx` Dateien:

1. Prüfung ob User eingeloggt ist
2. Abfrage der User-Rolle aus der Datenbank (`users.role`)
3. Redirect zu `/dashboard` falls die Rolle nicht passt

**Erwartete Rollenwerte in der Datenbank:**
- `'creator'` für Content Creator
- `'subscriber'` für Abonnenten
- `'admin'` für Plattform-Administratoren

## Nächste Schritte

Die Hauptseiten sind erstellt, aber noch ohne Inhalt. Folgende Unterseiten müssen noch implementiert werden:

**Creator:**
- `/creator/quick-create`
- `/creator/content`
- `/creator/subscribers`
- `/creator/analytics`

**Subscriber:**
- `/subscriber/subscriptions`
- `/subscriber/saved`
- `/subscriber/notifications`

**Admin:**
- `/admin/users`
- `/admin/moderation`
- `/admin/analytics`
- `/admin/reports`

## Technische Details

### Sidebar-Komponenten
- `AppSidebarCreator` - components/(dashboard)/app-sidebar-creator.tsx
- `AppSidebarSubscriber` - components/(dashboard)/app-sidebar-subscriber.tsx
- `AppSidebarAdmin` - components/(dashboard)/app-sidebar-admin.tsx

### Gemeinsame Komponenten
- `NavMain` - Hauptnavigation (rollenspezifisch)
- `NavSecondary` - Sekundärnavigation (Settings, Help)
- `NavUser` - User-Panel im Footer

