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
 *  Replicate: Model-Typen, Normalisierung & Fallback-Strategie
 *  ---------------------------------------------------------------- */
type ModelSlug = `${string}/${string}` | `${string}/${string}:${string}`;

const DEFAULT_MODEL: ModelSlug = "851-labs/background-remover:latest";
const FALLBACK_CHAIN: ModelSlug[] = [
  "lucataco/remove-bg:latest",
  "cjwbw/rembg:latest",
];

// Einige Modelle erwarten unterschiedliche Input-Keys
const INPUT_KEY_BY_MODEL: Array<{ match: RegExp; key: string }> = [
  { match: /^851-labs\/background-remover/i, key: "image" },
  { match: /^lucataco\/remove-bg/i, key: "image" },
  { match: /^cjwbw\/rembg/i, key: "image" },
];

function normalizeModelSlug(raw?: string | null): ModelSlug {
  if (!raw) return DEFAULT_MODEL;
  let s = raw.trim().replace(/\s*:\s*/, ":");
  if (!/^.+\/.+$/.test(s)) return DEFAULT_MODEL;
  if (/:$/.test(s)) s = s + "latest";
  return s as ModelSlug;
}

function modelToLatest(slug: ModelSlug): ModelSlug {
  const [owner, rest] = slug.split("/") as [string, string];
  const model = rest.split(":")[0];
  return `${owner}/${model}:latest` as ModelSlug;
}

function pickInputKey(slug: ModelSlug): string {
  const found = INPUT_KEY_BY_MODEL.find((r) => r.match.test(slug));
  return found ? found.key : "image";
}

const PRIMARY_MODEL: ModelSlug = normalizeModelSlug(
  process.env.REPLICATE_BG_MODEL,
);

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN!,
});

/** ----------------------------------------------------------------
 *  Byte/Buffer Utilities
 *  ---------------------------------------------------------------- */
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

/** ----------------------------------------------------------------
 *  Output-Normalisierung: unterstützt String, Array, Objekte
 *  ---------------------------------------------------------------- */
function normalizeReplicateOutput(output: any): string {
  // 1) String direkt
  if (typeof output === "string") return output;

  // 2) Array mit einer URL
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

  // 3) Objektfelder, die häufig vorkommen
  if (output && typeof output === "object") {
    if (typeof output.image === "string") return output.image;
    if (typeof output.output === "string") return output.output;
    if (Array.isArray(output.data) && typeof output.data[0] === "string")
      return output.data[0];
    // Manchmal steckt die URL tiefer:
    for (const k of Object.keys(output)) {
      const v = (output as any)[k];
      if (typeof v === "string" && /^https?:\/\//.test(v)) return v;
    }
  }

  throw new Error("Unexpected Replicate output");
}

/** ----------------------------------------------------------------
 *  Ausführung mit Retries:
 *   - PRIMARY_MODEL (evtl. aus ENV)
 *   - wenn 422/Version: gleicher Slug mit :latest
 *   - dann Fallback-Kette
 *  ---------------------------------------------------------------- */
async function runWithFallbacks(imageUrl: string): Promise<string> {
  const tried: ModelSlug[] = [];

  async function tryModel(slug: ModelSlug): Promise<string> {
    tried.push(slug);
    const inputKey = pickInputKey(slug);
    const res: any = await replicate.run(slug, {
      input: { [inputKey]: imageUrl },
    });
    return normalizeReplicateOutput(res);
  }

  // 1) Primary (ENV/Default)
  try {
    return await tryModel(PRIMARY_MODEL);
  } catch (err: any) {
    const msg = String(err?.message || err);
    // Wenn Version/Permission-Problem → auf :latest des gleichen Modells
    if (
      msg.includes("Invalid version") ||
      msg.includes("not permitted") ||
      msg.includes("422")
    ) {
      const latest = modelToLatest(PRIMARY_MODEL);
      if (!tried.includes(latest)) {
        try {
          console.warn(
            `[Replicate] Primary failed (${PRIMARY_MODEL}). Retrying with ${latest} …`,
          );
          return await tryModel(latest);
        } catch (err2: any) {
          console.warn(
            `[Replicate] Latest retry failed (${latest}): ${String(err2?.message || err2)}`,
          );
        }
      }
    } else {
      console.warn(`[Replicate] Primary failed (${PRIMARY_MODEL}): ${msg}`);
    }
  }

  // 2) Fallback-Kette
  for (const slug of FALLBACK_CHAIN) {
    try {
      if (tried.includes(slug)) continue;
      console.warn(`[Replicate] Trying fallback: ${slug}`);
      return await tryModel(slug);
    } catch (e: any) {
      console.warn(
        `[Replicate] Fallback failed (${slug}): ${String(e?.message || e)}`,
      );
      continue;
    }
  }

  throw new Error(
    `All models failed. Tried: ${[PRIMARY_MODEL, ...FALLBACK_CHAIN].join(
      " -> ",
    )}. Check Replicate billing & model permissions.`,
  );
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

    // 1) Signierte URL fürs Original (öffentlich erreichbar für Replicate)
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

    // 3) Hintergrund entfernen (robuste Kette)
    const cutoutUrl = await runWithFallbacks(signed.signedUrl);

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
          "Processing failed (check Replicate billing, model slug/version and ensure the image URL is publicly reachable).",
      },
      { status: 500 },
    );
  }
}
