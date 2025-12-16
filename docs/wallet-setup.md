# Wallet Setup

Diese Dokumentation beschreibt die Einrichtung der Wallet/Credits-Funktionalität.

## Datenbank-Setup

1. Führe das SQL-Script aus `docs/wallet-schema.sql` im Supabase SQL Editor aus
2. Dies erstellt:
   - Die `wallet_balances` Tabelle für Kontostände
   - Die `wallet_transactions` Tabelle für Transaktionshistorie
   - Indizes für Performance
   - Trigger für automatische Kontostand-Aktualisierung
   - Trigger für automatische MwSt-Berechnung
   - RLS Policies für Sicherheit

## Wichtige Features

### Automatische Kontostand-Verwaltung
- Bei jeder Transaktion wird der Kontostand automatisch aktualisiert
- Wenn kein Kontostand existiert, wird automatisch einer mit 0 erstellt
- Ausgaben werden validiert (keine negativen Kontostände möglich)

### MwSt-Berechnung (20% - Österreich)
- Top-ups: MwSt wird automatisch berechnet (Brutto → Netto + MwSt)
- Ausgaben: MwSt wurde bereits bei Top-up bezahlt (keine zusätzliche MwSt)
- Bonuses: MwSt-frei
- Rückerstattungen: MwSt-frei (MwSt wurde bereits bei Original-Transaktion erfasst)

### Transaktionshistorie
- Alle Transaktionen werden unveränderlich gespeichert
- Vollständige Nachvollziehbarkeit für Buchhaltung
- Referenzen zu Zahlungen und anderen Entitäten möglich

## Verwendung

### Als Subscriber

1. Logge dich als Subscriber ein
2. Gehe zu `/home/subscriber/wallet`
3. Sieh deinen aktuellen Kontostand
4. Lade Credits auf (Top-up)
5. Sieh deine Transaktionshistorie

### Server Actions

Die Wallet-Funktionalität verwendet Server Actions für sichere Operationen:

- `getWalletBalanceAction()` - Lädt Kontostand
- `getWalletTransactionsAction(filters?)` - Lädt Transaktionen mit Filtern
- `createTopUpTransactionAction(formData)` - Erstellt Top-up Transaktion

## Datenstruktur

### wallet_balances
- `user_id` → `users.auth_user_id`
- Jeder Subscriber hat genau einen Kontostand
- Beim Löschen eines Users wird der Kontostand automatisch gelöscht (CASCADE)

### wallet_transactions
- `user_id` → `users.auth_user_id`
- Alle Credits-Bewegungen werden hier gespeichert
- Unveränderliche Historie (keine Löschung möglich)

## Sicherheit

- RLS Policies stellen sicher, dass:
  - Subscriber nur ihren eigenen Kontostand lesen können
  - Subscriber nur ihre eigenen Transaktionen lesen können
  - INSERT/UPDATE/DELETE Operationen nur über Server Actions mit Admin-Client möglich sind
- Trigger validieren Transaktionen (z.B. keine negativen Kontostände)
- Automatische MwSt-Berechnung für rechtliche Compliance

## Rechtliche Compliance

- MwSt-Aufzeichnungen für alle Transaktionen (20% Österreich)
- Vollständige Transaktionshistorie für Buchhaltung
- Referenzen zu Zahlungen für Nachvollziehbarkeit
- Timestamps für alle Transaktionen
- Unveränderliche Transaktionshistorie (keine Löschung, nur neue Einträge)

