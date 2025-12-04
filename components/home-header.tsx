// components/home-header.tsx
"use client"

import * as React from "react"
import Link from "next/link"
import { Menu, Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

export function HomeHeader() {
  const [searchOpen, setSearchOpen] = React.useState(false)
  const [sidebarOpen, setSidebarOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState("")

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implement search functionality
    console.log("Search:", searchQuery)
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-2 px-3 sm:px-4">
        {/* Mobile: Hamburger Menu */}
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetTrigger
            className="inline-flex items-center justify-center rounded-md p-2 hover:bg-accent md:hidden"
            aria-label="Open menu"
          >
            <Menu className="size-5" />
          </SheetTrigger>
          <SheetContent side="left" className="w-72">
            <div className="mt-6 grid gap-4">
              <Link
                href="/home"
                onClick={() => setSidebarOpen(false)}
                className="rounded-md px-4 py-2 text-sm hover:bg-accent font-medium"
              >
                Home
              </Link>
              <Link
                href="/categories"
                onClick={() => setSidebarOpen(false)}
                className="rounded-md px-4 py-2 text-sm hover:bg-accent"
              >
                Kategorien
              </Link>
              <Link
                href="/creators"
                onClick={() => setSidebarOpen(false)}
                className="rounded-md px-4 py-2 text-sm hover:bg-accent"
              >
                Creator
              </Link>
              <Link
                href="/trending"
                onClick={() => setSidebarOpen(false)}
                className="rounded-md px-4 py-2 text-sm hover:bg-accent"
              >
                Trending
              </Link>
              <div className="pt-4 border-t space-y-2">
                <Button asChild className="w-full">
                  <Link href="/signup">Registrieren</Link>
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/login">Anmelden</Link>
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>

        {/* Logo */}
        <Link href="/home" className="flex items-center gap-2 flex-shrink-0">
          <img
            src="https://placehold.it/32x32"
            alt="SaucySilk"
            className="size-8 rounded-md"
          />
          <span className="hidden text-sm font-semibold sm:inline-block">
            SaucySilk
          </span>
        </Link>

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

        {/* Desktop: Navigation Links */}
        <nav className="hidden lg:flex items-center gap-4 ml-auto">
          <Link href="/categories" className="text-sm hover:underline underline-offset-4">
            Kategorien
          </Link>
          <Link href="/creators" className="text-sm hover:underline underline-offset-4">
            Creator
          </Link>
          <Link href="/trending" className="text-sm hover:underline underline-offset-4">
            Trending
          </Link>
        </nav>

        {/* Desktop: Auth Buttons */}
        <div className="hidden md:flex items-center gap-2 ml-auto lg:ml-4">
          <Button asChild size="sm" variant="outline">
            <Link href="/login">Anmelden</Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/signup">Registrieren</Link>
          </Button>
        </div>

        {/* Mobile: Search Button */}
        <Button
          variant="ghost"
          size="sm"
          className="md:hidden ml-auto"
          onClick={() => setSearchOpen(!searchOpen)}
          aria-label="Suchen"
        >
          {searchOpen ? <X className="size-5" /> : <Search className="size-5" />}
        </Button>
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

