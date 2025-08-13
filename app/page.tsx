"use client";
import { useState } from "react";

async function uploadFile(file: File) {
  const res = await fetch("/api/sign-upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ filename: file.name }),
  });
  const { signedUrl, token, path, error } = await res.json();
  if (error) throw new Error(error);
  const putRes = await fetch(signedUrl, {
    method: "PUT",
    headers: { "x-upsert": "true", authorization: `Bearer ${token}` },
    body: file,
  });
  if (!putRes.ok) throw new Error("Upload failed");
  return { path };
}

export default function Page() {
  const [file, setFile] = useState<File | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const startProcess = async () => {
    if (!file) return setMsg("Bitte zuerst ein Bild wählen.");
    setLoading(true);
    setMsg("Upload…");
    try {
      const { path } = await uploadFile(file);
      setMsg("Verarbeitung gestartet…");
      const r = await fetch("/api/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ originalPath: path, bgMode: "white" }),
      });
      const j = await r.json();
      if (j.error) throw new Error(j.error);
      setJobId(j.jobId);

      const iv = setInterval(async () => {
        const s = await fetch(`/api/status?id=${j.jobId}`);
        const st = await s.json();
        if (st.status === "done" && st.downloadUrl) {
          clearInterval(iv);
          setResultUrl(st.downloadUrl);
          setLoading(false);
          setMsg("Fertig ✅");
        }
      }, 1500);
    } catch (e: any) {
      setMsg("Fehler: " + e.message);
      setLoading(false);
    }
  };

  return (
    <main style={{ maxWidth: 640, margin: "0 auto" }}>
      <h1>ProductPhotoPop (MVP)</h1>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
      />
      <button
        style={{ marginLeft: 8 }}
        onClick={startProcess}
        disabled={loading}
      >
        Jetzt optimieren
      </button>
      <p>{msg}</p>
      {resultUrl && (
        <div style={{ marginTop: 16 }}>
          <a href={resultUrl} download>
            Ergebnis herunterladen
          </a>
          <div>
            <img
              src={resultUrl}
              alt="result"
              style={{ maxWidth: "100%", marginTop: 8 }}
            />
          </div>
        </div>
      )}
    </main>
  );
}
