// app/page.tsx - Root redirect
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export default async function RootPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  // Wenn User eingeloggt ist, zum entsprechenden Dashboard weiterleiten
  if (user) {
    const { data: profile } = await supabase
      .from("users")
      .select("role")
      .eq("auth_user_id", user.id)
      .maybeSingle()

    if (profile?.role === "creator") {
      redirect("/creator")
    } else if (profile?.role === "subscriber") {
      redirect("/subscriber")
    } else if (profile?.role === "admin") {
      redirect("/admin")
    }
    redirect("/dashboard")
  }

  // Nicht-eingeloggte User zur Home-Seite
  redirect("/home")
}

