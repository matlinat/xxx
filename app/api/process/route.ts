// app/api/process/route.ts
import { NextRequest, NextResponse } from "next/server";
import Replicate from "replicate";
import sharp from "sharp";
import {
  supabaseAdmin,
  SUPA_BUCKET_ORIG,
  SUPA_BUCKET_PROC,
} from "@/lib/supabase";

// ---- Replicate Setup ----
type ModelSlug = `${string}/${string}` | `${string}/${string}:${string}`;

const DEFAULT_MODEL: ModelSlug = "851-labs/background-remover:latest";
const FALLBACK_MODEL: ModelSlug = "lucataco/remove-bg:latest";

const envModel = process.env.REPLICATE_BG_MODEL;
const PRIMARY_MODEL: ModelSlug =
  envModel && /.+\/.+/.test(envModel) ? (envModel as ModelSlug) : DEFAULT_MODEL;

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN!,
});

// ---- Helpers ----

// URL -> Uint8Array (vermeidet Buffer-Generics-Konflikte in TS/Node 20+)
async function downloadToBytes(url: string): Promise<Uint8Array> {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`Download failed: ${r.status}`);
  const ab = await r.arrayBuffer();
  return new Uint8Array(ab);
}

// Beliebige Bytes sicher in Node-Buffer wandeln
function toBuffer(bytes: Uint8Array | ArrayBuffer | Buffer): Buffer {
  return Buffer.isBuffer(bytes)
    ? bytes
    : Buffer.from(bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes));
}

// PNG mit Transparenz auf farbigen Hintergrund setzen
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

// Replicate aufrufen (mit Fallback)
async function runBackgroundRemoval(imageUrl: string): Promise<string> {
  try {
    const res: any = await replicate.run(PRIMARY_MODEL, {
      input: { image: imageUrl },
    });
    const url = Array.isArray(res) ? res[0] : res;
    if (!url || typeof url !== "string")
      throw new Error("Unexpected Replicate output");
    return url;
  } catch (err) {
    console.warn(
      `[Replicate] Primary model failed (${PRIMARY_MODEL}), trying fallback...`,
    );
    const res: any = await replicate.run(FALLBACK_MODEL, {
      input: { image: imageUrl },
    });
    const url = Array.isArray(res) ? res[0] : res;
    if (!url || typeof url !== "string")
      throw new Error("Unexpected Replicate fallback output");
    return url;
  }
}

// ---- API Route ----
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

    // 1) Signierte URL fürs Original
    const { data: signed, error: signErr } = await supabaseAdmin.storage
      .from(SUPA_BUCKET_ORIG)
      .createSignedUrl(originalPath, 60 * 10);
    if (signErr) throw signErr;

    // 2) Job anlegen
    const { data: job, error: jobErr } = await supabaseAdmin
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

    // 3) Hintergrund entfernen (Replicate, mit Fallback)
    const cutoutUrl = await runBackgroundRemoval(signed.signedUrl);

    // 4) Ergebnis laden
    const cutoutBytes = await downloadToBytes(cutoutUrl);

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
    // bgMode === "transparent": freigestelltes PNG unverändert lassen

    // 6) Speichern
    const processedPath = `${userId ?? "anon"}/${job.id}.png`;
    const { error: upErr } = await supabaseAdmin.storage
      .from(SUPA_BUCKET_PROC)
      .upload(processedPath, finalBytes as any, {
        contentType: "image/png",
        upsert: true,
      });
    if (upErr) throw upErr;

    // 7) Job updaten
    await supabaseAdmin
      .from("ppp_jobs")
      .update({ status: "done", processed_path: processedPath })
      .eq("id", job.id);

    return NextResponse.json({ jobId: job.id, processedPath });
  } catch (e: any) {
    console.error("[process]", e?.message || e);
    return NextResponse.json(
      { error: e?.message ?? "Processing failed" },
      { status: 500 },
    );
  }
}
