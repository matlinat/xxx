// app/dashboard/page.tsx
// Diese Route leitet automatisch zum richtigen Dashboard basierend auf der Rolle weiter
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("auth_user_id", user.id)
    .maybeSingle()

  // Automatische Weiterleitung basierend auf Rolle
  if (profile?.role === "creator") {
    redirect("/creator")
  } else if (profile?.role === "subscriber") {
    redirect("/subscriber")
  } else if (profile?.role === "admin") {
    redirect("/admin")
  }

  // Fallback: Wenn keine Rolle gesetzt ist, zu Subscriber (Default)
  redirect("/subscriber")
}

