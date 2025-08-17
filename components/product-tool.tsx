"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function ProductTool() {
  const [file, setFile] = useState<File | null>(null)
  const [originalUrl, setOriginalUrl] = useState<string | null>(null)
  const [processedUrl, setProcessedUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!file) return

    setLoading(true)
    setOriginalUrl(URL.createObjectURL(file))

    const formData = new FormData()
    formData.append("file", file)

    const res = await fetch("/api/process", {
      method: "POST",
      body: formData,
    })

    if (!res.ok) {
      console.error("Upload failed")
      setLoading(false)
      return
    }

    const data = await res.json()
    setProcessedUrl(data.processedUrl)
    setLoading(false)
  }

  return (
    <div className="w-full max-w-6xl mx-auto py-12 px-4">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Teste das Tool kostenlos</CardTitle>
          <CardDescription>
            Lade ein Bild hoch und vergleiche Original und Ergebnis direkt nebeneinander.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form
            onSubmit={handleUpload}
            className="flex flex-col md:flex-row items-center gap-4 justify-center"
          >
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="max-w-xs"
            />
            <Button type="submit" disabled={!file || loading}>
              {loading ? "Verarbeite..." : "Bild hochladen"}
            </Button>
          </form>

          {originalUrl && processedUrl && (
            <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Original</CardTitle>
                </CardHeader>
                <CardContent>
                  <Image
                    src={originalUrl}
                    alt="Original"
                    width={500}
                    height={500}
                    className="rounded-lg object-contain mx-auto"
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Ergebnis</CardTitle>
                </CardHeader>
                <CardContent>
                  <Image
                    src={processedUrl}
                    alt="Processed"
                    width={500}
                    height={500}
                    className="rounded-lg object-contain mx-auto"
                  />
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
