import { NextRequest, NextResponse } from "next/server";
import {
  supabaseAdmin,
  SUPA_BUCKET_ORIG,
  SUPA_BUCKET_PROC,
} from "@/lib/supabase";

const REPLICATE_VERSION_BG = process.env.REPLICATE_BG_VERSION ?? ""; // TODO: Version-ID eintragen
const REPLICATE_BASE = "https://api.replicate.com/v1/predictions";
const headers = {
  Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
  "Content-Type": "application/json",
};

async function callReplicate(version: string, input: any) {
  const res = await fetch(REPLICATE_BASE, {
    method: "POST",
    headers,
    body: JSON.stringify({ version, input }),
  });
  const pred = await res.json();
  if (!res.ok) throw new Error(pred?.error ?? "Replicate start failed");

  let status = pred.status;
  while (status === "starting" || status === "processing") {
    await new Promise((r) => setTimeout(r, 2000));
    const r2 = await fetch(`${REPLICATE_BASE}/${pred.id}`, { headers });
    const p2 = await r2.json();
    status = p2.status;
    if (status === "succeeded")
      return Array.isArray(p2.output) ? p2.output[0] : p2.output;
    if (status === "failed" || status === "canceled")
      throw new Error("Replicate job failed");
  }
  throw new Error("Unknown replicate status");
}

async function downloadToBuffer(url: string) {
  const r = await fetch(url);
  if (!r.ok) throw new Error("Download failed");
  const ab = await r.arrayBuffer();
  return Buffer.from(ab);
}

export async function POST(req: NextRequest) {
  try {
    const {
      originalPath,
      bgMode = "white",
      brandHex,
      userId,
    } = await req.json();
    if (!originalPath)
      return NextResponse.json(
        { error: "originalPath required" },
        { status: 400 },
      );

    // Pre-signed Download für Original
    const { data: signed, error: signErr } = await supabaseAdmin.storage
      .from(SUPA_BUCKET_ORIG)
      .createSignedUrl(originalPath, 60 * 10);
    if (signErr) throw signErr;

    // Job in DB
    const { data: job, error: jobErr } = await supabaseAdmin
      .from("ppp_jobs")
      .insert([
        {
          user_id: userId ?? null,
          original_path: originalPath,
          bg_mode: bgMode,
          brand_hex: brandHex ?? null,
        },
      ])
      .select()
      .single();
    if (jobErr) throw jobErr;

    // Hintergrund entfernen
    if (!REPLICATE_VERSION_BG) throw new Error("Missing REPLICATE_BG_VERSION");
    const cutUrl = await callReplicate(REPLICATE_VERSION_BG, {
      image: signed.signedUrl,
    });

    // Für MVP: freigestelltes PNG direkt speichern (ohne Markenhintergrund)
    const png = await downloadToBuffer(cutUrl);
    const processedPath = `${userId ?? "anon"}/${job.id}.png`;

    const { error: upErr } = await supabaseAdmin.storage
      .from(SUPA_BUCKET_PROC)
      .upload(processedPath, png, { contentType: "image/png", upsert: true });
    if (upErr) throw upErr;

    await supabaseAdmin
      .from("ppp_jobs")
      .update({ status: "done", processed_path: processedPath })
      .eq("id", job.id);

    return NextResponse.json({ jobId: job.id, processedPath });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
