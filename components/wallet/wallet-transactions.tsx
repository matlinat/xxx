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

interface Transaction {
  id: string
  date: Date
  type: "topup" | "expense"
  description: string
  amount: number
  balance: number
}

interface WalletTransactionsProps {
  userId: string
}

type SortOption = "date-desc" | "date-asc" | "amount-desc" | "amount-asc" | "type"
type FilterOption = "all" | "topup" | "expense"
type MonthOption = "all" | string

export function WalletTransactions({ userId }: WalletTransactionsProps) {
  // TODO: Lade echte Transaktionsdaten aus der Datenbank
  const [transactions] = React.useState<Transaction[]>([
    {
      id: "1",
      date: new Date("2024-03-15T10:30:00"),
      type: "topup",
      description: "Credits aufladen",
      amount: 100,
      balance: 1250.50,
    },
    {
      id: "2",
      date: new Date("2024-03-14T14:20:00"),
      type: "expense",
      description: "Video-Kauf: Premium Content",
      amount: -25.50,
      balance: 1150.50,
    },
    {
      id: "3",
      date: new Date("2024-03-12T09:15:00"),
      type: "expense",
      description: "Live-Chat Session",
      amount: -15.00,
      balance: 1176.00,
    },
    {
      id: "4",
      date: new Date("2024-03-10T16:45:00"),
      type: "topup",
      description: "Credits aufladen (+15 Bonus)",
      amount: 250,
      balance: 1191.00,
    },
    {
      id: "5",
      date: new Date("2024-03-08T11:30:00"),
      type: "expense",
      description: "Premium Video Abo",
      amount: -50.00,
      balance: 941.00,
    },
    {
      id: "6",
      date: new Date("2024-03-05T13:20:00"),
      type: "topup",
      description: "Credits aufladen",
      amount: 50,
      balance: 991.00,
    },
    {
      id: "7",
      date: new Date("2024-02-28T10:00:00"),
      type: "expense",
      description: "Video-Kauf: Exclusive Content",
      amount: -30.00,
      balance: 941.00,
    },
    {
      id: "8",
      date: new Date("2024-02-25T15:30:00"),
      type: "topup",
      description: "Credits aufladen (+5 Bonus)",
      amount: 100,
      balance: 971.00,
    },
  ])

  const [sortBy, setSortBy] = React.useState<SortOption>("date-desc")
  const [filterBy, setFilterBy] = React.useState<FilterOption>("all")
  const [monthFilter, setMonthFilter] = React.useState<MonthOption>("all")

  // Generiere verfügbare Monate aus Transaktionen
  const availableMonths = React.useMemo(() => {
    const months = new Set<string>()
    transactions.forEach(t => {
      const monthKey = `${t.date.getFullYear()}-${String(t.date.getMonth() + 1).padStart(2, '0')}`
      months.add(monthKey)
    })
    return Array.from(months).sort().reverse()
  }, [transactions])

  // Filtere und sortiere Transaktionen
  const filteredAndSortedTransactions = React.useMemo(() => {
    let filtered = [...transactions]

    // Filter nach Typ
    if (filterBy !== "all") {
      filtered = filtered.filter(t => t.type === filterBy)
    }

    // Filter nach Monat
    if (monthFilter !== "all") {
      filtered = filtered.filter(t => {
        const monthKey = `${t.date.getFullYear()}-${String(t.date.getMonth() + 1).padStart(2, '0')}`
        return monthKey === monthFilter
      })
    }

    // Sortiere
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "date-desc":
          return b.date.getTime() - a.date.getTime()
        case "date-asc":
          return a.date.getTime() - b.date.getTime()
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

  const formatDate = (date: Date) => {
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
            {filteredAndSortedTransactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  Keine Transaktionen gefunden
                </TableCell>
              </TableRow>
            ) : (
              filteredAndSortedTransactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell className="font-medium">
                    {formatDate(transaction.date)}
                  </TableCell>
                  <TableCell>{transaction.description}</TableCell>
                  <TableCell
                    className={cn(
                      "text-right font-semibold",
                      transaction.type === "topup"
                        ? "text-green-600 dark:text-green-400"
                        : "text-red-600 dark:text-red-400"
                    )}
                  >
                    <div className="flex items-center justify-end gap-1">
                      {transaction.type === "topup" ? (
                        <ArrowDown className="size-4" />
                      ) : (
                        <ArrowUp className="size-4" />
                      )}
                      {transaction.type === "topup" ? "+" : ""}
                      {Math.abs(transaction.amount).toFixed(2)} Credits
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    {transaction.balance.toFixed(2)} Credits
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        transaction.type === "topup" ? "default" : "destructive"
                      }
                    >
                      {transaction.type === "topup" ? "Aufladung" : "Ausgabe"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
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

