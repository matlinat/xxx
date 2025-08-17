// app/api/process/route.ts
import { NextRequest, NextResponse } from "next/server";
import Replicate from "replicate";
import sharp from "sharp";
import {
  supabaseAdmin,
  SUPA_BUCKET_ORIG,
  SUPA_BUCKET_PROC,
} from "@/lib/supabase/admin";

export const runtime = "nodejs"; // Sharp benötigt Node-Runtime

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN!,
});

// Rembg-Version (via ENV überschreibbar)
const MODEL_VERSION =
  process.env.REPLICATE_BG_VERSION ||
  "cjwbw/rembg:fb8af171cfa1616ddcf1242c093f9c46bcada5ad4cf6f2fbe8b81b330ec5c003";

// ===== Helpers =====
async function fetchBuffer(url: string): Promise<Buffer> {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`download failed: ${r.status}`);
  return Buffer.from(await r.arrayBuffer());
}

function extractUrl(output: any): string {
  if (!output) throw new Error("Empty Replicate output");
  if (typeof output === "string") return output;
  if (Array.isArray(output) && typeof output[0] === "string") return output[0];
  if (output && typeof output.url === "function") return output.url();
  if (output && typeof output.url === "string") return output.url;
  if (output?.files && typeof output.files[0] === "string") return output.files[0];
  throw new Error("Unexpected Replicate output format");
}

// Alphakante sanft – ohne premultiply/unpremultiply
async function featherAlpha(cutout: Buffer, sigma = 0.35): Promise<Buffer> {
  const withAlpha = await sharp(cutout).ensureAlpha().png().toBuffer();
  const alpha = await sharp(withAlpha).extractChannel("alpha").blur(sigma).toBuffer();
  const rgb = await sharp(withAlpha).removeAlpha().toBuffer();
  return sharp(rgb).joinChannel(alpha).png().toBuffer();
}

type PresetId =
  | "amazon_main"
  | "shopify_pdp"
  | "etsy_listing"
  | "transparent_packshot"
  | "web_optimized";

type Preset = {
  id: PresetId;
  label: string;
  width: number;
  height: number;
  background: "white" | "transparent";
  fill: number; // Anteil der kürzeren Zielkante
  format: "jpeg" | "png" | "webp";
  quality?: number;
};

const PRESETS: Preset[] = [
  { id: "amazon_main", label: "Amazon Main", width: 2000, height: 2000, background: "white", fill: 0.88, format: "jpeg", quality: 85 },
  { id: "shopify_pdp", label: "Shopify PDP", width: 2048, height: 2048, background: "white", fill: 0.85, format: "jpeg", quality: 85 },
  { id: "etsy_listing", label: "Etsy Listing", width: 3000, height: 2250, background: "white", fill: 0.82, format: "jpeg", quality: 85 },
  { id: "transparent_packshot", label: "Transparent Packshot", width: 1600, height: 1600, background: "transparent", fill: 0.9, format: "png" },
  { id: "web_optimized", label: "Web Optimized", width: 1600, height: 1600, background: "white", fill: 0.85, format: "webp", quality: 80 },
];

async function softShadowFromAlpha(cutout: Buffer, scale = 0.94, blurSigma = 16): Promise<Buffer> {
  const meta = await sharp(cutout).metadata();
  const w = meta.width ?? 1;
  const h = meta.height ?? 1;
  const resized = await sharp(cutout)
    .ensureAlpha()
    .resize({ width: Math.round(w * scale), height: Math.round(h * scale), fit: "inside", withoutEnlargement: true })
    .png()
    .toBuffer();
  return sharp(resized).extractChannel("alpha").toColourspace("b-w").blur(blurSigma).png().toBuffer();
}

async function composePreset(cutout: Buffer, preset: Preset): Promise<Buffer> {
  const targetW = preset.width;
  const targetH = preset.height;
  const shortTarget = Math.min(targetW, targetH);
  const objectMax = Math.round(shortTarget * preset.fill);

  const fgResized = await sharp(cutout)
    .toColorspace("srgb")
    .resize({ width: objectMax, height: objectMax, fit: "inside", withoutEnlargement: false })
    .png()
    .toBuffer();

  const bg =
    preset.background === "white"
      ? { r: 255, g: 255, b: 255, alpha: 1 }
      : { r: 0, g: 0, b: 0, alpha: 0 };

  const base = sharp({ create: { width: targetW, height: targetH, channels: 4, background: bg } }).png();

  const overlays: sharp.OverlayOptions[] = [];
  if (preset.background === "white") {
    const shadow = await softShadowFromAlpha(fgResized, 0.94, 16);
    overlays.push({ input: shadow, gravity: "center", blend: "multiply" });
  }
  overlays.push({ input: fgResized, gravity: "center" });

  const composed = await base.composite(overlays).toBuffer();

  if (preset.format === "png") return sharp(composed).png().toBuffer();
  if (preset.format === "jpeg")
    return sharp(composed).flatten({ background: "#ffffff" }).jpeg({ quality: preset.quality ?? 85 }).toBuffer();
  return sharp(composed).flatten({ background: "#ffffff" }).webp({ quality: preset.quality ?? 80 }).toBuffer();
}

