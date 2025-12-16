"use client"

import * as React from "react"
import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { UserCircle, Upload, X, Image as ImageIcon } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { VideoDescriptionEditor } from "@/components/video-upload/video-description-editor"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { saveCreatorProfileAction } from "@/app/(auth)/actions"
import { CreatorProfile } from "@/lib/supabase/creator-profiles"
import { supabase } from "@/lib/supabase/client"
import { toast } from "sonner"

interface ProfileEditFormProps {
  initialData?: CreatorProfile | null
}

const languages = [
  "Deutsch", "Englisch", "Französisch", "Spanisch", "Italienisch",
  "Portugiesisch", "Niederländisch", "Polnisch", "Russisch", "Tschechisch",
  "Slowakisch", "Ungarisch", "Rumänisch", "Bulgarisch", "Kroatisch",
  "Serbisch", "Türkisch", "Arabisch", "Japanisch", "Chinesisch", "Koreanisch"
]

const sexualPreferences = [
  "Anal", "Outdoor", "Rollenspiele", "Dessous", "Toys", "BDSM",
  "Fetisch", "Gruppe", "Solo", "Lesbisch", "Gay", "Hetero",
  "Bisexuell", "Voyeurismus", "Exhibitionismus", "Fetischismus"
]

const genderOptions = ["Weiblich", "Männlich", "Divers"]
const relationshipStatusOptions = ["Single", "In Beziehung", "Verheiratet", "Kompliziert"]
const sexualOrientationOptions = ["Heterosexuell", "Homosexuell", "Bisexuell", "Pansexuell", "Asexuell"]
const zodiacSigns = [
  "Widder", "Stier", "Zwillinge", "Krebs", "Löwe", "Jungfrau",
  "Waage", "Skorpion", "Schütze", "Steinbock", "Wassermann", "Fische"
]
const tattooOptions = ["Ja", "Nein"]
const piercingOptions = ["Ja", "Nein"]
const intimateShavingOptions = ["Vollrasiert", "Teilrasiert", "Natürlich"]
const bodyTypeOptions = ["Schlank", "Sportlich", "Kurvig", "Muskulös", "Übergewichtig"]

