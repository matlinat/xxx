"use client"

import * as React from "react"
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { formatCurrency, getTotalProvision, type ProvisionData } from "./statistics-utils"

interface ProvisionChartProps {
  data: ProvisionData[]
  className?: string
}

const chartConfig = {
  videos: {
    label: "Videos",
    color: "#3b82f6",
  },
  webcam: {
    label: "Webcam",
    color: "#10b981",
  },
  nachrichten: {
    label: "Nachrichten",
    color: "#8b5cf6",
  },
  bilder: {
    label: "Bilder",
    color: "#10b981",
  },
  trinkgeld: {
    label: "Trinkgeld",
    color: "#f59e0b",
  },
  geschenke: {
    label: "Geschenke",
    color: "#1e40af",
  },
} satisfies ChartConfig

export function ProvisionChart({ data, className }: ProvisionChartProps) {
  const total = getTotalProvision(data)

  // Transformiere Daten für Recharts
  const chartData = data.map((item) => ({
    name: item.category,
    value: item.value,
    fill: item.color,
  }))

  return (
    <div className={className}>
      <div className="relative">
        <ChartContainer config={chartConfig} className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={80}
                outerRadius={120}
                paddingAngle={2}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <ChartTooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-lg border bg-background p-2 shadow-sm">
                        <div className="grid gap-2">
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-sm font-medium">
                              {payload[0].name}
                            </span>
                            <span className="text-sm font-bold">
                              {formatCurrency(payload[0].value as number)}
                            </span>
                          </div>
                        </div>
                      </div>
                    )
                  }
                  return null
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* Zentrale Anzeige */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <div className="text-2xl font-bold">{formatCurrency(total)}</div>
            <div className="text-sm font-medium text-muted-foreground uppercase">
              Gesamt-Provision
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 flex flex-wrap justify-center gap-4">
        {data.map((item) => (
          <div
            key={item.category}
            className="flex items-center gap-2 text-sm"
          >
            <div
              className="size-3 rounded-sm"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-muted-foreground">{item.category}:</span>
            <span className="font-medium">{formatCurrency(item.value)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
