"use client";

import { useEffect, useRef, useState } from "react";

type BgMode = "transparent" | "white" | "brand";

export default function Page() {
  const [file, setFile] = useState<File | null>(null);
  const [bgMode, setBgMode] = useState<BgMode>("white");
  const [brandHex, setBrandHex] = useState("#ffffff");
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [jobId, setJobId] = useState<string | null>(null);
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
    setResultUrl(null);

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
    setJobId(id);

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
    <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:py-10">
      {/* Header */}
      <header className="mb-8 flex flex-col items-center text-center">
        <span className="inline-flex items-center rounded-full bg-black px-3 py-1 text-xs font-medium text-white">
          Tailwind aktiv ✅
        </span>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
          ProductPhotoPop
        </h1>
        <p className="mt-2 max-w-xl text-sm text-gray-600">
          Lade ein Produktfoto hoch, entferne den Hintergrund & setze es auf
          Weiß oder deine Markenfarbe.
        </p>
      </header>

      {/* Hauptbereich: links Upload/Controls, rechts Previews */}
      <section className="flex flex-col gap-6 lg:flex-row">
        {/* Linke Spalte */}
        <div className="flex w-full flex-col gap-4 lg:max-w-md">
          {/* Dropzone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              onFilesSelected(e.dataTransfer.files);
            }}
            className={[
              "flex min-h-[180px] w-full cursor-pointer flex-col items-center justify-center rounded-2xl border p-6 text-center transition",
              isDragging
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 bg-white hover:bg-gray-50",
            ].join(" ")}
          >
            <label
              htmlFor="file"
              className="flex w-full flex-col items-center justify-center"
            >
              <span className="text-sm font-medium">
                Datei hierher ziehen oder klicken
              </span>
              <span className="mt-1 text-xs text-gray-500">
                PNG, JPG, WebP bis ~20MB
              </span>
              <input
                id="file"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => onFilesSelected(e.target.files)}
              />
            </label>
          </div>

          {/* Controls */}
          <div className="flex w-full flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-4">
            {/* Modus + Farbe + Start-Button */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <select
                value={bgMode}
                onChange={(e) => setBgMode(e.target.value as BgMode)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm sm:max-w-[200px]"
              >
                <option value="white">Hintergrund: Weiß</option>
                <option value="brand">Hintergrund: Markenfarbe</option>
                <option value="transparent">Hintergrund: Transparent</option>
              </select>

              <div className="flex w-full items-center gap-3 rounded-lg border border-gray-300 px-3 py-2 sm:flex-1">
                <input
                  type="color"
                  value={brandHex}
                  onChange={(e) => setBrandHex(e.target.value)}
                  disabled={bgMode !== "brand"}
                  className="h-6 w-6 cursor-pointer disabled:opacity-40"
                  title="Markenfarbe wählen"
                />
                <input
                  type="text"
                  value={brandHex}
                  onChange={(e) => setBrandHex(e.target.value)}
                  disabled={bgMode !== "brand"}
                  className="flex-1 text-sm outline-none disabled:bg-gray-50"
                  placeholder="#ffffff"
                />
              </div>

              <button
                onClick={startProcess}
                disabled={loading || !file}
                className="inline-flex h-10 shrink-0 items-center justify-center rounded-lg bg-black px-4 text-sm font-medium text-white disabled:opacity-40"
              >
                {loading ? "Verarbeite…" : "Jetzt optimieren"}
              </button>
            </div>

            {/* Status-Zeile */}
            {msg && (
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
                <span>{msg}</span>
              </div>
            )}
          </div>
        </div>

        {/* Rechte Spalte: Previews (flex, wrap) */}
        <div className="flex w-full flex-col gap-4">
          <div className="flex flex-wrap gap-4">
            {originalPreview && (
              <figure className="flex min-w-[260px] flex-1 flex-col rounded-2xl border border-gray-200 bg-white p-3">
                <figcaption className="mb-2 text-xs text-gray-500">
                  Original
                </figcaption>
                <div className="flex flex-1 items-center justify-center overflow-hidden rounded-xl">
                  <img
                    src={originalPreview}
                    alt="Original"
                    className="max-h-[360px] w-full object-contain"
                  />
                </div>
              </figure>
            )}

            {resultUrl && (
              <figure className="flex min-w-[260px] flex-1 flex-col rounded-2xl border border-gray-200 bg-white p-3">
                <figcaption className="mb-2 text-xs text-gray-500">
                  Ergebnis
                </figcaption>
                <div className="flex flex-1 items-center justify-center overflow-hidden rounded-xl">
                  <img
                    src={resultUrl}
                    alt="Ergebnis"
                    className="max-h-[360px] w-full object-contain"
                  />
                </div>
                <div className="mt-3">
                  <a
                    className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 underline"
                    href={resultUrl}
                    download
                  >
                    Ergebnis herunterladen
                  </a>
                </div>
              </figure>
            )}
          </div>

          {/* Hinweis-Card */}
          <div className="flex items-center justify-center">
            <div className="flex w-full flex-col items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white p-4 text-center text-xs text-gray-500 sm:flex-row sm:justify-between sm:text-left">
              <span>
                DSGVO-freundlich • In wenigen Sekunden fertig • Für Shopify,
                Amazon & Co.
              </span>
              {jobId && <span className="text-gray-400">Job-ID: {jobId}</span>}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
