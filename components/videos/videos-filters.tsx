// components/videos/videos-filters.tsx
"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface VideosFiltersProps {
  onFilterChange: (filters: Record<string, string[]>) => void
}

const filterGroups = {
  Kategorien: [
    "Anal", "Teens", "Lesben", "MILF", "Blowjob", "Analsex", "Gruppensex", "Hardcore",
    "Bondage", "Fetisch", "S&M", "BDSM", "Gangbang", "Bukkake", "Creampie", "Deepthroat",
    "Fisting", "Rimming", "Spanking", "Rollenspiele", "POV", "Amateur", "Profi"
  ],
  Dauer: [
    "Kurz (0-10 min)", "Mittel (10-20 min)", "Lang (20-30 min)", "Sehr lang (30+ min)"
  ],
  Qualität: [
    "HD", "Full HD", "4K", "8K"
  ],
  Sortierung: [
    "Neueste zuerst", "Beliebteste", "Längste", "Kürzeste", "Am meisten angesehen"
  ],
}

export function VideosFilters({ onFilterChange }: VideosFiltersProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({})

  const handleToggleFilter = (group: string, value: string) => {
    setSelectedFilters((prev) => {
      const groupFilters = prev[group] || []
      const newGroupFilters = groupFilters.includes(value)
        ? groupFilters.filter((f) => f !== value)
        : [...groupFilters, value]
      
      // Build new filters object without undefined values
      const newFilters: Record<string, string[]> = {}
      
      // Copy all existing filters except the current group
      Object.keys(prev).forEach((key) => {
        if (key !== group && prev[key]) {
          newFilters[key] = prev[key]
        }
      })
      
      // Add the current group only if it has filters
      if (newGroupFilters.length > 0) {
        newFilters[group] = newGroupFilters
      }

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

