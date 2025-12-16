"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Gift, Sparkles, TrendingUp } from "lucide-react"

interface Bonus {
  id: string
  title: string
  description: string
  type: "welcome" | "loyalty" | "promotion"
  credits: number
  expiresAt?: string
  isActive: boolean
}

export function WalletBonuses() {
  // TODO: Lade echte Bonus-Daten aus der Datenbank
  const [bonuses] = React.useState<Bonus[]>([
    {
      id: "1",
      title: "Willkommens-Bonus",
      description: "Erhalte 10 Credits bei deiner ersten Aufladung",
      type: "welcome",
      credits: 10,
      isActive: true,
    },
    {
      id: "2",
      title: "Treue-Bonus",
      description: "Aufladung über 100€ = 20% Bonus",
      type: "loyalty",
      credits: 20,
      isActive: true,
    },
    {
      id: "3",
      title: "Frühlings-Aktion",
      description: "Begrenzt: 15% Extra-Credits bei jeder Aufladung",
      type: "promotion",
      credits: 15,
      expiresAt: "2024-04-30",
      isActive: true,
    },
  ])

  const getBonusIcon = (type: Bonus["type"]) => {
    switch (type) {
      case "welcome":
        return <Gift className="size-5" />
      case "loyalty":
        return <TrendingUp className="size-5" />
      case "promotion":
        return <Sparkles className="size-5" />
    }
  }

  const getBonusBadgeColor = (type: Bonus["type"]) => {
    switch (type) {
      case "welcome":
        return "bg-blue-500"
      case "loyalty":
        return "bg-purple-500"
      case "promotion":
        return "bg-pink-500"
    }
  }

  const activeBonuses = bonuses.filter(b => b.isActive)

  if (activeBonuses.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gift className="size-5 text-yellow-500" />
          Verfügbare Bonuses
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {activeBonuses.map((bonus) => (
            <Card key={bonus.id} className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 border-yellow-200 dark:border-yellow-900">
              <CardContent className="pt-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2 text-yellow-700 dark:text-yellow-400">
                    {getBonusIcon(bonus.type)}
                  </div>
                  <Badge className={getBonusBadgeColor(bonus.type)}>
                    +{bonus.credits}
                  </Badge>
                </div>
                <h3 className="font-semibold text-sm mb-1">{bonus.title}</h3>
                <p className="text-xs text-muted-foreground mb-2">
                  {bonus.description}
                </p>
                {bonus.expiresAt && (
                  <p className="text-xs text-muted-foreground">
                    Gültig bis: {new Date(bonus.expiresAt).toLocaleDateString("de-DE")}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

