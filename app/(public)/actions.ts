"use server"

import { createClient } from "@/lib/supabase/server"
import Replicate from "replicate"

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN!,
})

export async function processImageAction(formData: FormData) {
  const file = formData.get("file") as File
  if (!file) throw new Error("No file uploaded")

  // 1. Supabase Upload
  const supabase = await createClient()
  const arrayBuffer = await file.arrayBuffer()
  const fileName = `${Date.now()}-${file.name}`
  const { data, error } = await supabase.storage
    .from(process.env.SUPA_BUCKET_ORIG!)
    .upload(fileName, arrayBuffer, {
      contentType: file.type,
      upsert: true,
    })

  if (error) throw error

  const { data: { publicUrl } } = supabase.storage
    .from(process.env.SUPA_BUCKET_ORIG!)
    .getPublicUrl(fileName)

  // 2. Replicate Verarbeitung
  const output = await replicate.run(
    process.env.REPLICATE_BG_VERSION || "cjwbw/rembg:latest",
    { input: { image: publicUrl } }
  )

  // 3. Ergebnis abspeichern
  const processedFileName = `${Date.now()}-processed.png`
  const response = await fetch(output as string)
  const processedBuffer = await response.arrayBuffer()
  await supabase.storage
    .from(process.env.SUPA_BUCKET_PROC!)
    .upload(processedFileName, processedBuffer, {
      contentType: "image/png",
      upsert: true,
    })

  const { data: { publicUrl: processedUrl } } = supabase.storage
    .from(process.env.SUPA_BUCKET_PROC!)
    .getPublicUrl(processedFileName)

  return { processedUrl }
}
