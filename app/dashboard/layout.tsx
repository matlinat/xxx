// app/(dashboard)/layout.tsx
import { ReactNode } from "react"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AppSidebar } from "@/components/(dashboard)/app-sidebar"
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar"

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

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
      <SidebarInset className="flex min-h-dvh flex-col">
        {/* Top Bar mit Burger (mobile sichtbar) */}
        <header className="sticky top-0 z-40 flex h-12 items-center gap-2 border-b bg-background px-3 sm:px-4">
          <SidebarTrigger className="sm:hidden" aria-label="Open sidebar" />
          <div className="text-sm font-medium">Dashboard</div>
        </header>

        <div className="flex-1">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}
