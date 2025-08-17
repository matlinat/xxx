// app/api/process/route.ts
import { NextRequest, NextResponse } from "next/server";
import Replicate from "replicate";
import sharp from "sharp";
import {
  supabaseAdmin,
  SUPA_BUCKET_ORIG,
  SUPA_BUCKET_PROC,
} from "@/lib/supabase/admin";

export const runtime = "nodejs";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN!,
});

const MODEL_VERSION =
  process.env.REPLICATE_BG_VERSION ||
  "cjwbw/rembg:fb8af171cfa1616ddcf1242c093f9c46bcada5ad4cf6f2fbe8b81b330ec5c003";

// ---------- Helpers ----------
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

// sRGB + PNG + EXIF-Rotation (immer definiertes Format)
async function normalizeToPNG(input: Buffer): Promise<Buffer> {
  return sharp(input).rotate().toColorspace("srgb").png().toBuffer();
}

// Alpha sanft (alle Stufen explizit als PNG encodieren!)
async function featherAlpha(cutout: Buffer, sigma = 0.35): Promise<Buffer> {
  const withAlphaPng = await sharp(cutout).ensureAlpha().png().toBuffer();
  const alphaPng = await sharp(withAlphaPng).extractChannel("alpha").blur(sigma).png().toBuffer();
  const rgbPng = await sharp(withAlphaPng).removeAlpha().png().toBuffer();
  return sharp(rgbPng).joinChannel(alphaPng).png().toBuffer();
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
  fill: number;
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

// Komposition ohne Schatten (stabil, kein Alpha-Leak)
async function composePreset(cutout: Buffer, preset: Preset): Promise<Buffer> {
  const targetW = preset.width;
  const targetH = preset.height;
  const shortTarget = Math.min(targetW, targetH);
  const objectMax = Math.round(shortTarget * preset.fill);

  // FG immer als PNG (RGBA) skalieren
  const fgRGBA = await sharp(cutout)
    .toColorspace("srgb")
    .resize({ width: objectMax, height: objectMax, fit: "inside", withoutEnlargement: false })
    .png()
    .toBuffer();

  if (preset.background === "white") {
    // Weißes RGB-Canvas (keine Alpha)
    const base = sharp({
      create: { width: targetW, height: targetH, channels: 3, background: "#ffffff" },
    });

    // FG auf Weiß flatten → kein Alpha mehr
    const fgOnWhite = await sharp(fgRGBA).flatten({ background: "#ffffff" }).png().toBuffer();

    const composed = await base.composite([{ input: fgOnWhite, gravity: "center" }]).png().toBuffer();

    // Export
    if (preset.format === "jpeg") return sharp(composed).jpeg({ quality: preset.quality ?? 85 }).toBuffer();
    if (preset.format === "webp") return sharp(composed).webp({ quality: preset.quality ?? 80 }).toBuffer();
    return sharp(composed).png().toBuffer();
  }

  // Transparentes Canvas (RGBA)
  const base = sharp({
    create: { width: targetW, height: targetH, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
  }).png();

  const composed = await base.composite([{ input: fgRGBA, gravity: "center" }]).png().toBuffer();

  if (preset.format === "png") return sharp(composed).png().toBuffer();
  if (preset.format === "jpeg") return sharp(composed).flatten({ background: "#ffffff" }).jpeg({ quality: preset.quality ?? 85 }).toBuffer();
  return sharp(composed).flatten({ background: "#ffffff" }).webp({ quality: preset.quality ?? 80 }).toBuffer();
}

// ---------- Route ----------
export async function POST(req: NextRequest) {
  try {
    const { originalPath, userId, bgMode } = await req.json();
    if (!originalPath) return NextResponse.json({ error: "originalPath required" }, { status: 400 });
    if (!process.env.REPLICATE_API_TOKEN)
      return NextResponse.json({ error: "Missing REPLICATE_API_TOKEN" }, { status: 500 });

    // Job
    const { data: job, error: jobErr } = await supabaseAdmin
      .from("ppp_jobs")
      .insert([{ user_id: userId ?? null, original_path: originalPath, status: "processing" }])
      .select()
      .single();
    if (jobErr) throw jobErr;

    // Original
    const { data: signed, error: signErr } = await supabaseAdmin
      .storage.from(SUPA_BUCKET_ORIG)
      .createSignedUrl(originalPath, 60 * 10);
    if (signErr) throw signErr;

    // Replicate (Freistellen)
    const rmOut: any = await replicate.run(MODEL_VERSION as any, { input: { image: signed.signedUrl } });
    const rmUrl = extractUrl(rmOut);
    let cutout = await fetchBuffer(rmUrl);

    // Sicherheit: immer echte PNG
    cutout = await normalizeToPNG(cutout);

    // Alpha sanft
    cutout = await featherAlpha(cutout, 0.35);

    // Presets nach Auswahl
    const chosenPresets =
      bgMode === "transparent"
        ? PRESETS.filter((p) => p.background === "transparent")
        : PRESETS.filter((p) => p.background !== "transparent");

    const results: { presetId: PresetId; processedPath: string }[] = [];
    const downloadUrlsByPreset: Record<string, string> = {};

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

      const { data: signedDl } = await supabaseAdmin.storage
        .from(SUPA_BUCKET_PROC)
        .createSignedUrl(processedPath, 60 * 10);
      if (signedDl?.signedUrl) downloadUrlsByPreset[preset.id] = signedDl.signedUrl;

      results.push({ presetId: preset.id, processedPath });
    }

    // DB-Update (best effort)
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
      console.error("[process] meta update failed, fallback:", (e as any)?.message);
      await supabaseAdmin
        .from("ppp_jobs")
        .update({ status: "done", processed_path: results[0]?.processedPath ?? null })
        .eq("id", job.id);
    }

    return NextResponse.json(
      { jobId: job.id, processed: results, processedPath: results[0]?.processedPath ?? null, downloadUrlsByPreset },
      { status: 200 }
    );
  } catch (e: any) {
    console.error("[/api/process]", e?.stack || e?.message || e);
    return NextResponse.json({ error: e?.message ?? "processing failed" }, { status: 500 });
  }
}
