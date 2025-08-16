import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin, SUPA_BUCKET_ORIG } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  try {
    const { filename, userId } = await req.json();
    if (!filename)
      return NextResponse.json({ error: "filename required" }, { status: 400 });

    const objectPath = `${userId ?? "anon"}/${Date.now()}-${filename}`;

    // erfordert supabase-js >= 2.43
    const { data, error } = await (supabaseAdmin as any).storage
      .from(SUPA_BUCKET_ORIG)
      .createSignedUploadUrl(objectPath);

    if (error) throw error;
    return NextResponse.json({
      path: objectPath,
      signedUrl: data.signedUrl,
      token: data.token,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
