"use client"

import * as React from "react"
import { X } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const categories = [
  "Romantik",
  "Action",
  "Fetisch",
  "Lesbian",
  "Gay",
  "BDSM",
  "Anal",
  "Oral",
  "Hardcore",
  "Softcore",
  "Solo",
  "Group",
  "Milf",
  "Teen",
  "Amateur",
  "Professional",
]

interface CategoryMultiSelectProps {
  value: string[]
  onChange: (value: string[]) => void
  className?: string
}

export function CategoryMultiSelect({
  value = [],
  onChange,
  className,
}: CategoryMultiSelectProps) {
  const [open, setOpen] = React.useState(false)

  const availableCategories = categories.filter(
    (cat) => !value.includes(cat)
  )

  const handleSelect = (category: string) => {
    if (value.length < 3 && !value.includes(category)) {
      onChange([...value, category])
    }
  }

  const handleRemove = (category: string) => {
    onChange(value.filter((cat) => cat !== category))
  }

  return (
    <div className={cn("w-full space-y-2", className)}>
      <Select open={open} onOpenChange={setOpen}>
        <SelectTrigger
          className={cn(
            "w-full",
            value.length >= 3 && "opacity-50 cursor-not-allowed"
          )}
          disabled={value.length >= 3}
        >
          <SelectValue
            placeholder={
              value.length === 0
                ? "Kategorien auswählen (max. 3)"
                : `${value.length} Kategorie${value.length > 1 ? "n" : ""} ausgewählt`
            }
          />
        </SelectTrigger>
        <SelectContent>
          {availableCategories.length === 0 ? (
            <div className="p-2 text-sm text-muted-foreground text-center">
              Alle Kategorien ausgewählt oder Maximum erreicht
            </div>
          ) : (
            availableCategories.map((category) => (
              <SelectItem
                key={category}
                value={category}
                onSelect={() => handleSelect(category)}
              >
                {category}
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>

      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((category) => (
            <Badge
              key={category}
              variant="secondary"
              className="flex items-center gap-1 pr-1"
            >
              {category}
              <button
                type="button"
                onClick={() => handleRemove(category)}
                className="ml-1 rounded-full hover:bg-destructive/20 p-0.5"
              >
                <X className="size-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}
