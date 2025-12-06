// app/home/layout.tsx
import { ReactNode } from "react"
import { createClient } from "@/lib/supabase/server"
import { HomeHeader } from "@/components/home-header"
import { HomeFooter } from "@/components/home-footer"
import { HomeSidebar } from "@/components/home-sidebar"
import { BottomNav } from "@/components/bottom-nav"
import {
  SidebarProvider,
  SidebarInset,
} from "@/components/ui/sidebar"

export default async function HomeLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  // User-Daten laden wenn eingeloggt
  let uiUser = undefined
  let userRole: string | undefined = undefined
  if (user) {
    const { data: profile } = await supabase
      .from("users")
      .select("username, avatar_url, role")
      .eq("auth_user_id", user.id)
      .maybeSingle()

    uiUser = {
      name: profile?.username || user.user_metadata?.name || user.email || "User",
      email: user.email ?? "",
      avatar: profile?.avatar_url || user.user_metadata?.avatar_url || "",
    }
    userRole = profile?.role
  }

  const isCreator = userRole === "creator"

  return (
    <SidebarProvider>
      {/* Sidebar: Auf Desktop immer, auf Mobile nur für Creator */}
      {isCreator ? (
        <HomeSidebar user={uiUser} role={userRole} />
      ) : (
        <div className="hidden md:block">
          <HomeSidebar user={uiUser} role={userRole} />
        </div>
      )}
      <SidebarInset className="flex min-h-screen flex-col">
        <HomeHeader user={uiUser} />
        <main className="flex-1 pb-16 md:pb-0">
          {children}
        </main>
        <HomeFooter />
        {/* Bottom Navigation: Nur auf Mobile, nicht für Creator */}
        {!isCreator && <BottomNav />}
      </SidebarInset>
    </SidebarProvider>
  )
}

