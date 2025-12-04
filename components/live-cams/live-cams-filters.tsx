// components/live-cams/live-cams-filters.tsx
"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface LiveCamsFiltersProps {
  onFilterChange: (filters: Record<string, string[]>) => void
}

const filterGroups = {
  Geschlecht: ["Frauen", "Männer", "Paare", "Transsexuell"],
  Sprachen: [
    "Deutsch", "Englisch", "Spanisch", "Französisch", "Russisch",
    "Italienisch", "Niederländisch", "Portugiesisch", "Arabisch", "Chinesisch",
    "Hindi", "Japanisch", "Koreanisch", "Bengali"
  ],
  Haarfarbe: [
    "Blond", "Braun", "Dunkelblond", "Rot", "Schwarz", "Rotblond",
    "Grau", "Kastanienbraun", "Weiß", "Andere"
  ],
  Vorlieben: [
    "Anal", "Blümchensex", "Große Titten", "Bukkake", "Interracial",
    "Sex-Parties", "Rimming", "Nylons", "Latex / Leder", "Bizarr",
    "Devot", "Windeln", "Lingerie", "Tittenfick", "Creampie",
    "Große Schwänze", "Swinger", "Uniformen", "High-Heels", "SM",
    "Wachs-Spiele", "Doktorspiele", "Dicke", "Sex im Freien", "Oralsex",
    "Gruppensex (MFF)", "Gruppensex", "Rollenspiele", "Füße", "Bondage",
    "Dominas & Sklaven", "Natursekt", "Omis", "Deepthroating (Extremblasen)",
    "Doppelte Penetrationen", "Gruppensex (MMF)", "Face-Sitting", "Voyeur",
    "Trampling", "Spanking", "Dominant", "Fisting", "Gothic", "Sexspielzeuge"
  ],
  Figur: [
    "Normal", "Sportlich", "Mollig", "Dick", "Muskulös",
    "Zierlich", "Schlank", "Ein paar Kilo mehr"
  ],
  Augenfarbe: ["Blau", "Grün", "Braun", "Grau", "Schwarz", "Nussbraun", "Andere"],
  Größe: ["Klein", "Normal", "Groß"],
  Tättowierung: ["Ja", "Nein"],
  Piercing: ["Augenbraue", "Nase", "Zunge", "Lippe", "Brust", "Bauchnabel", "Intim"],
  Herkunft: ["europäisch", "Asiatisch", "Lateinamerikanisch", "Afrikanisch", "Naher Osten", "Indisch", "Japanisch"],
  Intimbehaarung: ["Rasiert", "Behaart", "Teilrasiert"],
  "Merkmale (Haarlänge, ...)": ["Lange", "Schulterlang", "Kurz", "Glatze", "Brille"],
  "Sexuelle Orientierung": ["Bisexuell", "Gay", "Hetero"],
}

export function LiveCamsFilters({ onFilterChange }: LiveCamsFiltersProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({})

  const handleToggleFilter = (group: string, value: string) => {
    setSelectedFilters((prev) => {
      const groupFilters = prev[group] || []
      const newGroupFilters = groupFilters.includes(value)
        ? groupFilters.filter((f) => f !== value)
        : [...groupFilters, value]
      
      const newFilters = {
        ...prev,
        [group]: newGroupFilters.length > 0 ? newGroupFilters : undefined,
      }
      
      // Remove empty groups
      Object.keys(newFilters).forEach((key) => {
        if (!newFilters[key] || newFilters[key]!.length === 0) {
          delete newFilters[key]
        }
      })

      onFilterChange(newFilters)
      return newFilters
    })
  }

  const clearFilter = (group: string, value: string) => {
    handleToggleFilter(group, value)
  }

  const clearAllFilters = () => {
    setSelectedFilters({})
    onFilterChange({})
  }

  const activeFilterCount = Object.values(selectedFilters).reduce(
    (sum, filters) => sum + (filters?.length || 0),
    0
  )

  return (
    <div className="mb-6">
      {/* Collapsible Header */}
      <Button
        variant="outline"
        className="w-full justify-between mb-4"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="font-semibold">
          Filter {activeFilterCount > 0 && `(${activeFilterCount})`}
        </span>
        {isOpen ? (
          <ChevronUp className="size-4" />
        ) : (
          <ChevronDown className="size-4" />
        )}
      </Button>

      {/* Filter Content */}
      {isOpen && (
        <div className="rounded-lg border bg-card p-4 space-y-6">
          {Object.entries(filterGroups).map(([groupName, values]) => (
            <div key={groupName} className="space-y-2">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                {groupName}
              </h3>
              <div className="flex flex-wrap gap-2">
                {values.map((value) => {
                  const isSelected = selectedFilters[groupName]?.includes(value) || false
                  return (
                    <Badge
                      key={value}
                      variant={isSelected ? "default" : "outline"}
                      className={cn(
                        "cursor-pointer transition-colors",
                        isSelected && "bg-purple-500 hover:bg-purple-600 text-white"
                      )}
                      onClick={() => handleToggleFilter(groupName, value)}
                    >
                      {value}
                      {isSelected && (
                        <X className="size-3 ml-1" />
                      )}
                    </Badge>
                  )
                })}
              </div>
            </div>
          ))}

          {/* Clear All Button */}
          {activeFilterCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="w-full"
            >
              Alle Filter zurücksetzen
            </Button>
          )}
        </div>
      )}

      {/* Active Filter Pills */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2 mt-4">
          {Object.entries(selectedFilters).map(([group, values]) =>
            values?.map((value) => (
              <Badge
                key={`${group}-${value}`}
                variant="secondary"
                className="bg-purple-500/10 text-purple-400 hover:bg-purple-500/20"
              >
                {value}
                <X
                  className="size-3 ml-1 cursor-pointer"
                  onClick={() => clearFilter(group, value)}
                />
              </Badge>
            ))
          )}
        </div>
      )}
    </div>
  )
}

