"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Wallet } from "lucide-react"

interface WalletBalanceProps {
  balance: number
}

export function WalletBalance({ balance }: WalletBalanceProps) {
  return (
    <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-900">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
          <Wallet className="size-6" />
          Aktueller Kontostand
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-4xl font-bold text-green-700 dark:text-green-400">
          {balance.toFixed(2)} <span className="text-2xl font-normal">Credits</span>
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          Verfügbar für Ausgaben und Käufe
        </p>
      </CardContent>
    </Card>
  )
}

