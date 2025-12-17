// components/home-header.tsx
"use client"

import * as React from "react"
import Link from "next/link"
import { Menu, Search, X, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useSidebar } from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"
import { logoutAction } from "@/app/(auth)/actions"
import { useTransition } from "react"
import { ThemeSwitcher } from "@/components/ui/shadcn-io/theme-switcher"

type UIUser = {
  name: string
  email: string
  avatar: string
}

export function HomeHeader({ user }: { user?: UIUser }) {
  const [searchOpen, setSearchOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [pending, startTransition] = useTransition()
  const { toggleSidebar } = useSidebar()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implement search functionality
    console.log("Search:", searchQuery)
  }

  const onLogout = () => {
    startTransition(async () => {
      await logoutAction()
    })
  }

  const initials = user?.name
    ?.split(" ")
    .map((p) => p[0])
    .join("")
    .toUpperCase() || "U"

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-1 px-3 sm:px-4">
        {/* Mobile: Hamburger (links) */}
        <div className="md:hidden flex items-center gap-1 flex-shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="size-9"
            onClick={toggleSidebar}
            aria-label="Menü öffnen"
          >
            <Menu className="size-6" />
          </Button>
        </div>


        {/* Desktop: Search Bar */}
        <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-4">
          <div className="relative flex-1">
            <Input
              type="search"
              placeholder="Suchen..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10"
            />
            <Button
              type="submit"
              size="sm"
              variant="ghost"
              className="absolute right-0 top-0 h-full px-3"
              aria-label="Suchen"
            >
              <Search className="size-4" />
            </Button>
          </div>
        </form>

        {/* Mobile: Search + Auth Buttons (rechtsbündig) */}
        <div className="md:hidden flex items-center gap-1 ml-auto">
          <Button
            variant="ghost"
            size="icon"
            className="size-9"
            onClick={() => setSearchOpen(!searchOpen)}
            aria-label="Suchen"
          >
            {searchOpen ? <X className="size-6" /> : <Search className="size-6" />}
          </Button>
          <ThemeSwitcher />
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="text-base">
                  <User className="size-6" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-base md:text-sm font-medium">{user.name}</p>
                    <p className="text-sm md:text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild className="text-base md:text-sm">
                  <Link href="/account">Account</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="text-base md:text-sm">
                  <Link href="/settings">Einstellungen</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={onLogout} disabled={pending} className="text-base md:text-sm">
                  {pending ? "Wird abgemeldet..." : "Abmelden"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button asChild size="sm" variant="outline" className="text-xs h-8 px-2">
                <Link href="/login">Anmelden</Link>
              </Button>
              <Button asChild size="sm" className="text-xs h-8 px-2">
                <Link href="/signup">Registrieren</Link>
              </Button>
            </>
          )}
        </div>

        {/* Desktop: Auth Buttons oder User Menu */}
        <div className="hidden md:flex items-center gap-2 ml-auto">
          <ThemeSwitcher />
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2">
                  <Avatar className="h-7 w-7">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                  </Avatar>
                  <span className="hidden lg:inline-block">Mein Konto</span>
                  <User className="size-4 lg:hidden" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/account">Account</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings">Einstellungen</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={onLogout} disabled={pending}>
                  {pending ? "Wird abgemeldet..." : "Abmelden"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button asChild size="sm" variant="outline">
                <Link href="/login">Anmelden</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/signup">Registrieren</Link>
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Mobile: Expandable Search Bar */}
      {searchOpen && (
        <div className="border-t px-3 py-2 md:hidden">
          <form onSubmit={handleSearch} className="flex gap-2">
            <Input
              type="search"
              placeholder="Suchen..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
              autoFocus
            />
            <Button type="submit" size="sm">
              Suchen
            </Button>
          </form>
        </div>
      )}
    </header>
  )
}

