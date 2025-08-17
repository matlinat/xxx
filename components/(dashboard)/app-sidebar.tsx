"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  IconCamera, IconChartBar, IconDashboard, IconDatabase, IconFileAi,
  IconFileDescription, IconFileWord, IconFolder, IconHelp, IconInnerShadowTop,
  IconListDetails, IconReport, IconSearch, IconSettings,
} from "@tabler/icons-react"
import { motion } from "framer-motion"

import { NavMain } from "@/components/(dashboard)/nav-main"
import { NavSecondary } from "@/components/(dashboard)/nav-secondary"
import { NavUser } from "@/components/nav-user/nav-user"
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarHeader,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem,
} from "@/components/ui/sidebar"

const navItems = [
  { title: "Dashboard", url: "/dashboard", icon: IconDashboard },
  { title: "Quick Create", url: "/quick-create", icon: IconCamera },
  { title: "Job History", url: "/job-history", icon: IconListDetails },
  { title: "Projects", url: "/projects", icon: IconFolder },
]

const navSecondary = [
  { title: "Settings", url: "/settings", icon: IconSettings },
  { title: "Get Help", url: "/help", icon: IconHelp },
  // { title: "Search", url: "/search", icon: IconSearch },
]

// const documents = [
//   { name: "Data Library", url: "/data-library", icon: IconDatabase },
//   { name: "Reports", url: "/reports", icon: IconReport },
//   { name: "Word Assistant", url: "/word-assistant", icon: IconFileWord },
// ]

type UIUser = { name: string; email: string; avatar: string }

export function AppSidebar(
  { user, ...props }:
  React.ComponentProps<typeof Sidebar> & { user: UIUser }
) {
  const pathname = usePathname()

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link href="/dashboard" className="flex items-center gap-2">
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">PPP</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarMenu className="px-3 py-2">
          {navItems.map(({ title, url, icon: Icon }) => {
            const isActive = pathname === url
            return (
              <SidebarMenuItem key={url}>
                <SidebarMenuButton asChild className="relative">
                  <Link
                    href={url}
                    className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${isActive ? 'bg-accent text-accent-foreground font-medium' : 'text-muted-foreground hover:bg-muted'}`}
                  >
                    <Icon className="size-5 shrink-0" />
                    <span className="truncate">{title}</span>
                    {isActive && (
                      <motion.span
                        layoutId="sidebar-active"
                        className="absolute inset-0 z-[-1] rounded-md bg-accent"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>

        {/* Dokumente für später */}
        {/* <NavDocuments items={documents} /> */}

        <SidebarMenu className="mt-auto ">
          {navSecondary.map(({ title, url, icon: Icon }) => {
            const isActive = pathname === url
            return (
              <SidebarMenuItem key={url}>
                <SidebarMenuButton asChild className="relative">
                  <Link
                    href={url}
                    className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${isActive ? 'bg-accent text-accent-foreground font-medium' : 'text-muted-foreground hover:bg-muted'}`}
                  >
                    <Icon className="size-5 shrink-0" />
                    <span className="truncate">{title}</span>
                    {isActive && (
                      <motion.span
                        layoutId="sidebar-active"
                        className="absolute inset-0 z-[-1] rounded-md bg-accent"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  )
}
