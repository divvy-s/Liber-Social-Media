"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Home, User, Bell, MessageSquare, Search } from "lucide-react"

export function MainNav() {
  const pathname = usePathname()

  const routes = [
    {
      href: "/app",
      label: "Home",
      icon: Home,
      active: pathname === "/app",
    },
    {
      href: "/explore",
      label: "Explore",
      icon: Search,
      active: pathname === "/explore",
    },
    {
      href: "/notifications",
      label: "Notifications",
      icon: Bell,
      active: pathname === "/notifications",
    },
    {
      href: "/messages",
      label: "Messages",
      icon: MessageSquare,
      active: pathname === "/messages",
    },
    {
      href: "/profile",
      label: "Profile",
      icon: User,
      active: pathname === "/profile",
    },
  ]

  return (
    <nav className="flex items-center space-x-4 lg:space-x-6">
      <Link href="/app" className="flex items-center">
        <span className="text-xl font-bold neon-text">Liber</span>
      </Link>
      <div className="hidden md:flex items-center space-x-4 lg:space-x-6">
        {routes.map((route) => (
          <Link
            key={route.href}
            href={route.href}
            className={cn(
              "flex items-center text-sm font-medium transition-colors hover:text-primary",
              route.active ? "text-primary neon-text" : "text-muted-foreground",
            )}
          >
            <route.icon className="w-5 h-5 mr-2" />
            {route.label}
          </Link>
        ))}
      </div>
      <div className="flex md:hidden items-center space-x-4">
        {routes.map((route) => (
          <Link
            key={route.href}
            href={route.href}
            className={cn(
              "flex items-center text-sm font-medium transition-colors hover:text-primary",
              route.active ? "text-primary neon-text" : "text-muted-foreground",
            )}
          >
            <route.icon className="w-5 h-5" />
          </Link>
        ))}
      </div>
    </nav>
  )
}

