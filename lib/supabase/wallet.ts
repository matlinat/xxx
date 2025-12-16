// lib/supabase/wallet.ts
import { createClient } from './server'
import { supabaseAdmin } from './admin'

export interface WalletBalance {
  id: string
  user_id: string
  balance: number
  created_at: string
  updated_at: string
}

export interface WalletTransaction {
  id: string
  user_id: string
  type: 'topup' | 'expense' | 'bonus' | 'refund'
  amount: number
  balance_after: number
  description: string
  reference_type: string | null
  reference_id: string | null
  vat_rate: number
  vat_amount: number
  net_amount: number
  currency: string
  payment_method: string | null
  payment_reference: string | null
  created_at: string
}

export interface TransactionFilters {
  type?: 'topup' | 'expense' | 'bonus' | 'refund'
  month?: string // Format: "YYYY-MM"
  limit?: number
  offset?: number
}

export interface TopUpPaymentData {
  payment_method?: string
  payment_reference?: string
  description?: string
}

const DEFAULT_VAT_RATE = 0.20 // 20% MwSt (Österreich)

/**
 * Lädt den aktuellen Kontostand eines Users
 * Erstellt automatisch Wallet-Balance wenn nicht vorhanden
 */
export async function getWalletBalance(userId: string): Promise<WalletBalance> {
  const supabase = await createClient()
  
  // Versuche Kontostand zu laden
  let { data, error } = await supabase
    .from('wallet_balances')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching wallet balance:', error)
    throw new Error('Fehler beim Laden des Kontostands')
  }

  // Wenn kein Kontostand existiert, erstelle einen mit 0
  if (!data) {
    const { data: newBalance, error: insertError } = await supabaseAdmin
      .from('wallet_balances')
      .insert({
        user_id: userId,
        balance: 0.00,
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error creating wallet balance:', insertError)
      throw new Error('Fehler beim Erstellen des Kontostands')
    }

    return newBalance
  }

  return data
}

/**
 * Lädt Transaktionen eines Users mit optionalen Filtern
 */
export async function getWalletTransactions(
  userId: string,
  filters?: TransactionFilters
): Promise<WalletTransaction[]> {
  const supabase = await createClient()
  
  let query = supabase
    .from('wallet_transactions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  // Filter nach Typ
  if (filters?.type) {
    query = query.eq('type', filters.type)
  }

  // Filter nach Monat
  if (filters?.month) {
    const [year, month] = filters.month.split('-')
    const startDate = new Date(parseInt(year), parseInt(month) - 1, 1).toISOString()
    const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59, 999).toISOString()
    query = query.gte('created_at', startDate).lte('created_at', endDate)
  }

  // Limit und Offset für Pagination
  if (filters?.limit) {
    query = query.limit(filters.limit)
  }
  if (filters?.offset) {
    query = query.range(filters.offset, filters.offset + (filters.limit || 100) - 1)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching wallet transactions:', error)
    throw new Error('Fehler beim Laden der Transaktionen')
  }

  return data || []
}

/**
 * Erstellt eine Top-up Transaktion (Credits aufladen)
 * Verwendet Admin-Client für sichere Ausführung
 */
