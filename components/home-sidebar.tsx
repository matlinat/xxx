"use client"

import * as React from "react"
import Link from "next/link"
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
  Upload,
  UserCircle,
} from "lucide-react"
import { NavMain } from "@/components/(dashboard)/nav-main"
import { NavSecondary } from "@/components/(dashboard)/nav-secondary"
import { NavUser } from "@/components/nav-user/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"

type UIUser = {
  name: string
  email: string
  avatar: string
}

const navItems = [
  { title: "Erkunden", url: "/home", icon: Compass },
  { title: "Live Cams", url: "/home/live", icon: Radio },
  { title: "Videos", url: "/home/videos", icon: Video },
  { title: "Bilder", url: "/home/images", icon: Image },
  { title: "Jetzt Chatten", url: "/home/chat", icon: MessageCircle },
]

const creatorNavItems = [
  { title: "Dashboard", url: "/home/creator", icon: LayoutDashboard },
  { title: "Profil bearbeiten", url: "/home/creator/profile", icon: UserCircle },
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
            <SidebarMenuButton asChild size="lg">
              <Link href="/home">
                <span>SaucySilk</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {/* Public Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Public</SidebarGroupLabel>
          <SidebarGroupContent>
            <NavMain items={navItems} />
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Private Navigation - nur für Creator sichtbar */}
        {isCreator && (
          <SidebarGroup>
            <SidebarGroupLabel>Private</SidebarGroupLabel>
            <SidebarGroupContent>
              <NavMain items={creatorNavItems} />
              <NavSecondary
                items={[
                  {
                    title: "Video Upload",
                    url: "/home/creator/media/upload",
                    icon: Upload,
                  },
                ]}
              />
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      {/* Footer: "Creator werden" Button (nur wenn nicht eingeloggt) oder User-Bereich (wenn eingeloggt) */}
      <SidebarFooter>
        {user ? (
          <NavUser user={user} />
        ) : (
          <Button
            asChild
            size="lg"
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold"
          >
            <Link href="/signup/creator" className="flex items-center justify-center gap-2">
              <Star className="size-4 fill-white" />
              <span>Creator werden</span>
            </Link>
          </Button>
        )}
      </SidebarFooter>
    </Sidebar>
  )
}

