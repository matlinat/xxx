// app/(dashboard-creator)/layout.tsx
import { ReactNode } from "react"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AppSidebarCreator } from "@/components/(dashboard)/app-sidebar-creator"
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar"

export default async function CreatorDashboardLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  // Rolle aus der Datenbank laden
  const { data: profile } = await supabase
    .from("users")
    .select("username, avatar_url, role")
    .eq("auth_user_id", user.id)
    .maybeSingle()

  // Nur Creator haben Zugriff auf diesen Bereich
  if (profile?.role !== "creator") {
    redirect("/dashboard")
  }

  const uiUser = {
    name: profile?.username || user.user_metadata?.name || user.email || "User",
    email: user.email ?? "",
    avatar: profile?.avatar_url || user.user_metadata?.avatar_url || "",
  }

  return (
    <SidebarProvider>
      <AppSidebarCreator user={uiUser} />
      <SidebarInset className="flex min-h-dvh flex-col">
        {/* Top Bar mit Burger (mobile sichtbar) */}
        <header className="sticky top-0 z-40 flex h-12 items-center gap-2 border-b bg-background px-3 sm:px-4">
          <SidebarTrigger className="sm:hidden" aria-label="Open sidebar" />
          <div className="text-sm font-medium">Creator Dashboard</div>
        </header>

        <div className="flex-1">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}

