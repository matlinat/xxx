// app/home/layout.tsx
import { ReactNode } from "react"
import { createClient } from "@/lib/supabase/server"
import { getCachedUserProfile } from "@/lib/supabase/user-cache"
import { HomeHeader } from "@/components/home-header"
import { HomeFooter } from "@/components/home-footer"
import { HomeSidebar } from "@/components/home-sidebar"
import { BottomNav } from "@/components/bottom-nav"
import {
  SidebarProvider,
  SidebarInset,
} from "@/components/ui/sidebar"
import { headers } from "next/headers"

export default async function HomeLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  // User-Daten laden wenn eingeloggt (gecacht innerhalb des Request-Zyklus)
  let uiUser = undefined
  let userRole: string | undefined = undefined
  if (user) {
    const profile = await getCachedUserProfile(user.id)

    uiUser = {
      name: profile?.username || user.user_metadata?.name || user.email || "User",
      email: user.email ?? "",
      avatar: profile?.avatar_url || user.user_metadata?.avatar_url || "",
    }
    userRole = profile?.role || undefined
  }

  const isCreator = userRole === "creator"

  // Check if we're on a chat page
  const headersList = await headers()
  const pathname = headersList.get("x-pathname") || ""
  const isChatPage = pathname.startsWith("/home/chat")

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
        <main className="flex-1">
          {children}
        </main>
        {/* Footer und BottomNav: Nicht auf Chat-Seiten */}
        {!isChatPage && (
          <>
        <HomeFooter />
        {!isCreator && <BottomNav />}
          </>
        )}
      </SidebarInset>
    </SidebarProvider>
  )
}

