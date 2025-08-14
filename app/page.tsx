"use client";

import * as React from "react";
import styles from "./page.module.css";

type BgMode = "transparent" | "white" | "brand";

const isHexColor = (v: string) => /^#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})$/.test(v);

export default function Page() {
  const [file, setFile] = React.useState<File | null>(null);
  const [bgMode, setBgMode] = React.useState<BgMode>("white");
  const [brandHex, setBrandHex] = React.useState("#ffffff");
  const [loading, setLoading] = React.useState(false);
  const [msg, setMsg] = React.useState("");
  const [resultUrl, setResultUrl] = React.useState<string | null>(null);
  const [originalPreview, setOriginalPreview] = React.useState<string | null>(
    null,
  );
  const pollRef = React.useRef<ReturnType<typeof setInterval> | null>(null);

  React.useEffect(() => {
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
    if (!file) {
      setMsg("Bitte zuerst ein Bild wählen.");
      return;
    }
    if (bgMode === "brand" && !isHexColor(brandHex)) {
      setMsg("Bitte eine gültige HEX-Farbe angeben (z. B. #ff6600).");
      return;
    }

    setLoading(true);
    setMsg("Upload…");

    try {
      const signRes = await fetch("/api/sign-upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: file.name }),
      });
      const sign: {
        error?: string;
        signedUrl?: string;
        token?: string;
        path?: string;
      } = await signRes.json();
      if (sign.error || !sign.signedUrl || !sign.token || !sign.path)
        throw new Error(sign.error ?? "Signierung fehlgeschlagen.");

      const putRes = await fetch(sign.signedUrl, {
        method: "PUT",
        headers: { "x-upsert": "true", authorization: `Bearer ${sign.token}` },
        body: file,
      });
      if (!putRes.ok) throw new Error("Fehler beim Upload.");

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
      const proc: { error?: string; jobId?: string } = await procRes.json();
      if (proc.error || !proc.jobId)
        throw new Error(proc.error ?? "Job-ID fehlt.");

      if (pollRef.current) clearInterval(pollRef.current);
      pollRef.current = setInterval(async () => {
        try {
          const s = await fetch(`/api/status?id=${proc.jobId}`);
          if (!s.ok) return;
          const st: { status?: string; downloadUrl?: string } = await s.json();
          if (st.status === "done" && st.downloadUrl) {
            if (pollRef.current) clearInterval(pollRef.current);
            setResultUrl(st.downloadUrl);
            setLoading(false);
            setMsg("Fertig ✅");
          }
        } catch {
          /* weiterpolling */
        }
      }, 1500);
    } catch (e) {
      const err = e instanceof Error ? e.message : "Unbekannter Fehler.";
      setMsg("Fehler: " + err);
      setLoading(false);
    }
  }

  return (
    <main className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <h1 className={styles.title}>ProductPhotoPop</h1>
        <p className={styles.sub}>
          Entferne Hintergründe in Sekunden und setze dein Produkt perfekt in
          Szene.
        </p>
      </header>

      {/* Upload Card */}
      <section className={styles.card}>
        <div className={styles.cardHeader}>
          <div className={styles.cardTitle}>Bild hochladen</div>
        </div>
        <div className={styles.cardBody}>
          <label htmlFor="file" className={styles.uploadZone}>
            <span>Datei hier ablegen oder klicken</span>
            <input
              id="file"
              type="file"
              accept="image/*"
              className={styles.hiddenInput}
              onChange={(e) => onFilesSelected(e.target.files)}
            />
          </label>

          <div style={{ height: ".75rem" }} />

          <div className={styles.controls}>
            <select
              className={styles.select}
              value={bgMode}
              onChange={(e) => setBgMode(e.target.value as BgMode)}
              aria-label="Hintergrund wählen"
            >
              <option value="white">Weiß</option>
              <option value="brand">Markenfarbe</option>
              <option value="transparent">Transparent</option>
            </select>

            <div
              className={styles.colorWrap}
              aria-disabled={bgMode !== "brand"}
            >
              <input
                type="color"
                value={brandHex}
                onChange={(e) => setBrandHex(e.target.value)}
                disabled={bgMode !== "brand"}
                className={styles.colorInput}
                aria-label="Markenfarbe wählen"
              />
              <input
                value={brandHex}
                onChange={(e) => setBrandHex(e.target.value)}
                disabled={bgMode !== "brand"}
                className={styles.textInput}
                placeholder="#ffffff"
              />
            </div>

            <button
              className={styles.button}
              onClick={startProcess}
              disabled={loading || !file}
            >
              {loading ? "Verarbeite…" : "Jetzt optimieren"}
            </button>
          </div>

          {msg && (
            <>
              <div style={{ height: ".5rem" }} />
              <p style={{ fontSize: ".875rem", color: "var(--muted)" }}>
                {msg}
              </p>
            </>
          )}
        </div>
      </section>

      {/* Preview */}
      {(originalPreview || resultUrl) && (
        <div className={styles.grid}>
          {originalPreview && (
            <section className={styles.card}>
              <div className={styles.cardHeader}>
                <div className={styles.previewTitle}>Original</div>
              </div>
              <div className={styles.cardBody}>
                <img src={originalPreview} alt="Original" />
              </div>
            </section>
          )}
          {resultUrl && (
            <section className={styles.card}>
              <div className={styles.cardHeader}>
                <div className={styles.previewTitle}>Ergebnis</div>
              </div>
              <div className={styles.cardBody}>
                <img src={resultUrl} alt="Ergebnis" />
                <div style={{ marginTop: ".5rem" }}>
                  <a
                    className={`${styles.button} ${styles.link}`}
                    href={resultUrl}
                    download
                  >
                    Ergebnis herunterladen
                  </a>
                </div>
              </div>
            </section>
          )}
        </div>
      )}

      {/* Footer */}
      <footer className={styles.footer}>
        DSGVO-freundlich • In wenigen Sekunden fertig • Für Shopify, Amazon
        &amp; Co.
      </footer>
    </main>
  );
}
