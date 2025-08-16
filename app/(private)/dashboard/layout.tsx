import { ReactNode } from "react"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AppSidebar } from "@/components/(dashboard)/app-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  // Username + Avatar optional aus eigener Tabelle
  const { data: profile } = await supabase
    .from("users")
    .select("username, avatar_url")
    .eq("auth_user_id", user.id)
    .maybeSingle()

  const uiUser = {
    name: profile?.username || user.user_metadata?.name || user.email || "User",
    email: user.email ?? "",
    avatar: profile?.avatar_url || user.user_metadata?.avatar_url || "",
  }

  return (
    <SidebarProvider>
      <AppSidebar user={uiUser} />
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  )
}
