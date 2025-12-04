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
  Star,
  LayoutDashboard,
  DollarSign,
  Megaphone,
  FolderOpen,
  BarChart3,
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
  SidebarSeparator,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"

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

const creatorNavItems = [
  { title: "Dashboard", url: "/home/creator", icon: LayoutDashboard },
  { title: "Earnings", url: "/home/creator/earnings", icon: DollarSign },
  { title: "Marketing", url: "/home/creator/marketing", icon: Megaphone },
  { title: "Media Library", url: "/home/creator/media", icon: FolderOpen },
  { title: "Statistics", url: "/home/creator/statistics", icon: BarChart3 },
]

export function HomeSidebar({
  user,
  role,
  ...props
}: React.ComponentProps<typeof Sidebar> & { user?: UIUser; role?: string }) {
  const isCreator = role === "creator"

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <Link
              href="/home"
              className="flex items-center gap-2 px-5 py-2 font-semibold text-lg md:text-base select-none"
            >
              <img
                src="/icon.png"
                alt="SaucySilk"
                className="size-7 md:size-6 rounded-md"
              />
              <span className="hidden sm:inline-block">SaucySilk</span>
            </Link>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="px-2">
        {/* Hauptnavigation */}
        <NavMain items={navItems} className="mt-6 px-2" />

        {/* Creator Navigation - nur für Creator sichtbar */}
        {isCreator && (
          <>
            <SidebarSeparator className="my-4" />
            <NavMain items={creatorNavItems} className="px-2" />
          </>
        )}
      </SidebarContent>

      {/* Footer: "Creator werden" Button (nur wenn nicht eingeloggt) oder User-Bereich (wenn eingeloggt) */}
      <SidebarFooter>
        {user ? (
          <NavUser user={user} />
        ) : (
          <div className="px-2 pb-2">
            <Button
              asChild
              size="lg"
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold text-base md:text-sm h-12 md:h-10 shadow-lg"
            >
              <Link href="/signup/creator" className="flex items-center justify-center gap-2">
                <Star className="size-5 md:size-4 fill-white" />
                <span>Creator werden</span>
              </Link>
            </Button>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  )
}