export async function createTopUpTransaction(
  userId: string,
  amount: number,
  paymentData?: TopUpPaymentData
): Promise<{ transaction: WalletTransaction; newBalance: number }> {
  if (amount <= 0) {
    throw new Error('Betrag muss größer als 0 sein')
  }

  // Berechne MwSt (Brutto = amount, Netto und MwSt werden automatisch berechnet)
  const grossAmount = amount
  const vatRate = DEFAULT_VAT_RATE
  const netAmount = grossAmount / (1 + vatRate)
  const vatAmount = grossAmount - netAmount

  const description = paymentData?.description || `Credits aufladen: ${amount.toFixed(2)} Credits`

  // Hole aktuellen Kontostand für balance_after Berechnung
  const currentBalance = await getWalletBalance(userId)
  const balanceAfter = currentBalance.balance + amount

  // Erstelle Transaktion mit Admin-Client
  const { data: transaction, error } = await supabaseAdmin
    .from('wallet_transactions')
    .insert({
      user_id: userId,
      type: 'topup',
      amount: amount,
      balance_after: balanceAfter,
      description,
      vat_rate: vatRate,
      vat_amount: Math.round(vatAmount * 100) / 100,
      net_amount: Math.round(netAmount * 100) / 100,
      currency: 'EUR',
      payment_method: paymentData?.payment_method || null,
      payment_reference: paymentData?.payment_reference || null,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating top-up transaction:', error)
    throw new Error('Fehler beim Erstellen der Transaktion')
  }

  // Lade aktualisierten Kontostand
  const newBalance = await getWalletBalance(userId)

  return {
    transaction,
    newBalance: newBalance.balance,
  }
}

/**
 * Erstellt eine Ausgabe-Transaktion (Credits ausgeben)
 * Prüft ob genügend Credits vorhanden sind
 */
export async function createExpenseTransaction(
  userId: string,
  amount: number,
  description: string,
  referenceType?: string,
  referenceId?: string
): Promise<{ transaction: WalletTransaction; newBalance: number }> {
  if (amount <= 0) {
    throw new Error('Betrag muss größer als 0 sein')
  }

  // Prüfe ob genügend Credits vorhanden sind
  const currentBalance = await getWalletBalance(userId)
  if (currentBalance.balance < amount) {
    throw new Error(`Unzureichende Credits. Verfügbar: ${currentBalance.balance.toFixed(2)}, Benötigt: ${amount.toFixed(2)}`)
  }

  const expenseAmount = -Math.abs(amount) // Negativer Betrag für Ausgabe
  const balanceAfter = currentBalance.balance + expenseAmount

  // Erstelle Transaktion mit Admin-Client
  const { data: transaction, error } = await supabaseAdmin
    .from('wallet_transactions')
    .insert({
      user_id: userId,
      type: 'expense',
      amount: expenseAmount,
      balance_after: balanceAfter,
      description,
      reference_type: referenceType || null,
      reference_id: referenceId || null,
      vat_rate: DEFAULT_VAT_RATE, // MwSt bereits bei Top-up bezahlt
      vat_amount: 0.00, // Keine zusätzliche MwSt bei Ausgaben
      net_amount: Math.abs(expenseAmount), // Netto = Betrag (MwSt bereits bezahlt)
      currency: 'EUR',
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating expense transaction:', error)
    throw new Error('Fehler beim Erstellen der Transaktion')
  }

  // Lade aktualisierten Kontostand
  const newBalance = await getWalletBalance(userId)

  return {
    transaction,
    newBalance: newBalance.balance,
  }
}

/**
 * Erstellt eine Bonus-Transaktion (Bonus-Credits)
 */
export async function createBonusTransaction(
  userId: string,
  amount: number,
  description: string
): Promise<{ transaction: WalletTransaction; newBalance: number }> {
  if (amount <= 0) {
    throw new Error('Betrag muss größer als 0 sein')
  }

  // Hole aktuellen Kontostand
  const currentBalance = await getWalletBalance(userId)
  const balanceAfter = currentBalance.balance + amount

  // Erstelle Transaktion mit Admin-Client
  const { data: transaction, error } = await supabaseAdmin
    .from('wallet_transactions')
    .insert({
      user_id: userId,
      type: 'bonus',
      amount: amount,
      balance_after: balanceAfter,
      description,
      vat_rate: 0.00, // Bonuses sind MwSt-frei
      vat_amount: 0.00,
      net_amount: amount,
      currency: 'EUR',
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating bonus transaction:', error)
    throw new Error('Fehler beim Erstellen der Bonus-Transaktion')
  }

  // Lade aktualisierten Kontostand
  const newBalance = await getWalletBalance(userId)

  return {
    transaction,
    newBalance: newBalance.balance,
  }
}

/**
 * Erstellt eine Rückerstattungs-Transaktion (Refund)
 */
export async function createRefundTransaction(
  userId: string,
  amount: number,
  description: string,
  originalTransactionId?: string
): Promise<{ transaction: WalletTransaction; newBalance: number }> {
  if (amount <= 0) {
    throw new Error('Betrag muss größer als 0 sein')
  }

  // Hole aktuellen Kontostand
  const currentBalance = await getWalletBalance(userId)
  const balanceAfter = currentBalance.balance + amount

  // Erstelle Transaktion mit Admin-Client
  const { data: transaction, error } = await supabaseAdmin
    .from('wallet_transactions')
    .insert({
      user_id: userId,
      type: 'refund',
      amount: amount,
      balance_after: balanceAfter,
      description,
      reference_type: originalTransactionId ? 'transaction' : null,
      reference_id: originalTransactionId || null,
      vat_rate: DEFAULT_VAT_RATE,
      vat_amount: 0.00, // Rückerstattung ohne MwSt (MwSt wurde bereits bei Original-Transaktion erfasst)
      net_amount: amount,
      currency: 'EUR',
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating refund transaction:', error)
    throw new Error('Fehler beim Erstellen der Rückerstattungs-Transaktion')
  }

  // Lade aktualisierten Kontostand
  const newBalance = await getWalletBalance(userId)

  return {
    transaction,
    newBalance: newBalance.balance,
  }
}

