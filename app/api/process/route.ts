// app/api/process/route.ts
import { NextRequest, NextResponse } from "next/server";
import Replicate from "replicate";
import sharp from "sharp";
import {
  supabaseAdmin,
  SUPA_BUCKET_ORIG,
  SUPA_BUCKET_PROC,
} from "@/lib/supabase";

/** ----------------------------------------------------------------
 *  Replicate: Modelle, Typen & Fallbacks
 *  ---------------------------------------------------------------- */
type ModelSlug = `${string}/${string}` | `${string}/${string}:${string}`;

// Reihenfolge: ENV (falls gesetzt) → bewährte öffentliche Modelle
const PRIMARY_CHAIN: ModelSlug[] = [
  (process.env.REPLICATE_BG_MODEL?.trim().replace(
    /\s*:\s*/,
    ":",
  ) as ModelSlug) || ("851-labs/background-remover:latest" as const),
  "lucataco/remove-bg:latest",
  "cjwbw/rembg:latest",
];

const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN! });

/** ----------------------------------------------------------------
 *  Utilities
 *  ---------------------------------------------------------------- */
async function supabaseSignedUrl(path: string, minutes = 10): Promise<string> {
  const { data, error } = await supabaseAdmin.storage
    .from(SUPA_BUCKET_ORIG)
    .createSignedUrl(path, 60 * minutes);
  if (error) throw error;
  return data!.signedUrl;
}

async function fetchBytes(url: string): Promise<Uint8Array> {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`Download failed: ${r.status}`);
  const ab = await r.arrayBuffer();
  return new Uint8Array(ab);
}

function toBuffer(bytes: Uint8Array | ArrayBuffer | Buffer): Buffer {
  return Buffer.isBuffer(bytes)
    ? bytes
    : Buffer.from(bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes));
}

/** ✅ FIX: Uint8Array → gültiger Blob ohne SharedArrayBuffer-Typen
 *   Wir geben eine **View** (Uint8Array) an Blob weiter.
 *   Falls die View nicht den vollen Buffer abdeckt, nehmen wir bytes.slice(),
 *   damit der Blob eine saubere contiguous-View bekommt.
 */
function toBlob(bytes: Uint8Array, mime = "image/png"): Blob {
  const view =
    bytes.byteOffset === 0 && bytes.byteLength === bytes.buffer.byteLength
      ? bytes
      : bytes.slice(0); // neue Uint8Array-View, vermeidet SharedArrayBuffer-Typunion
  return new Blob([view], { type: mime });
}

async function compositeOnColor(
  foreground: Uint8Array | ArrayBuffer | Buffer,
  hex = "#FFFFFF",
  padding = 40,
): Promise<Uint8Array> {
  const fgBuf = toBuffer(foreground);
  const fg = sharp(fgBuf);
  const meta = await fg.metadata();
  const width = (meta.width ?? 1000) + padding * 2;
  const height = (meta.height ?? 1000) + padding * 2;

  const bg = await sharp({
    create: { width, height, channels: 3, background: hex },
  })
    .png()
    .toBuffer();

  const out = await sharp(bg)
    .composite([{ input: await fg.png().toBuffer(), gravity: "center" }])
    .png()
    .toBuffer();

  return new Uint8Array(out.buffer, out.byteOffset, out.byteLength);
}

