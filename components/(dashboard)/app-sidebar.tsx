"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import {
  IconCamera,
  IconChartBar,
  IconDashboard,
  IconDatabase,
  IconFileAi,
  IconFileDescription,
  IconFileWord,
  IconFolder,
  IconHelp,
  IconInnerShadowTop,
  IconListDetails,
  IconReport,
  IconSearch,
  IconSettings,
} from "@tabler/icons-react"

import { NavUser } from "@/components/nav-user/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

type UIUser = { name: string; email: string; avatar: string }

const NavItem = ({ href, title, icon: Icon }: { href: string; title: string; icon: any }) => {
  const pathname = usePathname()
  const isActive = pathname === href

  return (
    <SidebarMenuItem>
      <Link href={href} className="relative">
        <SidebarMenuButton
          className={isActive ? "bg-accent text-accent-foreground" : "hover:bg-muted"}
        >
          {isActive && (
            <motion.span
              layoutId="sidebar-highlight"
              className="absolute inset-y-1 left-1 w-1 rounded bg-primary"
            />
          )}
          <Icon className="mr-2 size-4" />
          {title}
        </SidebarMenuButton>
      </Link>
    </SidebarMenuItem>
  )
}

export function AppSidebar(
  { user, ...props }:
  React.ComponentProps<typeof Sidebar> & { user: UIUser }
) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link href="/dashboard">
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">Acme Inc.</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarMenu>
          {/* Prominent platzierter Quick Create Button */}
          <NavItem href="/quick-create" title="Quick Create" icon={IconCamera} />
        </SidebarMenu>
        <SidebarMenu>
          <NavItem href="/dashboard" title="Dashboard" icon={IconDashboard} />
          <NavItem href="/job-history" title="Job History" icon={IconListDetails} />
          <NavItem href="/projects" title="Projects" icon={IconFolder} />
        </SidebarMenu>

        {/* Sekundäres Menü */}
        {/*
        <SidebarMenu>
          <NavItem href="/documents/data-library" title="Data Library" icon={IconDatabase} />
          <NavItem href="/documents/reports" title="Reports" icon={IconReport} />
          <NavItem href="/documents/word-assistant" title="Word Assistant" icon={IconFileWord} />
        </SidebarMenu>
        */}

        <SidebarMenu className="mt-auto">
          <NavItem href="/settings" title="Settings" icon={IconSettings} />
          <NavItem href="/help" title="Get Help" icon={IconHelp} />
          {/* <NavItem href="/search" title="Search" icon={IconSearch} /> */}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  )
}
