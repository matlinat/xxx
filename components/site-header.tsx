// components/site-header.tsx
"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
} from "@/components/ui/navigation-menu"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { Menu } from "lucide-react"

const navItems = [
  { title: "Features", href: "/#features" },
  { title: "Pricing", href: "/#pricing" },
  { title: "Showcase", href: "/#showcase" },
  { title: "FAQ", href: "/#faq" },
]

export function SiteHeader({ className }: { className?: string }) {
  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur",
        className
      )}
    >
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          {/* Ersetze das Logo nach Bedarf */}
          <div className="grid size-8 place-items-center rounded-md bg-primary text-primary-foreground">
            <span className="text-xs font-bold">PPP</span>
          </div>
          <span className="hidden text-sm font-semibold sm:inline-block">
            PPP.io
          </span>
        </Link>

        {/* Desktop-Navigation */}
        <div className="ml-4 hidden flex-1 sm:block">
          <NavigationMenu>
            <NavigationMenuList>
              {navItems.map((it) => (
                <NavigationMenuItem key={it.href}>
                  <Link href={it.href} legacyBehavior passHref>
                    <NavigationMenuLink className="px-3 py-2 text-sm hover:underline underline-offset-4">
                      {it.title}
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* Login-Button: immer sichtbar */}
        <div className="ml-auto flex items-center gap-2">
          <Button asChild size="sm">
            <Link href="/login">Login</Link>
          </Button>

          {/* Mobile-Menü-Trigger (Menüpunkte im Sheet) */}
          <Sheet>
            <SheetTrigger
              className="inline-flex items-center justify-center rounded-md p-2 hover:bg-accent sm:hidden"
              aria-label="Open menu"
            >
              <Menu className="size-5" />
            </SheetTrigger>
            <SheetContent side="left" className="w-72">
              <div className="mt-6 grid gap-2">
                {navItems.map((it) => (
                  <Link
                    key={it.href}
                    href={it.href}
                    className="rounded-md px-2 py-2 text-sm hover:bg-accent"
                  >
                    {it.title}
                  </Link>
                ))}
                <div className="pt-2">
                  <Button asChild className="w-full">
                    <Link href="/login">Login</Link>
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
