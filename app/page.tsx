// app/page.tsx - Root redirect
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export default async function RootPage() {
  // Alle User zur Home-Seite weiterleiten
  redirect("/home")
}

