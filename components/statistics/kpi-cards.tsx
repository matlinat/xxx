"use client"

import * as React from "react"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { type KPI } from "./statistics-utils"

interface KPICardsProps {
  kpis: KPI[]
  className?: string
}

export function KPICards({ kpis, className }: KPICardsProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4",
        className
      )}
    >
      {kpis.map((kpi) => (
        <Card
          key={kpi.id}
          className="p-4 bg-background border shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex flex-col items-center text-center">
            <div className="text-2xl md:text-3xl font-bold mb-2">
              {kpi.value}
            </div>
            <div className="text-xs font-medium uppercase underline text-muted-foreground">
              {kpi.label}
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
