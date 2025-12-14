export interface KPI {
  id: string
  value: number | string
  label: string
  unit?: string
}

export interface ProvisionData {
  category: string
  value: number
  color: string
}

export interface VisitorData {
  date: string
  visitors: number
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

export function getMonthName(monthIndex: number): string {
  const months = [
    "Januar",
    "Februar",
    "März",
    "April",
    "Mai",
    "Juni",
    "Juli",
    "August",
    "September",
    "Oktober",
    "November",
    "Dezember",
  ]
  return months[monthIndex] || "Unbekannt"
}

export function generateDummyKPIs(month?: number): KPI[] {
  // Für Dezember (Index 11) zeigen wir die Daten aus dem Screenshot
  const isDecember = month === 11 || month === undefined

  return [
    {
      id: "webcam-hours",
      value: 0,
      label: "WEBCAMSTUNDEN",
    },
    {
      id: "messages-sent",
      value: 0,
      label: "NACHRICHTEN GESENDET",
    },
    {
      id: "videos-uploaded",
      value: 0,
      label: "VIDEOS HOCHGELADEN",
    },
    {
      id: "videos-sold",
      value: isDecember ? 1 : 0,
      label: "VIDEOS VERKAUFT",
    },
    {
      id: "new-fans",
      value: 0,
      label: "NEUE FANS",
    },
    {
      id: "commission",
      value: isDecember ? formatCurrency(1.26) : formatCurrency(0),
      label: "PROVISION",
    },
  ]
}

export function generateDummyProvisionData(month?: number): ProvisionData[] {
  const isDecember = month === 11 || month === undefined

  return [
    {
      category: "Videos",
      value: isDecember ? 1.26 : 0,
      color: "#3b82f6", // Blau
    },
    {
      category: "Webcam",
      value: 0,
      color: "#10b981", // Grün
    },
    {
      category: "Nachrichten",
      value: 0,
      color: "#8b5cf6", // Lila
    },
    {
      category: "Bilder",
      value: 0,
      color: "#10b981", // Grün
    },
    {
      category: "Trinkgeld",
      value: 0,
      color: "#f59e0b", // Orange/Gelb
    },
    {
      category: "Geschenke",
      value: 0,
      color: "#1e40af", // Dunkelblau
    },
  ]
}

export function generateDummyVisitorData(month?: number): VisitorData[] {
  // Für Dezember zeigen wir leere Daten (keine Besucher)
  const isDecember = month === 11 || month === undefined

  if (isDecember) {
    return []
  }

  // Für andere Monate: Beispiel-Daten
  const daysInMonth = new Date(2024, month || 0, 0).getDate()
  const data: VisitorData[] = []

  for (let day = 1; day <= daysInMonth; day++) {
    data.push({
      date: `${day}`,
      visitors: Math.floor(Math.random() * 300),
    })
  }

  return data
}

export function getTotalProvision(data: ProvisionData[]): number {
  return data.reduce((sum, item) => sum + item.value, 0)
}
