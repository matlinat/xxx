"use client"

import * as React from "react"
import Link from "next/link"
import {
  LayoutDashboard,
  Users,
  Shield,
  BarChart3,
  FileText,
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
    { title: "Dashboard", url: "/admin", icon: LayoutDashboard },
    { title: "User Management", url: "/admin/users", icon: Users },
    { title: "Content Moderation", url: "/admin/moderation", icon: Shield },
    { title: "Analytics", url: "/admin/analytics", icon: BarChart3 },
    { title: "Reports", url: "/admin/reports", icon: FileText },
  ],
  navSecondary: [
    { title: "Settings", url: "/settings", icon: Settings },
    { title: "Get Help", url: "/help", icon: HelpCircle },
  ],
}

export function AppSidebarAdmin({
  user,
  ...props
}: React.ComponentProps<typeof Sidebar> & { user: UIUser }) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <Link
              href="/admin"
              className="flex items-center gap-2 px-5 py-2 font-semibold text-base select-none"
            >
              <Sparkles className="size-5" />
              <span>xxx.io</span>
            </Link>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="px-2">
        {/* Admin Hauptnavigation */}
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

