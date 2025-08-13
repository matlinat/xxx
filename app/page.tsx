"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type BgMode = "transparent" | "white" | "brand";

export default function Page() {
  const [file, setFile] = useState<File | null>(null);
  const [bgMode, setBgMode] = useState<BgMode>("white");
  const [brandHex, setBrandHex] = useState("#ffffff");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [originalPreview, setOriginalPreview] = useState<string | null>(null);
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  function onFilesSelected(files?: FileList | null) {
    const f = files?.[0];
    if (!f) return;
    setFile(f);
    setResultUrl(null);
    setMsg("");
    const r = new FileReader();
    r.onload = () => setOriginalPreview(r.result as string);
    r.readAsDataURL(f);
  }

  async function startProcess() {
    if (!file) return setMsg("Bitte zuerst ein Bild wählen.");
    setLoading(true);
    setMsg("Upload…");

    const signRes = await fetch("/api/sign-upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filename: file.name }),
    });
    const sign = await signRes.json();
    if (sign.error) {
      setMsg("Fehler beim Signieren: " + sign.error);
      setLoading(false);
      return;
    }

    const putRes = await fetch(sign.signedUrl, {
      method: "PUT",
      headers: { "x-upsert": "true", authorization: `Bearer ${sign.token}` },
      body: file,
    });
    if (!putRes.ok) {
      setMsg("Fehler beim Upload.");
      setLoading(false);
      return;
    }

    setMsg("Verarbeitung gestartet…");
    const procRes = await fetch("/api/process", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        originalPath: sign.path,
        bgMode,
        brandHex: bgMode === "brand" ? brandHex : undefined,
      }),
    });
    const proc = await procRes.json();
    if (proc.error) {
      setMsg("Fehler beim Verarbeiten: " + proc.error);
      setLoading(false);
      return;
    }

    const id = proc.jobId as string | undefined;
    if (!id) {
      setMsg("Job-ID fehlt.");
      setLoading(false);
      return;
    }

    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(async () => {
      const s = await fetch(`/api/status?id=${id}`);
      if (!s.ok) return;
      const st = await s.json();
      if (st.status === "done" && st.downloadUrl) {
        if (pollRef.current) clearInterval(pollRef.current);
        setResultUrl(st.downloadUrl);
        setLoading(false);
        setMsg("Fertig ✅");
      }
    }, 1500);
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-8 space-y-8">
      {/* Header */}
      <header className="text-center space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">ProductPhotoPop</h1>
        <p className="text-muted-foreground">
          Entferne Hintergründe in Sekunden und setze dein Produkt perfekt in
          Szene.
        </p>
      </header>

      {/* Upload Card */}
      <Card>
        <CardHeader>
          <CardTitle>Bild hochladen</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* File Upload */}
          <Label
            htmlFor="file"
            className="flex flex-col items-center justify-center w-full h-40 rounded-lg border border-dashed border-border hover:bg-accent hover:text-accent-foreground cursor-pointer transition-colors"
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

          {/* Einstellungen */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Select
              value={bgMode}
              onValueChange={(val) => setBgMode(val as BgMode)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Hintergrund wählen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="white">Weiß</SelectItem>
                <SelectItem value="brand">Markenfarbe</SelectItem>
                <SelectItem value="transparent">Transparent</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2 border rounded-md px-3 py-2">
              <input
                type="color"
                value={brandHex}
                onChange={(e) => setBrandHex(e.target.value)}
                disabled={bgMode !== "brand"}
                className="h-6 w-6 cursor-pointer disabled:opacity-40"
              />
              <Input
                value={brandHex}
                onChange={(e) => setBrandHex(e.target.value)}
                disabled={bgMode !== "brand"}
                className="w-20"
              />
            </div>

            <Button onClick={startProcess} disabled={loading || !file}>
              {loading ? "Verarbeite…" : "Jetzt optimieren"}
            </Button>
          </div>

          {msg && <p className="text-sm text-muted-foreground">{msg}</p>}
        </CardContent>
      </Card>

      {/* Preview */}
      {(originalPreview || resultUrl) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {originalPreview && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm text-muted-foreground">
                  Original
                </CardTitle>
              </CardHeader>
              <CardContent>
                <img
                  src={originalPreview}
                  alt="Original"
                  className="rounded-lg"
                />
              </CardContent>
            </Card>
          )}
          {resultUrl && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm text-muted-foreground">
                  Ergebnis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <img src={resultUrl} alt="Ergebnis" className="rounded-lg" />
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

      {/* Footer */}
      <footer className="text-center text-xs text-muted-foreground">
        DSGVO-freundlich • In wenigen Sekunden fertig • Für Shopify, Amazon &
        Co.
      </footer>
    </main>
  );
}
