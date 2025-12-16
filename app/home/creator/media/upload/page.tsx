"use client"

import * as React from "react"
import { Upload } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { VideoUploadField } from "@/components/video-upload/video-upload-field"
import { ThumbnailUploadField } from "@/components/video-upload/thumbnail-upload-field"
import { VideoDescriptionEditor } from "@/components/video-upload/video-description-editor"
import { CategoryMultiSelect } from "@/components/video-upload/category-multi-select"
import { PerformerAutocomplete } from "@/components/video-upload/performer-autocomplete"

const languages = [
  { value: "de", label: "Deutsch" },
  { value: "en", label: "Englisch" },
  { value: "fr", label: "Französisch" },
  { value: "es", label: "Spanisch" },
  { value: "it", label: "Italienisch" },
  { value: "pt", label: "Portugiesisch" },
  { value: "nl", label: "Niederländisch" },
  { value: "pl", label: "Polnisch" },
  { value: "ru", label: "Russisch" },
  { value: "cz", label: "Tschechisch" },
  { value: "sk", label: "Slowakisch" },
  { value: "hu", label: "Ungarisch" },
  { value: "ro", label: "Rumänisch" },
  { value: "bg", label: "Bulgarisch" },
  { value: "hr", label: "Kroatisch" },
  { value: "sr", label: "Serbisch" },
  { value: "tr", label: "Türkisch" },
  { value: "ar", label: "Arabisch" },
  { value: "ja", label: "Japanisch" },
  { value: "zh", label: "Chinesisch" },
  { value: "ko", label: "Koreanisch" },
]

const pricePerSecondOptions = [1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0, 5.5, 6.0]

