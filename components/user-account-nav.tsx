"use client"

import { useAuth } from "@/hooks/use-auth"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { LogOut, PlusCircle, Settings, User, Crown, Store, UserCheck, Ticket } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useState } from "react"
import { Loader2 } from "lucide-react"
import { UserRole } from "@/types/auth"

export function UserAccountNav() {
  const { user, logout, switchRole, hasRole, canAccessDashboard } = useAuth()
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await logout()
      router.push("/")
    } catch (error) {
      console.error("Logout failed:", error)
    } finally {
      setIsLoggingOut(false)
    }
  }

  const handleRoleSwitch = (newRole: UserRole) => {
    switchRole(newRole)
    // Redirect based on role
    if (newRole === "customer") {
      router.push("/")
    } else if (newRole === "eo-owner" || newRole === "super-admin") {
      router.push("/dashboard")
    }
  }

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case "customer":
        return <UserCheck className="mr-2 size-4" />
      case "eo-owner":
        return <Store className="mr-2 size-4" />
      case "super-admin":
        return <Crown className="mr-2 size-4" />
      default:
        return <User className="mr-2 size-4" />
    }
  }

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case "customer":
        return "Customer"
      case "eo-owner":
        return "Event Organizer"
      case "super-admin":
        return "Super Admin"
      default:
        return role
    }
  }

  if (!user || !user.name || !user.email || !user.roles || !user.currentRole) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative size-8 rounded-full">
          <Avatar className="size-8">
            <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.name}</p>
            <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
            <div className="flex items-center mt-1">
              {getRoleIcon(user.currentRole)}
              <p className="text-xs leading-none text-muted-foreground">
                {getRoleLabel(user.currentRole)}
              </p>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {/* Role Switching Section */}
        {user.roles && user.roles.length > 1 && (
          <>
            <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground px-2">
              Switch Role
            </DropdownMenuLabel>
            {user.roles.map((role) => (
              <DropdownMenuItem
                key={role}
                onClick={() => handleRoleSwitch(role)}
                className={user.currentRole === role ? "bg-accent" : ""}
              >
                {getRoleIcon(role)}
                <span>{getRoleLabel(role)}</span>
                {user.currentRole === role && (
                  <span className="ml-auto text-xs text-muted-foreground">Current</span>
                )}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
          </>
        )}
        
        <DropdownMenuItem asChild>
          <Link href="/profile">
            <User className="mr-2 size-4" />
            <span>Profile</span>
          </Link>
        </DropdownMenuItem>
        
        
        {/* Role-based menu items */}
        {user.currentRole === "customer" && (
          <>
            <DropdownMenuItem asChild>
              <Link href="/events">
                <PlusCircle className="mr-2 size-4" />
                <span>Browse Events</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/my-tickets">
                <Ticket className="mr-2 size-4" />
                <span>My Tickets</span>
              </Link>
            </DropdownMenuItem>
          </>
        )}
        {(user.currentRole === "eo-owner" || user.currentRole === "super-admin") && (
          <DropdownMenuItem asChild>
            <Link href="/dashboard">
              <Store className="mr-2 size-4" />
              <span>Dashboard</span>
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} disabled={isLoggingOut}>
          {isLoggingOut ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              <span>Logging out...</span>
            </>
          ) : (
            <>
              <LogOut className="mr-2 size-4" />
              <span>Log out</span>
            </>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
