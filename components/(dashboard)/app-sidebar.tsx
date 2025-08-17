"use client"

import * as React from "react"
import Link from "next/link"
import {
  IconChartBar,
  IconDashboard,
  IconFolder,
  IconHelp,
  IconInnerShadowTop,
  IconListDetails,
  IconPlus,
  IconSettings,
} from "@tabler/icons-react"

import { NavMain } from "@/components/(dashboard)/nav-main"
import { NavSecondary } from "@/components/(dashboard)/nav-secondary"
// import { NavDocuments } from "@/components/(dashboard)/nav-documents"
import { NavUser } from "@/components/(dashboard)/nav-user/nav-user"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

type UIUser = {
  name: string
  email: string
  avatar: string
}

const data = {
  navMain: [
    { title: "Quick Create", url: "/quick-create", icon: IconPlus, highlight: true },
    { title: "Dashboard", url: "/dashboard", icon: IconDashboard },
    { title: "Job History", url: "/job-history", icon: IconListDetails },
    { title: "Projects", url: "/projects", icon: IconFolder },
  ],
  // navClouds und documents aktuell nicht benötigt
  navSecondary: [
    { title: "Settings", url: "/settings", icon: IconSettings },
    { title: "Get Help", url: "/get-help", icon: IconHelp },
    // { title: "Search", url: "/search", icon: IconSearch },
  ],
}

export function AppSidebar({
  user,
  ...props
}: React.ComponentProps<typeof Sidebar> & { user: UIUser }) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <Link
              href="/dashboard"
              className="flex items-center gap-2 px-5 py-2 font-semibold text-base select-none"
            >
              <IconInnerShadowTop className="size-5" />
              <span>PPP.io</span>
            </Link>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="px-2">
        {/* Hauptnavigation inkl. Quick Create */}
        <NavMain items={data.navMain} className="mt-6 px-2" />

        {/* Dokumente später aktivieren */}
        {/*
        <NavDocuments items={data.documents} />
        */}

        {/* Sekundärnavigation */}
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  )
}
