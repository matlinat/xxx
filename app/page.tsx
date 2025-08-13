"use client";

import { useState } from "react";

export default function Page() {
  const [file, setFile] = useState<File | null>(null);
  const [msg, setMsg] = useState("");

  return (
    <main style={{ maxWidth: 600, margin: "0 auto" }}>
      <h1>ProductPhotoPop</h1>
      <p>Zieh eine Datei hierher oder wähle sie aus.</p>

      <input
        type="file"
        accept="image/*"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
      />

      <button
        style={{ marginTop: 12 }}
        onClick={async () => {
          if (!file) return setMsg("Bitte zuerst ein Bild wählen.");
          setMsg("Alles bereit. (Hier später: sign-upload → process → status)");
        }}
      >
        Testen
      </button>

      <p style={{ marginTop: 12 }}>{msg}</p>
    </main>
  );
}
