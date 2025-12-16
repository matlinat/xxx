"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { WalletTransactions } from "@/components/wallet/wallet-transactions"
import { WalletBalance } from "@/components/wallet/wallet-balance"
import { WalletTopUp } from "@/components/wallet/wallet-topup"
import { WalletBonuses } from "@/components/wallet/wallet-bonuses"
import { Plus } from "lucide-react"
import { getWalletBalanceAction } from "@/app/(auth)/actions"

interface WalletViewProps {
  userId: string
}

export function WalletView({ userId }: WalletViewProps) {
  const [balance, setBalance] = React.useState<number>(0)
  const [isLoading, setIsLoading] = React.useState(true)

  const loadBalance = React.useCallback(async () => {
    setIsLoading(true)
    try {
      const result = await getWalletBalanceAction()
      if (result.data) {
        setBalance(result.data.balance)
      }
    } catch (error) {
      console.error('Error loading balance:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  React.useEffect(() => {
    loadBalance()
  }, [loadBalance])

  const handleTopUpSuccess = React.useCallback(() => {
    // Lade Balance neu nach erfolgreichem Top-up
    loadBalance()
  }, [loadBalance])

  return (
    <div className="space-y-6">
      {/* Kontostand und Top-up CTA */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <WalletBalance balance={isLoading ? 0 : balance} />
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
                onSuccess={handleTopUpSuccess}
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

