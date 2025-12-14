"use client"

import * as React from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"

// Dummy-Daten für verifizierte Profinamen
const verifiedPerformers = [
  "Anna Schmidt",
  "Maria Weber",
  "Sophie Müller",
  "Emma Fischer",
  "Lisa Wagner",
  "Laura Becker",
  "Julia Hoffmann",
  "Sarah Klein",
  "Nina Schulz",
  "Mia Lang",
]

interface PerformerAutocompleteProps {
  value: string[]
  onChange: (value: string[]) => void
  className?: string
}

export function PerformerAutocomplete({
  value = [],
  onChange,
  className,
}: PerformerAutocompleteProps) {
  const [search, setSearch] = React.useState("")
  const [showSuggestions, setShowSuggestions] = React.useState(false)
  const inputRef = React.useRef<HTMLInputElement>(null)

  const filteredPerformers = verifiedPerformers.filter(
    (performer) =>
      performer.toLowerCase().includes(search.toLowerCase()) &&
      !value.includes(performer)
  )

  const handleSelect = (performer: string) => {
    if (!value.includes(performer)) {
      onChange([...value, performer])
    }
    setSearch("")
    setShowSuggestions(false)
  }

  const handleRemove = (performer: string) => {
    onChange(value.filter((p) => p !== performer))
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && filteredPerformers.length > 0) {
      e.preventDefault()
      handleSelect(filteredPerformers[0])
    }
  }

  return (
    <div className={cn("w-full space-y-2 relative", className)}>
      <Input
        ref={inputRef}
        type="text"
        placeholder="Weitere Darsteller suchen..."
        value={search}
        onChange={(e) => {
          setSearch(e.target.value)
          setShowSuggestions(true)
        }}
        onFocus={() => setShowSuggestions(true)}
        onBlur={() => {
          // Delay to allow click on suggestion
          setTimeout(() => setShowSuggestions(false), 200)
        }}
        onKeyDown={handleKeyDown}
      />

      {showSuggestions && search.length > 0 && filteredPerformers.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-md max-h-60 overflow-auto">
          {filteredPerformers.map((performer) => (
            <div
              key={performer}
              className="px-3 py-2 hover:bg-accent cursor-pointer text-sm"
              onMouseDown={(e) => {
                e.preventDefault()
                handleSelect(performer)
              }}
            >
              {performer}
            </div>
          ))}
        </div>
      )}

      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((performer) => (
            <div
              key={performer}
              className="flex items-center gap-1 px-2 py-1 bg-secondary rounded-md text-sm"
            >
              {performer}
              <button
                type="button"
                onClick={() => handleRemove(performer)}
                className="ml-1 rounded-full hover:bg-destructive/20 p-0.5"
              >
                <X className="size-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
