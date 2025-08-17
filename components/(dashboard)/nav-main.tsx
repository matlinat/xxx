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
                "flex items-center gap-2 rounded-md transition-all",
                // Normal links
                !item.highlight &&
                  cn(
                    "px-3 py-2 text-sm",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "hover:bg-sidebar-accent/50"
                  ),
                // Highlight CTA
                item.highlight &&
                  "mt-3 mb-5 w-full px-4 py-3 text-base font-semibold bg-background text-foreground border shadow-sm hover:shadow-lg hover:scale-[1.01]"
              )}
            >
              <Link href={item.url} className="flex items-center gap-2 w-full">
                {Icon ? <Icon className="size-5 shrink-0" /> : null}
                <span>{item.title}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        )
      })}
    </SidebarMenu>
  )
}
