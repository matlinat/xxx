import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin, SUPA_BUCKET_PROC } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const { data: job, error } = await supabaseAdmin
    .from("ppp_jobs")
    .select("*")
    .eq("id", id)
    .single();
  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  let downloadUrl: string | null = null;
  if (job.processed_path) {
    const { data: signed } = await supabaseAdmin.storage
      .from(SUPA_BUCKET_PROC)
      .createSignedUrl(job.processed_path, 60 * 10);
    downloadUrl = signed?.signedUrl ?? null;
  }
  return NextResponse.json({ status: job.status, downloadUrl });
}