export function ProfileEditForm({ initialData }: ProfileEditFormProps) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [error, setError] = React.useState<string>("")
  const [success, setSuccess] = React.useState(false)

  // Form state
  const [nickname, setNickname] = React.useState(initialData?.nickname || "")
  const [avatarUrl, setAvatarUrl] = React.useState(initialData?.avatar_url || "")
  const [coverUrl, setCoverUrl] = React.useState(initialData?.cover_url || "")
  const [isOnline, setIsOnline] = React.useState(initialData?.is_online || false)
  const [availableFor, setAvailableFor] = React.useState<'live-chat' | 'live-video' | 'offline'>(
    initialData?.available_for || 'offline'
  )
  const [fansCount, setFansCount] = React.useState(String(initialData?.fans_count || 0))
  const [about, setAbout] = React.useState(initialData?.about || "")
  const [gender, setGender] = React.useState(initialData?.gender || "")
  const [age, setAge] = React.useState(String(initialData?.age || ""))
  const [location, setLocation] = React.useState(initialData?.location || "")
  const [selectedLanguages, setSelectedLanguages] = React.useState<string[]>(
    initialData?.languages || []
  )
  const [relationshipStatus, setRelationshipStatus] = React.useState(initialData?.relationship_status || "")
  const [sexualOrientation, setSexualOrientation] = React.useState(initialData?.sexual_orientation || "")
  const [height, setHeight] = React.useState(String(initialData?.height || ""))
  const [weight, setWeight] = React.useState(String(initialData?.weight || ""))
  const [hairColor, setHairColor] = React.useState(initialData?.hair_color || "")
  const [eyeColor, setEyeColor] = React.useState(initialData?.eye_color || "")
  const [zodiacSign, setZodiacSign] = React.useState(initialData?.zodiac_sign || "")
  const [tattoos, setTattoos] = React.useState(initialData?.tattoos || "")
  const [piercings, setPiercings] = React.useState(initialData?.piercings || "")
  const [intimateShaving, setIntimateShaving] = React.useState(initialData?.intimate_shaving || "")
  const [bodyType, setBodyType] = React.useState(initialData?.body_type || "")
  const [penisSize, setPenisSize] = React.useState(initialData?.penis_size || "")
  const [selectedSexualPreferences, setSelectedSexualPreferences] = React.useState<string[]>(
    initialData?.sexual_preferences || []
  )

  // Avatar/Cover upload
  const [avatarFile, setAvatarFile] = React.useState<File | null>(null)
  const [coverFile, setCoverFile] = React.useState<File | null>(null)
  const avatarInputRef = React.useRef<HTMLInputElement>(null)
  const coverInputRef = React.useRef<HTMLInputElement>(null)

  const handleAvatarUpload = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file)

      if (uploadError) throw uploadError

      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName)

      return data.publicUrl
    } catch (error: any) {
      toast.error("Fehler beim Hochladen des Avatars")
      console.error(error)
      return null
    }
  }

  const handleCoverUpload = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('covers')
        .upload(fileName, file)

      if (uploadError) throw uploadError

      const { data } = supabase.storage
        .from('covers')
        .getPublicUrl(fileName)

      return data.publicUrl
    } catch (error: any) {
      toast.error("Fehler beim Hochladen des Covers")
      console.error(error)
      return null
    }
  }

  const toggleLanguage = (lang: string) => {
    setSelectedLanguages(prev =>
      prev.includes(lang) ? prev.filter(l => l !== lang) : [...prev, lang]
    )
  }

  const toggleSexualPreference = (pref: string) => {
    setSelectedSexualPreferences(prev =>
      prev.includes(pref) ? prev.filter(p => p !== pref) : [...prev, pref]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess(false)

    startTransition(async () => {
      // Upload files first if selected
      let finalAvatarUrl = avatarUrl
      let finalCoverUrl = coverUrl

      if (avatarFile) {
        const uploadedUrl = await handleAvatarUpload(avatarFile)
        if (uploadedUrl) {
          finalAvatarUrl = uploadedUrl
        } else {
          return // Stop if upload failed
        }
      }
      if (coverFile) {
        const uploadedUrl = await handleCoverUpload(coverFile)
        if (uploadedUrl) {
          finalCoverUrl = uploadedUrl
        } else {
          return // Stop if upload failed
        }
      }

      const formData = new FormData()
      formData.append('nickname', nickname)
      formData.append('avatar_url', finalAvatarUrl)
      formData.append('cover_url', finalCoverUrl)
      formData.append('is_online', String(isOnline))
      formData.append('available_for', availableFor)
      formData.append('fans_count', fansCount)
      formData.append('about', about)
      formData.append('gender', gender)
      formData.append('age', age)
      formData.append('location', location)
      formData.append('languages', JSON.stringify(selectedLanguages))
      formData.append('relationship_status', relationshipStatus)
      formData.append('sexual_orientation', sexualOrientation)
      formData.append('height', height)
      formData.append('weight', weight)
      formData.append('hair_color', hairColor)
      formData.append('eye_color', eyeColor)
      formData.append('zodiac_sign', zodiacSign)
      formData.append('tattoos', tattoos)
      formData.append('piercings', piercings)
      formData.append('intimate_shaving', intimateShaving)
      formData.append('body_type', bodyType)
      formData.append('penis_size', penisSize)
      formData.append('sexual_preferences', JSON.stringify(selectedSexualPreferences))

      const result = await saveCreatorProfileAction(formData)

      if (result?.error) {
        setError(result.error)
        toast.error(result.error)
      } else {
        setSuccess(true)
        toast.success("Profil erfolgreich gespeichert!")
        router.refresh()
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-lg border border-red-500 bg-red-500/10 p-4 text-red-500">
          {error}
        </div>
      )}

      {/* Basis-Informationen */}
      <Card>
        <CardHeader>
          <CardTitle>Basis-Informationen</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nickname">Nickname *</Label>
            <Input
              id="nickname"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="Dein Profilname"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Avatar</Label>
              <div className="flex items-center gap-4">
                {avatarUrl && (
                  <img
                    src={avatarUrl}
                    alt="Avatar"
                    className="size-20 rounded-full object-cover border"
                  />
                )}
                <div className="flex-1">
                  <Input
                    ref={avatarInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        setAvatarFile(file)
                        // Preview
                        const reader = new FileReader()
                        reader.onloadend = () => {
                          setAvatarUrl(reader.result as string)
                        }
                        reader.readAsDataURL(file)
                      }
                    }}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => avatarInputRef.current?.click()}
                  >
                    <Upload className="size-4 mr-2" />
                    Avatar hochladen
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Cover-Bild</Label>
              <div className="flex items-center gap-4">
                {coverUrl && (
                  <img
                    src={coverUrl}
                    alt="Cover"
                    className="h-20 w-32 rounded object-cover border"
                  />
                )}
                <div className="flex-1">
                  <Input
                    ref={coverInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        setCoverFile(file)
                        // Preview
                        const reader = new FileReader()
                        reader.onloadend = () => {
                          setCoverUrl(reader.result as string)
                        }
                        reader.readAsDataURL(file)
                      }
                    }}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => coverInputRef.current?.click()}
                  >
                    <Upload className="size-4 mr-2" />
                    Cover hochladen
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <Checkbox
                id="is_online"
                checked={isOnline}
                onCheckedChange={(checked) => setIsOnline(!!checked)}
              />
              <Label htmlFor="is_online" className="cursor-pointer">
                Online
              </Label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="available_for">Verfügbar für</Label>
              <Select value={availableFor} onValueChange={(v: any) => setAvailableFor(v)}>
                <SelectTrigger id="available_for">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="offline">Offline</SelectItem>
                  <SelectItem value="live-chat">Live Chat</SelectItem>
                  <SelectItem value="live-video">Live Video</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fans_count">Fans Anzahl</Label>
              <Input
                id="fans_count"
                type="number"
                value={fansCount}
                onChange={(e) => setFansCount(e.target.value)}
                min="0"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Über mich */}
      <Card>
        <CardHeader>
          <CardTitle>Über mich</CardTitle>
        </CardHeader>
        <CardContent>
          <VideoDescriptionEditor value={about} onChange={setAbout} />
        </CardContent>
      </Card>

      {/* Profil-Details */}
      <Card>
        <CardHeader>
          <CardTitle>Profil-Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="gender">Geschlecht</Label>
              <Select value={gender} onValueChange={setGender}>
                <SelectTrigger id="gender">
                  <SelectValue placeholder="Auswählen" />
                </SelectTrigger>
                <SelectContent>
                  {genderOptions.map(opt => (
                    <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="age">Alter</Label>
              <Input
                id="age"
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                min="18"
                max="100"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Ort</Label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="z.B. 10115 Berlin"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="relationship_status">Beziehungsstatus</Label>
              <Select value={relationshipStatus} onValueChange={setRelationshipStatus}>
                <SelectTrigger id="relationship_status">
                  <SelectValue placeholder="Auswählen" />
                </SelectTrigger>
                <SelectContent>
                  {relationshipStatusOptions.map(opt => (
                    <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sexual_orientation">Sexuelle Orientierung</Label>
              <Select value={sexualOrientation} onValueChange={setSexualOrientation}>
                <SelectTrigger id="sexual_orientation">
                  <SelectValue placeholder="Auswählen" />
                </SelectTrigger>
                <SelectContent>
                  {sexualOrientationOptions.map(opt => (
                    <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="height">Größe (cm)</Label>
              <Input
                id="height"
                type="number"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                min="100"
                max="250"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="weight">Gewicht (kg)</Label>
              <Input
                id="weight"
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                min="30"
                max="200"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="hair_color">Haarfarbe</Label>
              <Input
                id="hair_color"
                value={hairColor}
                onChange={(e) => setHairColor(e.target.value)}
                placeholder="z.B. Blond"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="eye_color">Augenfarbe</Label>
              <Input
                id="eye_color"
                value={eyeColor}
                onChange={(e) => setEyeColor(e.target.value)}
                placeholder="z.B. Blau"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="zodiac_sign">Sternzeichen</Label>
              <Select value={zodiacSign} onValueChange={setZodiacSign}>
                <SelectTrigger id="zodiac_sign">
                  <SelectValue placeholder="Auswählen" />
                </SelectTrigger>
                <SelectContent>
                  {zodiacSigns.map(sign => (
                    <SelectItem key={sign} value={sign}>{sign}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="body_type">Erscheinung</Label>
              <Select value={bodyType} onValueChange={setBodyType}>
                <SelectTrigger id="body_type">
                  <SelectValue placeholder="Auswählen" />
                </SelectTrigger>
                <SelectContent>
                  {bodyTypeOptions.map(opt => (
                    <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tattoos">Tattoos</Label>
              <Select value={tattoos} onValueChange={setTattoos}>
                <SelectTrigger id="tattoos">
                  <SelectValue placeholder="Auswählen" />
                </SelectTrigger>
                <SelectContent>
                  {tattooOptions.map(opt => (
                    <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="piercings">Piercings</Label>
              <Select value={piercings} onValueChange={setPiercings}>
                <SelectTrigger id="piercings">
                  <SelectValue placeholder="Auswählen" />
                </SelectTrigger>
                <SelectContent>
                  {piercingOptions.map(opt => (
                    <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="intimate_shaving">Intimrasur</Label>
              <Select value={intimateShaving} onValueChange={setIntimateShaving}>
                <SelectTrigger id="intimate_shaving">
                  <SelectValue placeholder="Auswählen" />
                </SelectTrigger>
                <SelectContent>
                  {intimateShavingOptions.map(opt => (
                    <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="penis_size">Penisgröße (optional)</Label>
              <Input
                id="penis_size"
                value={penisSize}
                onChange={(e) => setPenisSize(e.target.value)}
                placeholder="z.B. 18 cm"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Sprachen</Label>
            <div className="flex flex-wrap gap-2">
              {languages.map(lang => (
                <Badge
                  key={lang}
                  variant={selectedLanguages.includes(lang) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggleLanguage(lang)}
                >
                  {lang}
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Sexuelle Vorlieben</Label>
            <div className="flex flex-wrap gap-2">
              {sexualPreferences.map(pref => (
                <Badge
                  key={pref}
                  variant={selectedSexualPreferences.includes(pref) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggleSexualPreference(pref)}
                >
                  {pref}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Abbrechen
        </Button>
        <Button type="submit" disabled={pending}>
          {pending ? "Speichern..." : "Profil speichern"}
        </Button>
      </div>
    </form>
  )
}