function normalizeOutput(output: any): string {
  if (typeof output === "string") return output;
  if (Array.isArray(output) && output.length) {
    const first = output[0];
    if (typeof first === "string") return first;
    if (first && typeof first === "object") {
      if (typeof first.image === "string") return first.image;
      if (typeof first.output === "string") return first.output;
      if (Array.isArray(first.data) && typeof first.data[0] === "string")
        return first.data[0];
    }
  }
  if (output && typeof output === "object") {
    if (typeof output.image === "string") return output.image;
    if (typeof output.output === "string") return output.output;
    if (Array.isArray(output.data) && typeof output.data[0] === "string")
      return output.data[0];
    for (const k of Object.keys(output)) {
      const v = (output as any)[k];
      if (typeof v === "string" && /^https?:\/\//.test(v)) return v;
    }
  }
  throw new Error("Unexpected Replicate output");
}

// Replicate mit Blob-Input: stabiler als URL (umgeht 422 von signierten URLs)
async function runReplicateWithBlob(imageBytes: Uint8Array): Promise<string> {
  const blob = toBlob(imageBytes, "image/png");

  let lastErr: unknown = null;
  for (const raw of PRIMARY_CHAIN) {
    if (!raw || !/.+\/.+/.test(raw)) continue;
    const slug = raw as ModelSlug;
    try {
      const out: any = await replicate.run(slug, { input: { image: blob } });
      const url = normalizeOutput(out);
      return url;
    } catch (e: any) {
      lastErr = e;
      const msg = String(e?.message || e);
      console.warn(`[Replicate] Failed for ${slug}: ${msg}`);

      // Bei Version-/Permission-Fehler → gleiches Modell mit :latest probieren
      if (
        msg.includes("Invalid version") ||
        msg.includes("not permitted") ||
        msg.includes("422")
      ) {
        const [owner, rest] = slug.split("/") as [string, string];
        const model = rest.split(":")[0];
        const latest = `${owner}/${model}:latest` as ModelSlug;
        if (latest !== slug) {
          try {
            console.warn(`[Replicate] Retrying with ${latest} …`);
            const out2: any = await replicate.run(latest, {
              input: { image: blob },
            });
            const url = normalizeOutput(out2);
            return url;
          } catch (e2: any) {
            lastErr = e2;
            console.warn(
              `[Replicate] Latest retry failed (${latest}): ${String(e2?.message || e2)}`,
            );
          }
        }
      }
      // sonst → nächstes Modell in der Kette
    }
  }
  throw lastErr ?? new Error("All models failed");
}

/** ----------------------------------------------------------------
 *  API Route
 *  ---------------------------------------------------------------- */
export async function POST(req: NextRequest) {
  try {
    const {
      originalPath,
      bgMode = "white",
      brandHex,
      userId,
    } = await req.json();

    if (!originalPath) {
      return NextResponse.json(
        { error: "originalPath required" },
        { status: 400 },
      );
    }
    if (!process.env.REPLICATE_API_TOKEN) {
      return NextResponse.json(
        { error: "Missing REPLICATE_API_TOKEN" },
        { status: 500 },
      );
    }

    // 1) Original als Bytes holen
    const signedUrl = await supabaseSignedUrl(originalPath, 10);
    const imageBytes = await fetchBytes(signedUrl);

    // 2) (Optional) nach PNG normalisieren (robuster für die meisten Modelle)
    const pngBytes = new Uint8Array(
      await sharp(toBuffer(imageBytes)).png().toBuffer(),
    );

    // 3) Hintergrund entfernen (Blob-Input)
    const cutoutUrl = await runReplicateWithBlob(pngBytes);

    // 4) Ergebnis holen
    const cutoutBytes = await fetchBytes(cutoutUrl);

    // 5) Optional: Hintergrund setzen
    let finalBytes = cutoutBytes;
    if (bgMode === "white") {
      finalBytes = await compositeOnColor(cutoutBytes, "#FFFFFF");
    } else if (
      bgMode === "brand" &&
      typeof brandHex === "string" &&
      brandHex.trim()
    ) {
      finalBytes = await compositeOnColor(cutoutBytes, brandHex.trim());
    }
    // "transparent": direkt speichern

    // 6) Job anlegen & Ergebnis speichern
    const { data: jobRow, error: jobErr } = await supabaseAdmin
      .from("ppp_jobs")
      .insert([
        {
          user_id: userId ?? null,
          original_path: originalPath,
          bg_mode: bgMode,
          brand_hex: brandHex ?? null,
          status: "processing",
        },
      ])
      .select()
      .single();
    if (jobErr) throw jobErr;

    const processedPath = `${userId ?? "anon"}/${jobRow.id}.png`;
    const { error: upErr } = await supabaseAdmin.storage
      .from(SUPA_BUCKET_PROC)
      .upload(processedPath, finalBytes as any, {
        contentType: "image/png",
        upsert: true,
      });
    if (upErr) throw upErr;

    await supabaseAdmin
      .from("ppp_jobs")
      .update({ status: "done", processed_path: processedPath })
      .eq("id", jobRow.id);

    return NextResponse.json({ jobId: jobRow.id, processedPath });
  } catch (e: any) {
    console.error("[process]", e?.message || e);
    return NextResponse.json(
      {
        error:
          e?.message ??
          "Processing failed (check Replicate token, model permissions, and try again).",
      },
      { status: 500 },
    );
  }
}
