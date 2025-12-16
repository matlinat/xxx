"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar"

type NavItem = {
  title: string
  url: string
  icon?: React.ElementType
  highlight?: boolean
}

export function NavMain({
  items,
  className,
}: {
  items: NavItem[]
  className?: string
}) {
  const pathname = usePathname()

  return (
    <SidebarMenu className={className}>
      {items.map((item) => {
        const Icon = item.icon
        const isActive = pathname === item.url

        return (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton asChild isActive={isActive}>
              <Link href={item.url}>
                {Icon ? <Icon /> : null}
                <span>{item.title}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        )
      })}
    </SidebarMenu>
  )
}
