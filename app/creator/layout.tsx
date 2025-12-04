// app/creator/layout.tsx
// Layout für öffentliche Creator-Profile (ohne Sidebar)
import { ReactNode } from "react"
import { createClient } from "@/lib/supabase/server"
import { HomeHeader } from "@/components/home-header"
import { HomeFooter } from "@/components/home-footer"
import { SidebarProvider } from "@/components/ui/sidebar"

export default async function CreatorPublicLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  // User-Daten laden wenn eingeloggt
  let uiUser = undefined
  if (user) {
    const { data: profile } = await supabase
      .from("users")
      .select("username, avatar_url")
      .eq("auth_user_id", user.id)
      .maybeSingle()

    uiUser = {
      name: profile?.username || user.user_metadata?.name || user.email || "User",
      email: user.email ?? "",
      avatar: profile?.avatar_url || user.user_metadata?.avatar_url || "",
    }
  }

  return (
    <SidebarProvider defaultOpen={false}>
      <div className="flex min-h-screen flex-col w-full">
        <HomeHeader user={uiUser} />
        <main className="flex-1">
          {children}
        </main>
        <HomeFooter />
      </div>
    </SidebarProvider>
  )
}

