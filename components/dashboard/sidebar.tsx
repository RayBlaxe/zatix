"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  BarChart3,
  CalendarDays,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  Settings,
  Users,
  ChevronDown,
  ChevronRight,
  FileText,
  Home,
  DollarSign,
} from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useState } from "react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

export function DashboardSidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const router = useRouter()
  const [contentManagementOpen, setContentManagementOpen] = useState(pathname.startsWith("/dashboard/content"))

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  const routes = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      href: "/dashboard",
      active: pathname === "/dashboard",
    },
    {
      label: "Events",
      icon: CalendarDays,
      href: "/dashboard/events",
      active: pathname === "/dashboard/events" || pathname.startsWith("/dashboard/events/"),
    },
    {
      label: "Finance",
      icon: BarChart3,
      href: "/dashboard/finance",
      active: pathname === "/dashboard/finance",
    },
    {
      label: "Roles & Permissions",
      icon: Users,
      href: "/dashboard/roles",
      active: pathname === "/dashboard/roles",
    },
  ]

  const contentManagementRoutes = [
    {
      label: "Home",
      icon: Home,
      href: "/dashboard/content/home",
      active: pathname === "/dashboard/content/home",
    },
    {
      label: "Pricing",
      icon: DollarSign,
      href: "/dashboard/content/pricing",
      active: pathname === "/dashboard/content/pricing",
    },
    {
      label: "Articles",
      icon: FileText,
      href: "/dashboard/content/articles",
      active: pathname === "/dashboard/content/articles" || pathname.startsWith("/dashboard/content/articles/"),
    },
  ]

  return (
    <div className="flex h-full flex-col border-r bg-background">
      <div className="flex h-14 items-center border-b px-4">
        <Link href="/" className="flex items-center gap-2">
          <CalendarDays className="size-5" />
          <span className="font-bold">EventHub</span>
        </Link>
      </div>
      <div className="flex-1 overflow-auto py-2">
        <nav className="grid items-start px-2 gap-1">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                route.active ? "bg-accent text-accent-foreground" : "transparent",
              )}
            >
              <route.icon className="size-4" />
              {route.label}
            </Link>
          ))}

          <Collapsible open={contentManagementOpen} onOpenChange={setContentManagementOpen}>
            <CollapsibleTrigger asChild>
              <button
                className={cn(
                  "flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                  pathname.startsWith("/dashboard/content") ? "bg-accent text-accent-foreground" : "transparent",
                )}
              >
                <FileText className="size-4" />
                Content Management
                {contentManagementOpen ? (
                  <ChevronDown className="ml-auto size-4" />
                ) : (
                  <ChevronRight className="ml-auto size-4" />
                )}
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-1">
              {contentManagementRoutes.map((route) => (
                <Link
                  key={route.href}
                  href={route.href}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 ml-4 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                    route.active ? "bg-accent text-accent-foreground" : "transparent",
                  )}
                >
                  <route.icon className="size-3" />
                  {route.label}
                </Link>
              ))}
            </CollapsibleContent>
          </Collapsible>
        </nav>
      </div>
      <div className="mt-auto border-t p-4">
        <div className="flex items-center gap-2 mb-4">
          <Avatar className="size-8">
            <AvatarFallback>{user?.name.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <p className="text-sm font-medium leading-none">{user?.name}</p>
            <p className="text-xs text-muted-foreground">{user?.email}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/settings">
              <Settings className="me-2 size-4" />
              Settings
            </Link>
          </Button>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="me-2 size-4" />
            Logout
          </Button>
        </div>
      </div>
    </div>
  )
}
