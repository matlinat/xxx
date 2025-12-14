"use client"

import * as React from "react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { type VisitorData } from "./statistics-utils"
import { cn } from "@/lib/utils"

interface VisitorChartProps {
  data: VisitorData[]
  className?: string
}

const chartConfig = {
  visitors: {
    label: "Besucher",
    color: "#3b82f6",
  },
} satisfies ChartConfig

export function VisitorChart({ data, className }: VisitorChartProps) {
  const hasData = data.length > 0

  if (!hasData) {
    return (
      <div
        className={cn(
          "flex items-center justify-center h-[400px] bg-muted/30 rounded-lg border",
          className
        )}
      >
        <div className="text-center p-8 bg-background rounded-lg shadow-sm border">
          <p className="text-muted-foreground font-medium">Keine Besucher</p>
        </div>
      </div>
    )
  }

  return (
    <div className={className}>
      <ChartContainer config={chartConfig} className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="date"
              tick={{ fill: "hsl(var(--muted-foreground))" }}
              tickLine={{ stroke: "hsl(var(--border))" }}
            />
            <YAxis
              label={{
                value: "Besucher",
                angle: -90,
                position: "insideLeft",
                style: { textAnchor: "middle", fill: "hsl(var(--muted-foreground))" },
              }}
              domain={[0, 300]}
              ticks={[0, 50, 100, 150, 200, 250, 300]}
              tick={{ fill: "hsl(var(--muted-foreground))" }}
              tickLine={{ stroke: "hsl(var(--border))" }}
            />
            <ChartTooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="rounded-lg border bg-background p-2 shadow-sm">
                      <div className="grid gap-2">
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-sm font-medium">Besucher</span>
                          <span className="text-sm font-bold">
                            {payload[0].value}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                }
                return null
              }}
            />
            <Line
              type="monotone"
              dataKey="visitors"
              stroke="hsl(var(--chart-1))"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  )
}
