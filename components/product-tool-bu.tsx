"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type BgMode = "transparent" | "white" | "brand"
const isHexColor = (v: string) => /^#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})$/.test(v)

export function ProductTool() {
  const [file, setFile] = React.useState<File | null>(null)
  const [bgMode, setBgMode] = React.useState<BgMode>("white")
  const [brandHex, setBrandHex] = React.useState("#ffffff")
  const [loading, setLoading] = React.useState(false)
  const [msg, setMsg] = React.useState("")
  const [resultUrl, setResultUrl] = React.useState<string | null>(null)
  const [originalPreview, setOriginalPreview] = React.useState<string | null>(null)
  const pollRef = React.useRef<ReturnType<typeof setInterval> | null>(null)

  React.useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
    }
  }, [])

  function onFilesSelected(files?: FileList | null) {
    const f = files?.[0]
    if (!f) return
    setFile(f)
    setResultUrl(null)
    setMsg("")
    const r = new FileReader()
    r.onload = () => setOriginalPreview(r.result as string)
    r.readAsDataURL(f)
  }

  async function startProcess() {
    if (!file) return setMsg("Bitte zuerst ein Bild wählen.")
    if (bgMode === "brand" && !isHexColor(brandHex)) {
      return setMsg("Bitte eine gültige HEX-Farbe angeben (z. B. #ff6600).")
    }

    setLoading(true)
    setMsg("Upload…")

    try {
      const signRes = await fetch("/api/sign-upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: file.name }),
      })
      const sign: { error?: string; signedUrl?: string; token?: string; path?: string } =
        await signRes.json()
      if (sign.error || !sign.signedUrl || !sign.token || !sign.path) {
        throw new Error(sign.error ?? "Signierung fehlgeschlagen.")
      }

      const putRes = await fetch(sign.signedUrl, {
        method: "PUT",
        headers: { "x-upsert": "true", authorization: `Bearer ${sign.token}` },
        body: file,
      })
      if (!putRes.ok) throw new Error("Fehler beim Upload.")

      setMsg("Verarbeitung gestartet…")
      const procRes = await fetch("/api/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          originalPath: sign.path,
          bgMode,
          brandHex: bgMode === "brand" ? brandHex : undefined,
        }),
      })
      const proc: { error?: string; jobId?: string } = await procRes.json()
      if (proc.error || !proc.jobId) throw new Error(proc.error ?? "Job-ID fehlt.")

      if (pollRef.current) clearInterval(pollRef.current)
      pollRef.current = setInterval(async () => {
        try {
          const s = await fetch(`/api/status?id=${proc.jobId}`)
          if (!s.ok) return
          const st: { status?: string; downloadUrl?: string } = await s.json()
          if (st.status === "done" && st.downloadUrl) {
            if (pollRef.current) clearInterval(pollRef.current)
            setResultUrl(st.downloadUrl)
            setLoading(false)
            setMsg("Fertig ✅")
          }
        } catch {
          /* still polling */
        }
      }, 1500)
    } catch (e) {
      const err = e instanceof Error ? e.message : "Unbekannter Fehler."
      setMsg("Fehler: " + err)
      setLoading(false)
    }
  }

  return (
    <>
      {/* Upload Card */}
      <Card>
        <CardHeader>
          <CardTitle>Bild hochladen</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Dropzone */}
          <Label
            htmlFor="file"
            className="
              flex h-40 w-full cursor-pointer flex-col items-center justify-center
              rounded-xl border border-dashed border-border text-center text-muted-foreground
              transition-colors hover:bg-accent hover:text-accent-foreground
            "
          >
            <span>Datei hier ablegen oder klicken</span>
            <Input
              id="file"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => onFilesSelected(e.target.files)}
            />
          </Label>

          {/* Controls */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Select value={bgMode} onValueChange={(v) => setBgMode(v as BgMode)}>
              <SelectTrigger className="w-full sm:w-56">
                <SelectValue placeholder="Hintergrund wählen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="white">Weiß</SelectItem>
                <SelectItem value="brand">Markenfarbe</SelectItem>
                <SelectItem value="transparent">Transparent</SelectItem>
              </SelectContent>
            </Select>

            <div
              className="flex items-center gap-3 rounded-md border px-3 py-2 sm:flex-1"
              aria-disabled={bgMode !== "brand"}
            >
              <input
                type="color"
                value={brandHex}
                onChange={(e) => setBrandHex(e.target.value)}
                disabled={bgMode !== "brand"}
                className="h-6 w-6 cursor-pointer disabled:opacity-40"
                aria-label="Markenfarbe wählen"
              />
              <Input
                value={brandHex}
                onChange={(e) => setBrandHex(e.target.value)}
                disabled={bgMode !== "brand"}
                className="max-w-28"
                placeholder="#ffffff"
              />
            </div>

            <Button
              onClick={startProcess}
              disabled={loading || !file}
              className="shrink-0"
            >
              {loading ? "Verarbeite…" : "Jetzt optimieren"}
            </Button>
          </div>

          {msg && <p className="text-sm text-muted-foreground">{msg}</p>}
        </CardContent>
      </Card>

      {/* Preview (nebeneinander, 50/50) */}
      {(originalPreview || resultUrl) && (
        <div className="flex flex-col sm:flex-row gap-4">
          {originalPreview && (
            <Card className="flex-1 w-1/2">
              <CardHeader>
                <CardTitle className="text-sm text-muted-foreground">Original</CardTitle>
              </CardHeader>
              <CardContent>
                <img
                  src={originalPreview}
                  alt="Original"
                  className="w-full max-h-96 rounded-lg object-contain"
                />
              </CardContent>
            </Card>
          )}
          {resultUrl && (
            <Card className="flex-1 w-1/2">
              <CardHeader>
                <CardTitle className="text-sm text-muted-foreground">Ergebnis</CardTitle>
              </CardHeader>
              <CardContent>
                <img
                  src={resultUrl}
                  alt="Ergebnis"
                  className="w-full max-h-96 rounded-lg object-contain"
                />
                <Button variant="link" asChild className="px-0 mt-2">
                  <a href={resultUrl} download>
                    Ergebnis herunterladen
                  </a>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </>
  )
}
