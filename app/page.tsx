"use client";

import { useEffect, useRef, useState } from "react";

type BgMode = "transparent" | "white" | "brand";

export default function Page() {
  const [file, setFile] = useState<File | null>(null);
  const [bgMode, setBgMode] = useState<BgMode>("white");
  const [brandHex, setBrandHex] = useState<string>("#ffffff");
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string>("");
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
    const reader = new FileReader();
    reader.onload = () => setOriginalPreview(reader.result as string);
    reader.readAsDataURL(f);
  }

  async function startProcess() {
    if (!file) {
      setMsg("Bitte zuerst ein Bild wählen.");
      return;
    }
    setLoading(true);
    setMsg("Upload…");
    setResultUrl(null);

    // 1) signed upload holen
    const signRes = await fetch("/api/sign-upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filename: file.name }),
    });
    const signJson = await signRes.json();
    if (signJson.error) {
      setMsg("Fehler beim Signieren: " + signJson.error);
      setLoading(false);
      return;
    }

    const putRes = await fetch(signJson.signedUrl, {
      method: "PUT",
      headers: {
        "x-upsert": "true",
        authorization: `Bearer ${signJson.token}`,
      },
      body: file,
    });
    if (!putRes.ok) {
      setMsg("Fehler beim Upload.");
      setLoading(false);
      return;
    }

    // 2) Prozess starten
    setMsg("Verarbeitung gestartet…");
    const procRes = await fetch("/api/process", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        originalPath: signJson.path,
        bgMode,
        brandHex: bgMode === "brand" ? brandHex : undefined,
      }),
    });
    const procJson = await procRes.json();
    if (procJson.error) {
      setMsg("Fehler beim Verarbeiten: " + procJson.error);
      setLoading(false);
      return;
    }

    const id = procJson.jobId as string | undefined;
    if (!id) {
      // falls deine aktuelle process-Route schon processedPath zurückgibt:
      if (procJson.processedPath) {
        setMsg("Fertig ✅");
        // signierte Download-URL über /api/status holen (optional)
        const s = await fetch(`/api/status?id=${procJson.jobId}`).then((r) =>
          r.json(),
        );
        setResultUrl(s.downloadUrl ?? null);
        setLoading(false);
        return;
      }
      setMsg("Job-ID fehlt.");
      setLoading(false);
      return;
    }

    setJobId(id);

    // 3) Status pollen
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(async () => {
      const s = await fetch(`/api/status?id=${id}`);
      if (!s.ok) return; // 404/500 kurz ignorieren
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
    <main className="mx-auto max-w-screen-sm px-4 py-6 sm:py-10">
      {/* Header */}
      <header className="mb-6 text-center">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          ProductPhotoPop
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          Lade ein Produktfoto hoch, entferne den Hintergrund & setze es auf
          Weiß oder deine Markenfarbe.
        </p>
      </header>

      {/* Upload Card */}
      <section
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
          "rounded-2xl border p-4 sm:p-6 transition",
          isDragging
            ? "border-blue-500 bg-blue-50"
            : "border-gray-200 bg-white",
        ].join(" ")}
      >
        <div className="flex flex-col gap-4">
          <label
            htmlFor="file"
            className="flex w-full cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 p-6 text-center hover:bg-gray-50"
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

          {/* Optionen */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <select
              value={bgMode}
              onChange={(e) => setBgMode(e.target.value as BgMode)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="white">Hintergrund: Weiß</option>
              <option value="brand">Hintergrund: Markenfarbe</option>
              <option value="transparent">Hintergrund: Transparent</option>
            </select>

            <div className="flex items-center gap-3 rounded-lg border border-gray-300 px-3 py-2">
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
              />
            </div>

            <button
              onClick={startProcess}
              disabled={loading || !file}
              className="h-10 rounded-lg bg-black text-white text-sm font-medium disabled:opacity-40"
            >
              {loading ? "Verarbeite…" : "Jetzt optimieren"}
            </button>
          </div>

          {/* Status */}
          {msg && <p className="text-sm text-gray-700">{msg}</p>}

          {/* Previews */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {originalPreview && (
              <figure className="rounded-xl border border-gray-200 p-3">
                <figcaption className="mb-2 text-xs text-gray-500">
                  Original
                </figcaption>
                <img
                  src={originalPreview}
                  alt="Original"
                  className="w-full rounded-lg object-contain"
                />
              </figure>
            )}
            {resultUrl && (
              <figure className="rounded-xl border border-gray-200 p-3">
                <figcaption className="mb-2 text-xs text-gray-500">
                  Ergebnis
                </figcaption>
                <img
                  src={resultUrl}
                  alt="Ergebnis"
                  className="w-full rounded-lg object-contain"
                />
                <a
                  className="mt-3 inline-block text-sm font-medium text-blue-600 underline"
                  href={resultUrl}
                  download
                >
                  Ergebnis herunterladen
                </a>
              </figure>
            )}
          </div>
        </div>
      </section>

      {/* Trust / CTA unten – mobil sichtbar, Desktop dezent */}
      <footer className="mt-8 text-center text-xs text-gray-500">
        DSGVO-freundlich • In wenigen Sekunden fertig • Für Shopify, Amazon &
        Co.
      </footer>
    </main>
  );
}
