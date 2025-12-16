"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, Sparkles } from "lucide-react"

interface WalletTopUpProps {
  userId: string
  onSuccess?: () => void
}

const topUpAmounts = [
  { amount: 10, bonus: 0, label: "10 Credits" },
  { amount: 25, bonus: 2, label: "25 Credits (+2 Bonus)" },
  { amount: 50, bonus: 5, label: "50 Credits (+5 Bonus)" },
  { amount: 100, bonus: 15, label: "100 Credits (+15 Bonus)" },
  { amount: 250, bonus: 50, label: "250 Credits (+50 Bonus)" },
  { amount: 500, bonus: 125, label: "500 Credits (+125 Bonus)" },
]

export function WalletTopUp({ userId, onSuccess }: WalletTopUpProps) {
  const [selectedAmount, setSelectedAmount] = React.useState<string>("")
  const [customAmount, setCustomAmount] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(false)

  const handleTopUp = async () => {
    const amount = selectedAmount === "custom" 
      ? parseFloat(customAmount) 
      : parseFloat(selectedAmount)

    if (!amount || amount <= 0) {
      alert("Bitte wählen Sie einen gültigen Betrag aus.")
      return
    }

    setIsLoading(true)
    
    // TODO: Implementiere echte Top-up Logik
    // Hier würde die Zahlung verarbeitet werden
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    setIsLoading(false)
    alert(`Top-up erfolgreich! ${amount} Credits wurden hinzugefügt.`)
    onSuccess?.()
    
    // Reset form
    setSelectedAmount("")
    setCustomAmount("")
  }

  const selectedOption = topUpAmounts.find(
    opt => opt.amount.toString() === selectedAmount
  )

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="topup-amount">Betrag auswählen</Label>
        <Select value={selectedAmount} onValueChange={setSelectedAmount}>
          <SelectTrigger id="topup-amount">
            <SelectValue placeholder="Betrag wählen" />
          </SelectTrigger>
          <SelectContent>
            {topUpAmounts.map((option) => (
              <SelectItem key={option.amount} value={option.amount.toString()}>
                {option.label}
              </SelectItem>
            ))}
            <SelectItem value="custom">Eigener Betrag</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {selectedAmount === "custom" && (
        <div className="space-y-2">
          <Label htmlFor="custom-amount">Eigener Betrag (€)</Label>
          <Input
            id="custom-amount"
            type="number"
            min="1"
            step="0.01"
            value={customAmount}
            onChange={(e) => setCustomAmount(e.target.value)}
            placeholder="0.00"
          />
        </div>
      )}

      {selectedOption && selectedOption.bonus > 0 && (
        <Card className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border-purple-200 dark:border-purple-900">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-purple-700 dark:text-purple-400">
              <Sparkles className="size-4" />
              <span className="text-sm font-medium">
                Bonus: +{selectedOption.bonus} Credits
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      <Button
        onClick={handleTopUp}
        disabled={!selectedAmount || isLoading}
        className="w-full"
        size="lg"
      >
        {isLoading ? (
          "Wird verarbeitet..."
        ) : (
          <>
            <Plus className="size-4 mr-2" />
            Credits aufladen
          </>
        )}
      </Button>

      <p className="text-xs text-muted-foreground text-center">
        Sichere Zahlung über unseren Partner
      </p>
    </div>
  )
}

