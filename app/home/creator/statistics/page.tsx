"use client"

import * as React from "react"
import Link from "next/link"
import { BarChart3, ChevronRight } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { KPICards } from "@/components/statistics/kpi-cards"
import { ProvisionChart } from "@/components/statistics/provision-chart"
import { VisitorChart } from "@/components/statistics/visitor-chart"
import {
  generateDummyKPIs,
  generateDummyProvisionData,
  generateDummyVisitorData,
  getMonthName,
  type KPI,
  type ProvisionData,
  type VisitorData,
} from "@/components/statistics/statistics-utils"

export default function CreatorStatisticsPage() {
  const [selectedMonth, setSelectedMonth] = React.useState<number>(
    new Date().getMonth()
  )
  const [kpis, setKPIs] = React.useState<KPI[]>([])
  const [provisionData, setProvisionData] = React.useState<ProvisionData[]>([])
  const [visitorData, setVisitorData] = React.useState<VisitorData[]>([])

  React.useEffect(() => {
    setKPIs(generateDummyKPIs(selectedMonth))
    setProvisionData(generateDummyProvisionData(selectedMonth))
    setVisitorData(generateDummyVisitorData(selectedMonth))
  }, [selectedMonth])

  const monthOptions = Array.from({ length: 12 }, (_, i) => ({
    value: i.toString(),
    label: getMonthName(i),
  }))

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BarChart3 className="size-8 text-indigo-500" />
          <h1 className="text-2xl font-bold">
            Statistik für {getMonthName(selectedMonth)}
          </h1>
        </div>
        <Link
          href="/home/creator/statistics/all"
          className="text-primary hover:underline flex items-center gap-1 text-sm font-medium"
        >
          Alle Anzeigen
          <ChevronRight className="size-4" />
        </Link>
      </div>

      {/* Monatsauswahl */}
      <div className="flex items-center gap-2">
        <label htmlFor="month-select" className="text-sm font-medium">
          Monat:
        </label>
        <Select
          value={selectedMonth.toString()}
          onValueChange={(value) => setSelectedMonth(parseInt(value))}
        >
          <SelectTrigger id="month-select" className="w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {monthOptions.map((month) => (
              <SelectItem key={month.value} value={month.value}>
                {month.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* KPI-Karten */}
      <KPICards kpis={kpis} />

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Provision Donut-Chart */}
        <div className="relative">
          <ProvisionChart data={provisionData} />
        </div>

        {/* Besucher Line-Chart */}
        <div>
          <VisitorChart data={visitorData} />
        </div>
      </div>
    </div>
  )
}
