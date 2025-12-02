"use client"

import * as React from "react"
import Link from "next/link"
import {
  LayoutDashboard,
  Heart,
  Bookmark,
  Bell,
  Sparkles,
  Settings,
  HelpCircle,
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
} from "@/components/ui/sidebar"

type UIUser = {
  name: string
  email: string
  avatar: string
}

const data = {
  navMain: [
    { title: "Dashboard", url: "/subscriber", icon: LayoutDashboard },
    { title: "Subscriptions", url: "/subscriber/subscriptions", icon: Heart },
    { title: "Saved Content", url: "/subscriber/saved", icon: Bookmark },
    { title: "Notifications", url: "/subscriber/notifications", icon: Bell },
  ],
  navSecondary: [
    { title: "Settings", url: "/settings", icon: Settings },
    { title: "Get Help", url: "/help", icon: HelpCircle },
  ],
}

export function AppSidebarSubscriber({
  user,
  ...props
}: React.ComponentProps<typeof Sidebar> & { user: UIUser }) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <Link
              href="/subscriber"
              className="flex items-center gap-2 px-5 py-2 font-semibold text-base select-none"
            >
              <Sparkles className="size-5" />
              <span>xxx.io</span>
            </Link>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="px-2">
        {/* Subscriber Hauptnavigation */}
        <NavMain items={data.navMain} className="mt-6 px-2" />

        {/* Sekundärnavigation */}
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  )
}

