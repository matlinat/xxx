-- Wallet Datenbank-Schema
-- Diese Migration erstellt die Wallet-Tabellen für Credits-Verwaltung mit MwSt-Aufzeichnungen
-- MwSt-Satz: 20% (Österreich)

-- 1. Wallet Balances Tabelle
CREATE TABLE IF NOT EXISTS wallet_balances (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(auth_user_id) ON DELETE CASCADE UNIQUE NOT NULL,
  balance DECIMAL(12, 2) DEFAULT 0.00 NOT NULL CHECK (balance >= 0),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_wallet_balances_user_id ON wallet_balances(user_id);

-- 2. Wallet Transactions Tabelle
CREATE TYPE transaction_type AS ENUM ('topup', 'expense', 'bonus', 'refund');

CREATE TABLE IF NOT EXISTS wallet_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(auth_user_id) ON DELETE CASCADE NOT NULL,
  type transaction_type NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  balance_after DECIMAL(12, 2) NOT NULL CHECK (balance_after >= 0),
  description TEXT NOT NULL,
  reference_type TEXT, -- z.B. 'video', 'chat', 'subscription'
  reference_id UUID, -- ID der referenzierten Entität
  vat_rate DECIMAL(5, 4) DEFAULT 0.20 NOT NULL, -- 20% MwSt (Österreich)
  vat_amount DECIMAL(12, 2) DEFAULT 0.00 NOT NULL,
  net_amount DECIMAL(12, 2) DEFAULT 0.00 NOT NULL,
  currency TEXT DEFAULT 'EUR' NOT NULL,
  payment_method TEXT, -- z.B. 'credit_card', 'paypal', 'bank_transfer'
  payment_reference TEXT, -- Referenznummer der Zahlung
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_wallet_transactions_user_id ON wallet_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_type ON wallet_transactions(type);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_created_at ON wallet_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_user_created ON wallet_transactions(user_id, created_at DESC);

-- Trigger für updated_at bei wallet_balances
CREATE OR REPLACE FUNCTION update_wallet_balances_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_wallet_balances_updated_at ON wallet_balances;
CREATE TRIGGER trigger_update_wallet_balances_updated_at
BEFORE UPDATE ON wallet_balances
FOR EACH ROW
EXECUTE FUNCTION update_wallet_balances_updated_at();

-- Funktion zur automatischen Berechnung von MwSt, Netto- und Bruttobetrag
CREATE OR REPLACE FUNCTION calculate_vat(
  input_amount DECIMAL,
  vat_rate DECIMAL DEFAULT 0.20
)
RETURNS TABLE (
  net_amount DECIMAL,
  vat_amount DECIMAL,
  gross_amount DECIMAL
) AS $$
BEGIN
  RETURN QUERY SELECT
    ROUND(input_amount / (1 + vat_rate), 2)::DECIMAL AS net_amount,
    ROUND(input_amount - (input_amount / (1 + vat_rate)), 2)::DECIMAL AS vat_amount,
    input_amount AS gross_amount;
END;
$$ LANGUAGE plpgsql;

-- Funktion zur automatischen Aktualisierung des Kontostands bei Transaktionen
CREATE OR REPLACE FUNCTION update_wallet_balance_on_transaction()
RETURNS TRIGGER AS $$
DECLARE
  current_balance DECIMAL(12, 2);
  new_balance DECIMAL(12, 2);
BEGIN
  -- Hole aktuellen Kontostand oder erstelle neuen wenn nicht vorhanden
  SELECT balance INTO current_balance
  FROM wallet_balances
  WHERE user_id = NEW.user_id;

  -- Wenn kein Kontostand existiert, erstelle einen mit 0
  IF current_balance IS NULL THEN
    INSERT INTO wallet_balances (user_id, balance)
    VALUES (NEW.user_id, 0.00)
    ON CONFLICT (user_id) DO NOTHING;
    current_balance := 0.00;
  END IF;

  -- Berechne neuen Kontostand
  new_balance := current_balance + NEW.amount;

  -- Prüfe ob Kontostand nicht negativ wird (nur für Ausgaben)
  IF new_balance < 0 AND NEW.type = 'expense' THEN
    RAISE EXCEPTION 'Insufficient credits. Current balance: %, Required: %', current_balance, ABS(NEW.amount);
  END IF;

  -- Setze balance_after wenn nicht gesetzt
  IF NEW.balance_after IS NULL OR NEW.balance_after = 0 THEN
    NEW.balance_after := new_balance;
  END IF;

  -- Aktualisiere Kontostand
  UPDATE wallet_balances
  SET balance = new_balance,
      updated_at = NOW()
  WHERE user_id = NEW.user_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger für automatische Kontostand-Aktualisierung
DROP TRIGGER IF EXISTS trigger_update_wallet_balance_on_transaction ON wallet_transactions;
CREATE TRIGGER trigger_update_wallet_balance_on_transaction
BEFORE INSERT ON wallet_transactions
FOR EACH ROW
EXECUTE FUNCTION update_wallet_balance_on_transaction();

-- Funktion zur automatischen MwSt-Berechnung bei Top-ups
CREATE OR REPLACE FUNCTION calculate_vat_for_transaction()
RETURNS TRIGGER AS $$
DECLARE
  vat_calc RECORD;
BEGIN
  -- Nur für Top-ups MwSt berechnen (Ausgaben haben bereits bezahlte MwSt)
  IF NEW.type = 'topup' AND NEW.vat_amount = 0 AND NEW.net_amount = 0 THEN
    SELECT * INTO vat_calc
    FROM calculate_vat(ABS(NEW.amount), NEW.vat_rate);
    
    NEW.net_amount := vat_calc.net_amount;
    NEW.vat_amount := vat_calc.vat_amount;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger für automatische MwSt-Berechnung
DROP TRIGGER IF EXISTS trigger_calculate_vat_for_transaction ON wallet_transactions;
CREATE TRIGGER trigger_calculate_vat_for_transaction
BEFORE INSERT ON wallet_transactions
FOR EACH ROW
EXECUTE FUNCTION calculate_vat_for_transaction();

-- RLS Policies
ALTER TABLE wallet_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;

-- Entferne alte Policies falls vorhanden
DROP POLICY IF EXISTS "Subscribers can view their own balance" ON wallet_balances;
DROP POLICY IF EXISTS "Subscribers can view their own transactions" ON wallet_transactions;

-- Subscriber können nur ihren eigenen Kontostand lesen
CREATE POLICY "Subscribers can view their own balance"
ON wallet_balances FOR SELECT
USING (user_id = auth.uid());

-- Subscriber können nur ihre eigenen Transaktionen lesen
CREATE POLICY "Subscribers can view their own transactions"
ON wallet_transactions FOR SELECT
USING (user_id = auth.uid());

-- Hinweis: INSERT/UPDATE/DELETE Operationen werden nur über Server Actions mit Admin-Client durchgeführt
-- für maximale Sicherheit und Kontrolle

