"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { IconPlus } from "@tabler/icons-react"

type NavItem = {
  title: string
  url: string
  icon?: React.ComponentType<{ className?: string }>
  highlight?: boolean
}

type NavMainProps = {
  items: NavItem[]
  className?: string
}

export function NavMain({ items, className }: NavMainProps) {
  const pathname = usePathname()

  // Quick Create explizit herausfiltern
  const quickCreate = items.find((i) => i.highlight)
  const normalItems = items.filter((i) => !i.highlight)

  return (
    <nav className={cn("flex flex-col gap-1", className)}>
      {/* Quick Create oben */}
      {quickCreate && (
        <Link
          href={quickCreate.url}
          className={cn(
            "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium",
            "bg-accent/70 text-accent-foreground hover:bg-accent transition-colors"
          )}
        >
          <IconPlus className="size-4" />
          {quickCreate.title}
        </Link>
      )}

      {/* Restliche Menüpunkte */}
      {normalItems.map((item) => {
        const isActive = pathname === item.url
        return (
          <Link
            key={item.title}
            href={item.url}
            className={cn(
              "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
              isActive
                ? "bg-accent text-accent-foreground font-medium"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            {item.icon && <item.icon className="size-4" />}
            {item.title}
          </Link>
        )
      })}
    </nav>
  )
}
