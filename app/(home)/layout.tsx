// app/(home)/layout.tsx
import { ReactNode } from "react"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { HomeHeader } from "@/components/home-header"
import { HomeFooter } from "@/components/home-footer"

export default async function HomeLayout({ children }: { children: ReactNode }) {
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

  return (
    <>
      <HomeHeader />
      {children}
      <HomeFooter />
    </>
  )
}

