// app/api/process/route.ts
import { NextRequest, NextResponse } from "next/server";
import Replicate from "replicate";
import {
  supabaseAdmin,
  SUPA_BUCKET_ORIG,
  SUPA_BUCKET_PROC,
} from "@/lib/supabase";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN!,
});

// super-simple helper: download URL -> Uint8Array
async function fetchBytes(url: string): Promise<Uint8Array> {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`download failed: ${r.status}`);
  const ab = await r.arrayBuffer();
  return new Uint8Array(ab);
}

// normalize replicate output (string or [string])
function outUrl(output: any): string {
  if (typeof output === "string") return output;
  if (Array.isArray(output) && typeof output[0] === "string") return output[0];
  throw new Error("unexpected replicate output");
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

    // 1) signierte URL fürs Original holen (öffentlich erreichbar für Replicate)
    const { data: signed, error: signErr } = await supabaseAdmin.storage
      .from(SUPA_BUCKET_ORIG)
      .createSignedUrl(originalPath, 60 * 10);
    if (signErr) throw signErr;

    // 2) Job in DB anlegen (status processing)
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

    // 3) Replicate aufrufen – simplest possible
    //    Modell per ENV überschreibbar, sonst rembg:latest
    const model = (process.env.REPLICATE_BG_MODEL ||
      "cjwbw/rembg:latest") as any;
    const output: any = await replicate.run(model, {
      input: { image: signed.signedUrl },
    });
    const resultUrl = outUrl(output);

    // 4) Ergebnis downloaden & in Supabase speichern
    const bytes = await fetchBytes(resultUrl);
    const processedPath = `${userId ?? "anon"}/${job.id}.png`;

    const { error: upErr } = await supabaseAdmin.storage
      .from(SUPA_BUCKET_PROC)
      .upload(processedPath, bytes as any, {
        contentType: "image/png",
        upsert: true,
      });
    if (upErr) throw upErr;

    // 5) Job auf done setzen
    await supabaseAdmin
      .from("ppp_jobs")
      .update({ status: "done", processed_path: processedPath })
      .eq("id", job.id);

    return NextResponse.json({ jobId: job.id, processedPath });
  } catch (e: any) {
    console.error("[process-simple]", e?.message || e);
    return NextResponse.json(
      { error: e?.message ?? "processing failed" },
      { status: 500 },
    );
  }
}
