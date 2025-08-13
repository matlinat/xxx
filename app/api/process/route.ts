// app/api/process/route.ts
import { NextRequest, NextResponse } from "next/server";
import Replicate from "replicate";
import sharp from "sharp";
import {
  supabaseAdmin,
  SUPA_BUCKET_ORIG,
  SUPA_BUCKET_PROC,
} from "@/lib/supabase";

// --- Replicate Model-Typen & Slugs ---
type ModelSlug = `${string}/${string}` | `${string}/${string}:${string}`;

// Empfohlen von Replicate:
const DEFAULT_MODEL: ModelSlug = "851-labs/background-remover:latest";
const FALLBACK_MODEL: ModelSlug = "lucataco/remove-bg:latest";

// Env-Override nur akzeptieren, wenn Format passt
const envModel = process.env.REPLICATE_BG_MODEL;
const PRIMARY_MODEL: ModelSlug =
  envModel && /.+\/.+/.test(envModel) ? (envModel as ModelSlug) : DEFAULT_MODEL;

const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN! });

// ---- Helpers ----
async function downloadToBytes(url: string): Promise<Uint8Array> {
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
  const url = Array.isArray(output) ? output[0] : output;
  if (!url || typeof url !== "string")
    throw new Error("Unexpected Replicate output");
  return url;
}

async function runBackgroundRemoval(imageUrl: string): Promise<string> {
  try {
    const res: any = await replicate.run(PRIMARY_MODEL, {
      input: { image: imageUrl },
    });
    return normalizeOutput(res);
  } catch (err: any) {
    // Explizite 422-Fehlermeldung lesbar machen
    const msg = String(err?.message || err);
    if (
      msg.includes("Invalid version") ||
      msg.includes("not permitted") ||
      msg.includes("422")
    ) {
      console.warn(
        `[Replicate] Primary failed (${PRIMARY_MODEL}): ${msg}. Trying fallback…`,
      );
    } else {
      console.warn(`[Replicate] Primary failed: ${msg}. Trying fallback…`);
    }
    const res2: any = await replicate.run(FALLBACK_MODEL, {
      input: { image: imageUrl },
    });
    return normalizeOutput(res2);
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

    // 1) Signierte URL fürs Original (Replicate braucht öffentlich erreichbare URL)
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

    // 3) Hintergrund entfernen (mit Fallback)
    const cutoutUrl = await runBackgroundRemoval(signed.signedUrl);

    // 4) Ergebnis holen
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
    // "transparent": direkt speichern

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
      {
        error:
          e?.message ??
          "Processing failed (check Replicate billing & model slug)",
      },
      { status: 500 },
    );
  }
}
