// components/bottom-nav.tsx
"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { MessageCircle, Radio, Video, Image, User } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { 
    title: "Chat", 
    url: "/home/chat", 
    icon: MessageCircle,
  },
  { 
    title: "Cams", 
    url: "/home/live", 
    icon: Radio,
  },
  { 
    title: "Videos", 
    url: "/home/videos", 
    icon: Video,
  },
  { 
    title: "Bilder", 
    url: "/home/images", 
    icon: Image,
  },
  { 
    title: "Account", 
    url: "/account", 
    icon: User,
  },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-background border-t border-border shadow-[0_-2px_8px_rgba(0,0,0,0.05)] pb-safe standalone:pb-6">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.url || 
            (item.url === "/home/chat" && pathname?.startsWith("/home/chat")) ||
            (item.url === "/home/live" && pathname?.startsWith("/home/live")) ||
            (item.url === "/home/videos" && pathname?.startsWith("/home/videos")) ||
            (item.url === "/home/images" && pathname?.startsWith("/home/images")) ||
            (item.url === "/account" && pathname?.startsWith("/account"))

          return (
            <Link
              key={item.url}
              href={item.url}
              className={cn(
                "flex flex-col items-center justify-center min-w-[44px] min-h-[44px] px-3 py-2 rounded-lg transition-all duration-200 active:scale-95",
                "focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:ring-offset-2"
              )}
            >
              <div className="relative flex items-center justify-center">
                {isActive ? (
                  <Icon className="size-5 fill-current text-purple-600 transition-all" />
                ) : (
                  <Icon className="size-5 text-muted-foreground opacity-70 transition-all" strokeWidth={2} />
                )}
              </div>
              <span
                className={cn(
                  "text-[10px] leading-tight mt-0.5 transition-colors",
                  isActive
                    ? "font-semibold text-purple-600"
                    : "font-normal text-muted-foreground opacity-70"
                )}
              >
                {item.title}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

