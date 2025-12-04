"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"

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
            <SidebarMenuButton
              asChild
              className={cn(
                "flex items-center gap-2 rounded-md transition-all h-12 md:h-10",
                // Normale Links
                !item.highlight &&
                  cn(
                    "px-3 text-base md:text-sm",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "hover:bg-sidebar-accent/50"
                  ),
                // Quick Create CTA
                item.highlight &&
                  "w-full px-3 font-medium bg-white text-black border shadow-sm hover:shadow-md"
              )}
            >
              <Link href={item.url} className="flex items-center gap-2 w-full h-full">
                {Icon ? <Icon className="size-6 md:size-5 shrink-0" /> : null}
                <span>{item.title}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        )
      })}
    </SidebarMenu>
  )
}
