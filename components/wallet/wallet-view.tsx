"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { WalletTransactions } from "@/components/wallet/wallet-transactions"
import { WalletBalance } from "@/components/wallet/wallet-balance"
import { WalletTopUp } from "@/components/wallet/wallet-topup"
import { WalletBonuses } from "@/components/wallet/wallet-bonuses"
import { Plus, Gift } from "lucide-react"

interface WalletViewProps {
  userId: string
}

export function WalletView({ userId }: WalletViewProps) {
  // TODO: Lade echte Daten aus der Datenbank
  // Für jetzt verwenden wir Dummy-Daten
  const [balance] = React.useState(1250.50)
  const [showTopUp, setShowTopUp] = React.useState(false)

  return (
    <div className="space-y-6">
      {/* Kontostand und Top-up CTA */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <WalletBalance balance={balance} />
        </div>
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="size-5" />
                Credits aufladen
              </CardTitle>
            </CardHeader>
            <CardContent>
              <WalletTopUp 
                userId={userId}
                onSuccess={() => {
                  // TODO: Balance aktualisieren
                  setShowTopUp(false)
                }}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Bonuses */}
      <WalletBonuses />

      {/* Transaktionen */}
      <Card>
        <CardHeader>
          <CardTitle>Transaktionsverlauf</CardTitle>
        </CardHeader>
        <CardContent>
          <WalletTransactions userId={userId} />
        </CardContent>
      </Card>
    </div>
  )
}

