// app/api/status/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin, SUPA_BUCKET_PROC } from "@/lib/supabase/admin";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

    const { data: job, error } = await supabaseAdmin.from("ppp_jobs").select("*").eq("id", id).single();
    if (error || !job) return NextResponse.json({ error: "job not found" }, { status: 404 });

    // legacy single
    let downloadUrl: string | null = null;
    if (job.processed_path) {
      const { data: signedSingle } = await supabaseAdmin.storage
        .from(SUPA_BUCKET_PROC)
        .createSignedUrl(job.processed_path, 60 * 10);
      downloadUrl = signedSingle?.signedUrl ?? null;
    }

    // multiple (presets)
    const downloadUrlsByPreset: Record<string, string> = {};
    const presets: Array<{ presetId: string; processedPath: string }> = job.meta?.presets ?? [];
    for (const p of presets) {
      const { data: signed } = await supabaseAdmin.storage.from(SUPA_BUCKET_PROC).createSignedUrl(p.processedPath, 60 * 10);
      if (signed?.signedUrl) downloadUrlsByPreset[p.presetId] = signed.signedUrl;
    }

    return NextResponse.json({ status: job.status, downloadUrl, downloadUrlsByPreset }, { status: 200 });
  } catch (e: any) {
    console.error("[/api/status]", e?.message || e);
    return NextResponse.json({ error: e?.message ?? "status failed" }, { status: 500 });
  }
}