export async function POST(req: NextRequest) {
  try {
    const { originalPath, userId, bgMode } = await req.json();
    if (!originalPath) {
      return NextResponse.json({ error: "originalPath required" }, { status: 400 });
    }
    if (!process.env.REPLICATE_API_TOKEN) {
      return NextResponse.json({ error: "Missing REPLICATE_API_TOKEN" }, { status: 500 });
    }

    // 0) Job anlegen
    const { data: job, error: jobErr } = await supabaseAdmin
      .from("ppp_jobs")
      .insert([{ user_id: userId ?? null, original_path: originalPath, status: "processing" }])
      .select()
      .single();
    if (jobErr) throw jobErr;

    // 1) signierte URL fürs Original
    const { data: signed, error: signErr } = await supabaseAdmin
      .storage.from(SUPA_BUCKET_ORIG)
      .createSignedUrl(originalPath, 60 * 10);
    if (signErr) throw signErr;

    // 2) Replicate (Freistellen)
    const rmOut: any = await replicate.run(MODEL_VERSION as any, { input: { image: signed.signedUrl } });
    const rmUrl = extractUrl(rmOut);
    let cutout = await fetchBuffer(rmUrl);

    // 3) Alpha-Kante sanft
    cutout = await featherAlpha(cutout, 0.35);

    // 4) Presets wählen anhand bgMode
    const chosenPresets =
      bgMode === "transparent"
        ? PRESETS.filter((p) => p.background === "transparent")
        : PRESETS.filter((p) => p.background !== "transparent");

    const results: { presetId: PresetId; processedPath: string }[] = [];
    const downloadUrlsByPreset: Record<string, string> = {};

    // 5) Rendern, speichern, sofort signieren
    for (const preset of chosenPresets) {
      const rendered = await composePreset(cutout, preset);
      const ext = preset.format === "png" ? "png" : preset.format === "jpeg" ? "jpg" : "webp";
      const processedPath = `${userId ?? "anon"}/${job.id}_${preset.id}.${ext}`;

      const { error: upErr } = await supabaseAdmin.storage
        .from(SUPA_BUCKET_PROC)
        .upload(processedPath, rendered, {
          contentType:
            preset.format === "png"
              ? "image/png"
              : preset.format === "jpeg"
              ? "image/jpeg"
              : "image/webp",
          upsert: true,
        });
      if (upErr) throw upErr;

      // sofort signieren, damit Frontend nicht warten muss
      const { data: signedDl } = await supabaseAdmin.storage
        .from(SUPA_BUCKET_PROC)
        .createSignedUrl(processedPath, 60 * 10);

      if (signedDl?.signedUrl) {
        downloadUrlsByPreset[preset.id] = signedDl.signedUrl;
      }
      results.push({ presetId: preset.id, processedPath });
    }

    // 6) DB-Update (best effort, mit Fallback ohne meta)
    try {
      const { error: updErr } = await supabaseAdmin
        .from("ppp_jobs")
        .update({
          status: "done",
          processed_path: results[0]?.processedPath ?? null,
          meta: { presets: results },
        })
        .eq("id", job.id);
      if (updErr) throw updErr;
    } catch (e) {
      console.error("[/api/process] update with meta failed, trying fallback:", (e as any)?.message);
      const { error: updErr2 } = await supabaseAdmin
        .from("ppp_jobs")
        .update({
          status: "done",
          processed_path: results[0]?.processedPath ?? null,
        })
        .eq("id", job.id);
      if (updErr2) console.error("[/api/process] fallback update failed:", updErr2.message);
    }

    // 7) Sofort-Response mit Download-URLs (verhindert „Hängenbleiben“)
    return NextResponse.json(
      {
        jobId: job.id,
        processed: results,
        processedPath: results[0]?.processedPath ?? null,
        downloadUrlsByPreset, // NEU
      },
      { status: 200 }
    );
  } catch (e: any) {
    console.error("[/api/process]", e?.message || e);
    return NextResponse.json({ error: e?.message ?? "processing failed" }, { status: 500 });
  }
}
