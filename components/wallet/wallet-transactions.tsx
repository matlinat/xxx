"use client"

import * as React from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ArrowDown, ArrowUp, Filter } from "lucide-react"
import { cn } from "@/lib/utils"

import { getWalletTransactionsAction } from "@/app/(auth)/actions"
import type { WalletTransaction } from "@/lib/supabase/wallet"

interface WalletTransactionsProps {
  userId: string
}

type SortOption = "date-desc" | "date-asc" | "amount-desc" | "amount-asc" | "type"
type FilterOption = "all" | "topup" | "expense" | "bonus" | "refund"
type MonthOption = "all" | string

export function WalletTransactions({ userId }: WalletTransactionsProps) {
  const [transactions, setTransactions] = React.useState<WalletTransaction[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [sortBy, setSortBy] = React.useState<SortOption>("date-desc")
  const [filterBy, setFilterBy] = React.useState<FilterOption>("all")
  const [monthFilter, setMonthFilter] = React.useState<MonthOption>("all")

  // Lade Transaktionen
  const loadTransactions = React.useCallback(async () => {
    setIsLoading(true)
    try {
      const filters: { type?: WalletTransaction['type']; month?: string } = {}
      if (filterBy !== "all") {
        filters.type = filterBy as WalletTransaction['type']
      }
      if (monthFilter !== "all") {
        filters.month = monthFilter
      }

      const result = await getWalletTransactionsAction(filters)
      if (result.data) {
        setTransactions(result.data)
      }
    } catch (error) {
      console.error('Error loading transactions:', error)
    } finally {
      setIsLoading(false)
    }
  }, [filterBy, monthFilter])

  React.useEffect(() => {
    loadTransactions()
  }, [loadTransactions])

  // Generiere verfügbare Monate aus Transaktionen
  const availableMonths = React.useMemo(() => {
    const months = new Set<string>()
    transactions.forEach(t => {
      const date = new Date(t.created_at)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      months.add(monthKey)
    })
    return Array.from(months).sort().reverse()
  }, [transactions])

  // Filtere und sortiere Transaktionen
  const filteredAndSortedTransactions = React.useMemo(() => {
    let filtered = [...transactions]

    // Filter nach Typ (bereits im Backend gefiltert, aber für lokale Sortierung)
    if (filterBy !== "all") {
      filtered = filtered.filter(t => t.type === filterBy)
    }

    // Filter nach Monat (bereits im Backend gefiltert, aber für lokale Sortierung)
    if (monthFilter !== "all") {
      filtered = filtered.filter(t => {
        const date = new Date(t.created_at)
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        return monthKey === monthFilter
      })
    }

    // Sortiere
    filtered.sort((a, b) => {
      const dateA = new Date(a.created_at).getTime()
      const dateB = new Date(b.created_at).getTime()
      
      switch (sortBy) {
        case "date-desc":
          return dateB - dateA
        case "date-asc":
          return dateA - dateB
        case "amount-desc":
          return Math.abs(b.amount) - Math.abs(a.amount)
        case "amount-asc":
          return Math.abs(a.amount) - Math.abs(b.amount)
        case "type":
          return a.type.localeCompare(b.type)
        default:
          return 0
      }
    })

    return filtered
  }, [transactions, sortBy, filterBy, monthFilter])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  const formatMonth = (monthKey: string) => {
    const [year, month] = monthKey.split("-")
    const date = new Date(parseInt(year), parseInt(month) - 1)
    return new Intl.DateTimeFormat("de-DE", {
      month: "long",
      year: "numeric",
    }).format(date)
  }

  return (
    <div className="space-y-4">
      {/* Filter und Sortierung */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter className="size-4 text-muted-foreground" />
          <span className="text-sm font-medium">Filter:</span>
        </div>

        <Select value={filterBy} onValueChange={(value) => setFilterBy(value as FilterOption)}>
          <SelectTrigger className="w-[150px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle</SelectItem>
            <SelectItem value="topup">Aufladungen</SelectItem>
            <SelectItem value="expense">Ausgaben</SelectItem>
            <SelectItem value="bonus">Bonuses</SelectItem>
            <SelectItem value="refund">Rückerstattungen</SelectItem>
          </SelectContent>
        </Select>

        <Select value={monthFilter} onValueChange={setMonthFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Monat wählen" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Monate</SelectItem>
            {availableMonths.map((month) => (
              <SelectItem key={month} value={month}>
                {formatMonth(month)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Sortieren nach" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date-desc">Datum (neueste zuerst)</SelectItem>
            <SelectItem value="date-asc">Datum (älteste zuerst)</SelectItem>
            <SelectItem value="amount-desc">Betrag (höchste zuerst)</SelectItem>
            <SelectItem value="amount-asc">Betrag (niedrigste zuerst)</SelectItem>
            <SelectItem value="type">Typ</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Transaktionstabelle */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Datum & Uhrzeit</TableHead>
              <TableHead>Beschreibung</TableHead>
              <TableHead className="text-right">Betrag</TableHead>
              <TableHead className="text-right">Kontostand</TableHead>
              <TableHead>Typ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  Transaktionen werden geladen...
                </TableCell>
              </TableRow>
            ) : filteredAndSortedTransactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  Keine Transaktionen gefunden
                </TableCell>
              </TableRow>
            ) : (
              filteredAndSortedTransactions.map((transaction) => {
                const isPositive = transaction.amount > 0
                const typeLabel = {
                  topup: "Aufladung",
                  expense: "Ausgabe",
                  bonus: "Bonus",
                  refund: "Rückerstattung"
                }[transaction.type]

                return (
                  <TableRow key={transaction.id}>
                    <TableCell className="font-medium">
                      {formatDate(transaction.created_at)}
                    </TableCell>
                    <TableCell>{transaction.description}</TableCell>
                    <TableCell
                      className={cn(
                        "text-right font-semibold",
                        isPositive
                          ? "text-green-600 dark:text-green-400"
                          : "text-red-600 dark:text-red-400"
                      )}
                    >
                      <div className="flex items-center justify-end gap-1">
                        {isPositive ? (
                          <ArrowDown className="size-4" />
                        ) : (
                          <ArrowUp className="size-4" />
                        )}
                        {isPositive ? "+" : ""}
                        {Math.abs(transaction.amount).toFixed(2)} Credits
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {transaction.balance_after.toFixed(2)} Credits
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          transaction.type === "expense" ? "destructive" : "default"
                        }
                      >
                        {typeLabel}
                      </Badge>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      {filteredAndSortedTransactions.length > 0 && (
        <div className="text-sm text-muted-foreground text-center">
          {filteredAndSortedTransactions.length} Transaktion{filteredAndSortedTransactions.length !== 1 ? "en" : ""} angezeigt
        </div>
      )}
    </div>
  )
}