export default function VideoUploadPage() {
  const [videoFile, setVideoFile] = React.useState<File | null>(null)
  const [title, setTitle] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [pricePerSecond, setPricePerSecond] = React.useState<string>("")
  const [language, setLanguage] = React.useState<string>("")
  const [categories, setCategories] = React.useState<string[]>([])
  const [softcoreThumbnails, setSoftcoreThumbnails] = React.useState<File[]>([])
  const [hardcoreThumbnails, setHardcoreThumbnails] = React.useState<File[]>([])
  const [performerType, setPerformerType] = React.useState<string>("")
  const [additionalPerformers, setAdditionalPerformers] = React.useState<string[]>([])
  const [termsAccepted, setTermsAccepted] = React.useState({
    rights: false,
    agb: false,
    age: false,
    privacy: false,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validierung
    if (!videoFile) {
      alert("Bitte wählen Sie ein Video aus.")
      return
    }
    if (!title.trim()) {
      alert("Bitte geben Sie einen Titel ein.")
      return
    }
    if (!pricePerSecond) {
      alert("Bitte wählen Sie einen Preis pro Sekunde.")
      return
    }
    if (!language) {
      alert("Bitte wählen Sie eine Sprache.")
      return
    }
    if (categories.length === 0) {
      alert("Bitte wählen Sie mindestens eine Kategorie.")
      return
    }
    if (!performerType) {
      alert("Bitte wählen Sie eine Darsteller-Option.")
      return
    }
    if (!termsAccepted.rights || !termsAccepted.agb || !termsAccepted.age || !termsAccepted.privacy) {
      alert("Bitte akzeptieren Sie alle Nutzungsbedingungen.")
      return
    }

    // Hier würde der Upload-Logik implementiert werden
    console.log("Formular-Daten:", {
      videoFile,
      title,
      description,
      pricePerSecond,
      language,
      categories,
      softcoreThumbnails,
      hardcoreThumbnails,
      performerType,
      additionalPerformers,
      termsAccepted,
    })

    alert("Video wurde zur Überprüfung eingereicht!")
  }

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Upload className="size-8 text-blue-500" />
        <h1 className="text-2xl font-bold">Video Upload</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Video-Datei</CardTitle>
          </CardHeader>
          <CardContent>
            <VideoUploadField value={videoFile} onChange={setVideoFile} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Video-Informationen</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Video Titel *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Geben Sie den Titel des Videos ein"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Video Beschreibung</Label>
              <VideoDescriptionEditor
                value={description}
                onChange={setDescription}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Preis pro Sekunde *</Label>
                <Select value={pricePerSecond} onValueChange={setPricePerSecond} required>
                  <SelectTrigger id="price">
                    <SelectValue placeholder="Preis auswählen" />
                  </SelectTrigger>
                  <SelectContent>
                    {pricePerSecondOptions.map((price) => (
                      <SelectItem key={price} value={price.toString()}>
                        {price.toFixed(1)} €
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="language">Sprache *</Label>
                <Select value={language} onValueChange={setLanguage} required>
                  <SelectTrigger id="language">
                    <SelectValue placeholder="Sprache auswählen" />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map((lang) => (
                      <SelectItem key={lang.value} value={lang.value}>
                        {lang.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Kategorien * (max. 3)</Label>
              <CategoryMultiSelect value={categories} onChange={setCategories} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Thumbnails</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Softcore Thumbnails</Label>
              <ThumbnailUploadField
                value={softcoreThumbnails}
                onChange={setSoftcoreThumbnails}
                label="Softcore"
              />
            </div>

            <Separator />

            <div className="space-y-2">
              <Label>Hardcore Thumbnails</Label>
              <ThumbnailUploadField
                value={hardcoreThumbnails}
                onChange={setHardcoreThumbnails}
                label="Hardcore"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Darsteller</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="performer-type">Darsteller-Option *</Label>
              <Select
                value={performerType}
                onValueChange={setPerformerType}
                required
              >
                <SelectTrigger id="performer-type">
                  <SelectValue placeholder="Option auswählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="solo">
                    Ich bin der einzige Darsteller
                  </SelectItem>
                  <SelectItem value="multiple">
                    Es sind noch weitere Darsteller im Video
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {performerType === "multiple" && (
              <div className="space-y-2">
                <Label>Weitere Darsteller</Label>
                <PerformerAutocomplete
                  value={additionalPerformers}
                  onChange={setAdditionalPerformers}
                />
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Nutzungsbedingungen *</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <Checkbox
                id="rights"
                checked={termsAccepted.rights}
                onCheckedChange={(checked) =>
                  setTermsAccepted({ ...termsAccepted, rights: !!checked })
                }
                className="mt-1"
              />
              <Label
                htmlFor="rights"
                className="text-sm font-normal cursor-pointer"
              >
                Ich bestätige, dass ich die Rechte am Video besitze und berechtigt
                bin, dieses Video auf dieser Plattform zu veröffentlichen.
              </Label>
            </div>

            <div className="flex items-start gap-3">
              <Checkbox
                id="agb"
                checked={termsAccepted.agb}
                onCheckedChange={(checked) =>
                  setTermsAccepted({ ...termsAccepted, agb: !!checked })
                }
                className="mt-1"
              />
              <Label
                htmlFor="agb"
                className="text-sm font-normal cursor-pointer"
              >
                Ich stimme den Allgemeinen Geschäftsbedingungen zu und habe diese
                gelesen und verstanden.
              </Label>
            </div>

            <div className="flex items-start gap-3">
              <Checkbox
                id="age"
                checked={termsAccepted.age}
                onCheckedChange={(checked) =>
                  setTermsAccepted({ ...termsAccepted, age: !!checked })
                }
                className="mt-1"
              />
              <Label
                htmlFor="age"
                className="text-sm font-normal cursor-pointer"
              >
                Ich bestätige, dass alle im Video dargestellten Personen volljährig
                sind und eine gültige Altersverifikation vorliegt.
              </Label>
            </div>

            <div className="flex items-start gap-3">
              <Checkbox
                id="privacy"
                checked={termsAccepted.privacy}
                onCheckedChange={(checked) =>
                  setTermsAccepted({ ...termsAccepted, privacy: !!checked })
                }
                className="mt-1"
              />
              <Label
                htmlFor="privacy"
                className="text-sm font-normal cursor-pointer"
              >
                Ich akzeptiere die Datenschutzerklärung und bin damit einverstanden,
                dass meine Daten gemäß den Bestimmungen verarbeitet werden.
              </Label>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline">
            Abbrechen
          </Button>
          <Button type="submit">Zur Überprüfung einreichen</Button>
        </div>
      </form>
    </div>
  )
}
