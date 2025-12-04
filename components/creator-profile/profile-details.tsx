// components/creator-profile/profile-details.tsx
"use client"

import { useState } from "react"
import {
  Calendar,
  MapPin,
  Globe,
  Heart,
  Ruler,
  Scale,
  Eye,
  Star,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface CreatorDetails {
  gender: string
  age: number
  location: string
  languages: string[]
  relationshipStatus: string
  sexualOrientation: string
  height: number
  weight: number
  hairColor: string
  eyeColor: string
  zodiacSign: string
  tattoos: string
  piercings: string
  intimateShaving: string
  bodyType: string
  penisSize: string | null
  sexualPreferences: string[]
}

interface ProfileDetailsProps {
  details: CreatorDetails
  collapsible?: boolean
}

interface DetailRowProps {
  icon?: React.ElementType
  label: string
  value: string | number | null
}

function DetailRow({ icon: Icon, label, value }: DetailRowProps) {
  if (!value) return null

  return (
    <div className="flex items-center gap-3 py-2">
      {Icon && <Icon className="size-4 text-muted-foreground flex-shrink-0" />}
      {!Icon && <div className="size-4 flex-shrink-0" />}
      <span className="text-sm text-muted-foreground flex-shrink-0">{label}</span>
      <span className="text-sm font-medium ml-auto text-right">{value}</span>
    </div>
  )
}

export function ProfileDetails({ details, collapsible = false }: ProfileDetailsProps) {
  const [isOpen, setIsOpen] = useState(false)

  const content = (
    <div className="divide-y divide-border">
      {/* Basis-Infos */}
      <div className="pb-3">
        <DetailRow label="Geschlecht" value={details.gender} />
        <DetailRow icon={Calendar} label="Alter" value={`${details.age} Jahre`} />
        <DetailRow icon={MapPin} label="Ort" value={details.location} />
        <DetailRow icon={Globe} label="Sprachen" value={details.languages.join(", ")} />
      </div>

      {/* Beziehung & Orientierung */}
      <div className="py-3">
        <DetailRow icon={Heart} label="Beziehungsstatus" value={details.relationshipStatus} />
        <DetailRow label="Sexuelle Orientierung" value={details.sexualOrientation} />
      </div>

      {/* Körperliche Merkmale */}
      <div className="py-3">
        <DetailRow icon={Ruler} label="Größe" value={`${details.height} cm`} />
        <DetailRow icon={Scale} label="Gewicht" value={`${details.weight} kg`} />
        <DetailRow label="Haarfarbe" value={details.hairColor} />
        <DetailRow icon={Eye} label="Augenfarbe" value={details.eyeColor} />
        <DetailRow label="Erscheinung" value={details.bodyType} />
      </div>

      {/* Weitere Details */}
      <div className="py-3">
        <DetailRow icon={Star} label="Sternzeichen" value={details.zodiacSign} />
        <DetailRow label="Tattoos" value={details.tattoos} />
        <DetailRow label="Piercings" value={details.piercings} />
        <DetailRow label="Intimrasur" value={details.intimateShaving} />
        {details.penisSize && (
          <DetailRow label="Penisgröße" value={details.penisSize} />
        )}
      </div>

      {/* Sexuelle Vorlieben */}
      {details.sexualPreferences.length > 0 && (
        <div className="pt-3">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="size-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Sexuelle Vorlieben</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {details.sexualPreferences.map((pref) => (
              <Badge
                key={pref}
                variant="secondary"
                className="bg-purple-500/10 text-purple-400 hover:bg-purple-500/20"
              >
                {pref}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  )

  if (collapsible) {
    return (
      <div className="rounded-lg border bg-card">
        <Button
          variant="ghost"
          className="w-full justify-between px-4 py-3 h-auto"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className="font-semibold">Profil-Details</span>
          {isOpen ? (
            <ChevronUp className="size-5" />
          ) : (
            <ChevronDown className="size-5" />
          )}
        </Button>
        <div
          className={cn(
            "overflow-hidden transition-all duration-300",
            isOpen ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
          )}
        >
          <div className="px-4 pb-4">{content}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-lg border bg-card p-4">
      <h3 className="font-semibold mb-3">Profil-Details</h3>
      {content}
    </div>
  )
}

