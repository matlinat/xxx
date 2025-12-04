"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Compass,
  Video,
  Image,
  MessageCircle,
  Radio,
} from "lucide-react"
import { NavMain } from "@/components/(dashboard)/nav-main"
import { NavUser } from "@/components/nav-user/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

type UIUser = {
  name: string
  email: string
  avatar: string
}

const navItems = [
  { title: "Erkunden", url: "/home", icon: Compass },
  { title: "Live Cams", url: "/live", icon: Radio },
  { title: "Videos", url: "/videos", icon: Video },
  { title: "Bilder", url: "/images", icon: Image },
  { title: "Jetzt Chatten", url: "/chat", icon: MessageCircle },
]

export function HomeSidebar({
  user,
  ...props
}: React.ComponentProps<typeof Sidebar> & { user?: UIUser }) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <Link
              href="/home"
              className="flex items-center gap-2 px-5 py-2 font-semibold text-base select-none"
            >
              <img
                src="https://placehold.it/24x24"
                alt="SaucySilk"
                className="size-6 rounded-md"
              />
              <span className="hidden sm:inline-block">SaucySilk</span>
            </Link>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="px-2">
        {/* Hauptnavigation */}
        <NavMain items={navItems} className="mt-6 px-2" />
      </SidebarContent>

      {/* User-Bereich nur wenn eingeloggt */}
      {user && (
        <SidebarFooter>
          <NavUser user={user} />
        </SidebarFooter>
      )}
    </Sidebar>
  )
}

