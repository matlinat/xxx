// app/api/process/route.ts
import { NextRequest, NextResponse } from "next/server";
import Replicate from "replicate";
import {
  supabaseAdmin,
  SUPA_BUCKET_ORIG,
  SUPA_BUCKET_PROC,
} from "@/lib/supabase/client";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN!,
});

// fixe, funktionierende rembg-Version (kannst per ENV überschreiben)
const MODEL_VERSION =
  process.env.REPLICATE_BG_VERSION ||
  "cjwbw/rembg:fb8af171cfa1616ddcf1242c093f9c46bcada5ad4cf6f2fbe8b81b330ec5c003";

async function download(url: string): Promise<Uint8Array> {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`download failed: ${r.status}`);
  const ab = await r.arrayBuffer();
  return new Uint8Array(ab);
}

function extractUrl(output: any): string {
  if (typeof output === "string") return output;
  if (Array.isArray(output) && typeof output[0] === "string") return output[0];
  if (output && typeof output.url === "function") return output.url();
  if (output && typeof output.url === "string") return output.url;
  if (
    output &&
    Array.isArray(output.files) &&
    typeof output.files[0] === "string"
  )
    return output.files[0];
  throw new Error("Unexpected Replicate output format");
}

export async function POST(req: NextRequest) {
  try {
    const { originalPath, userId } = await req.json();
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

    // 0) Job anlegen (status: processing) – damit das Frontend eine jobId hat
    const { data: job, error: jobErr } = await supabaseAdmin
      .from("ppp_jobs")
      .insert([
        {
          user_id: userId ?? null,
          original_path: originalPath,
          status: "processing",
        },
      ])
      .select()
      .single();
    if (jobErr) throw jobErr;

    // 1) signierte URL fürs Original
    const { data: signed, error: signErr } = await supabaseAdmin.storage
      .from(SUPA_BUCKET_ORIG)
      .createSignedUrl(originalPath, 60 * 10);
    if (signErr) throw signErr;

    // 2) Replicate (offizielle Doku: konkrete Versions-SHA)
    const output: any = await replicate.run(MODEL_VERSION as any, {
      input: { image: signed.signedUrl },
    });

    // 3) Ergebnis-URL holen und Bytes laden
    const fileUrl = extractUrl(output);
    const bytes = await download(fileUrl);

    // 4) in Supabase speichern
    const processedPath = `${userId ?? "anon"}/${job.id}.png`;
    const { error: upErr } = await supabaseAdmin.storage
      .from(SUPA_BUCKET_PROC)
      .upload(processedPath, bytes as any, {
        contentType: "image/png",
        upsert: true,
      });
    if (upErr) throw upErr;

    // 5) Job updaten
    await supabaseAdmin
      .from("ppp_jobs")
      .update({ status: "done", processed_path: processedPath })
      .eq("id", job.id);

    // 6) Antwort (Frontend kann optional weiter-pollen oder direkt downloaden)
    return NextResponse.json({ jobId: job.id, processedPath }, { status: 200 });
  } catch (e: any) {
    console.error("[/api/process]", e?.message || e);
    return NextResponse.json(
      { error: e?.message ?? "processing failed" },
      { status: 500 },
    );
  }
}
