"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { CalendarDays, Menu, Plus, Ticket, ShoppingCart, Info, User, Settings, LogOut, Crown, Store, UserCheck, PlusCircle, Loader2 } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { UserRole } from "@/types/auth"
import { UserAccountNav } from "@/components/user-account-nav"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

export function Header() {
  const { isAuthenticated, user, logout, switchRole, hasRole, canAccessDashboard } = useAuth()
  const currentRole = user?.currentRole
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

  return (
    <header className="sticky top-0 z-10 border-b bg-background">
      <div className="container flex h-16 items-center justify-between py-4">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <Image 
              src="/zatix-logo.png" 
              alt="ZaTix Logo" 
              width={80} 
              height={80}
              className="h-16 w-auto sm:h-18 md:h-20"
            />
          </Link>
        </div>

        <div className="hidden md:flex items-center gap-6">
          <nav className="flex items-center gap-6">
            <Link href="/" className="text-sm font-medium">
              Home
            </Link>
            
            {/* Event Organizer Role Navigation */}
            {isAuthenticated && (currentRole === "eo-owner" || currentRole === "super-admin") && (
              <Link href="/dashboard" className="text-sm font-medium">
                Dashboard
              </Link>
            )}
            
            {/* Customer Navigation */}
            {isAuthenticated && currentRole === "customer" && (
              <>
                <Link href="/events/browse" className="text-sm font-medium">
                  Explore
                </Link>
                <Link href="/about" className="text-sm font-medium">
                  About
                </Link>
              </>
            )}
            
            {/* Non-authenticated Navigation */}
            {!isAuthenticated && (
              <>
                <Link href="/events/browse" className="text-sm font-medium">
                  Explore
                </Link>
                <Link href="/about" className="text-sm font-medium">
                  About
                </Link>
              </>
            )}
          </nav>

          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <>
                {/* Event Organizer Actions */}
                {(currentRole === "eo-owner" || currentRole === "super-admin") && (
                  <Link href="/terms-and-conditions?for=event">
                    <Button>
                      <Plus className="mr-2 size-4" />
                      Create Event
                    </Button>
                  </Link>
                )}
                
                {/* Customer Actions */}
                {currentRole === "customer" && (
                  <Link href="/my-tickets">
                    <Button variant="outline">
                      <ShoppingCart className="mr-2 size-4" />
                      My Tickets
                    </Button>
                  </Link>
                )}
                
                <UserAccountNav />
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="outline">Sign In</Button>
                </Link>
                <Link href="/register">
                  <Button>Sign Up</Button>
                </Link>
              </>
            )}
          </div>
        </div>

        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="size-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px] sm:w-[400px]">
            <div className="flex flex-col space-y-4 mt-8">
              <nav className="flex flex-col space-y-4">
                <Link href="/" className="text-lg font-medium hover:text-primary">
                  Home
                </Link>
                
                {/* Event Organizer Navigation */}
                {isAuthenticated && (currentRole === "eo-owner" || currentRole === "super-admin") && (
                  <Link href="/dashboard" className="text-lg font-medium hover:text-primary">
                    Dashboard
                  </Link>
                )}
                
                {/* Customer Navigation */}
                {isAuthenticated && currentRole === "customer" && (
                  <>
                    <Link href="/events" className="text-lg font-medium hover:text-primary">
                      Explore
                    </Link>
                    <Link href="/about" className="text-lg font-medium hover:text-primary">
                      About
                    </Link>
                  </>
                )}
                
                {/* Non-authenticated Navigation */}
                {!isAuthenticated && (
                  <>
                    <Link href="/events" className="text-lg font-medium hover:text-primary">
                      Explore
                    </Link>
                    <Link href="/about" className="text-lg font-medium hover:text-primary">
                      About
                    </Link>
                  </>
                )}
              </nav>

              <div className="flex flex-col space-y-3 pt-4 border-t">
                {isAuthenticated ? (
                  <>
                    {/* Event Organizer Actions */}
                    {(currentRole === "eo-owner" || currentRole === "super-admin") && (
                      <Link href="/terms-and-conditions?for=event">
                        <Button className="w-full justify-start">
                          <Plus className="mr-2 size-4" />
                          Create Event
                        </Button>
                      </Link>
                    )}
                    
                    {/* Customer Actions */}
                    {currentRole === "customer" && (
                      <Link href="/my-tickets">
                        <Button variant="outline" className="w-full justify-start">
                          <ShoppingCart className="mr-2 size-4" />
                          My Tickets
                        </Button>
                      </Link>
                    )}
                    
                    {/* Profile Menu Section */}
                    <div className="pt-2 border-t">
                      <div className="flex items-center space-x-3 pb-3">
                        <Avatar className="size-8">
                          <AvatarFallback>{user?.name?.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <p className="text-sm font-medium leading-none">{user?.name}</p>
                          <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                          <div className="flex items-center mt-1">
                            {user?.currentRole && getRoleIcon(user.currentRole)}
                            <p className="text-xs leading-none text-muted-foreground">
                              {user?.currentRole && getRoleLabel(user.currentRole)}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Role Switching Section */}
                      {user?.roles && user.roles.length > 1 && (
                        <>
                          <div className="pb-2">
                            <p className="text-xs font-semibold text-muted-foreground mb-2">Switch Role</p>
                            <div className="space-y-1">
                              {user.roles.map((role) => (
                                <Button
                                  key={role}
                                  variant={user.currentRole === role ? "secondary" : "ghost"}
                                  size="sm"
                                  className="w-full justify-start h-8"
                                  onClick={() => handleRoleSwitch(role)}
                                >
                                  {getRoleIcon(role)}
                                  <span>{getRoleLabel(role)}</span>
                                  {user.currentRole === role && (
                                    <span className="ml-auto text-xs text-muted-foreground">Current</span>
                                  )}
                                </Button>
                              ))}
                            </div>
                          </div>
                        </>
                      )}
                      
                      {/* Profile Menu Items */}
                      <div className="space-y-1 pt-2 border-t">
                        <Link href="/profile">
                          <Button variant="ghost" size="sm" className="w-full justify-start h-8">
                            <User className="mr-2 size-4" />
                            <span>Profile</span>
                          </Button>
                        </Link>
                        <Link href="/settings">
                          <Button variant="ghost" size="sm" className="w-full justify-start h-8">
                            <Settings className="mr-2 size-4" />
                            <span>Settings</span>
                          </Button>
                        </Link>
                        
                        {/* Role-based menu items */}
                        {user?.currentRole === "customer" && (
                          <>
                            <Link href="/events">
                              <Button variant="ghost" size="sm" className="w-full justify-start h-8">
                                <PlusCircle className="mr-2 size-4" />
                                <span>Browse Events</span>
                              </Button>
                            </Link>
                            <Link href="/my-tickets">
                              <Button variant="ghost" size="sm" className="w-full justify-start h-8">
                                <Ticket className="mr-2 size-4" />
                                <span>My Tickets</span>
                              </Button>
                            </Link>
                          </>
                        )}
                        {(user?.currentRole === "eo-owner" || user?.currentRole === "super-admin") && (
                          <Link href="/dashboard">
                            <Button variant="ghost" size="sm" className="w-full justify-start h-8">
                              <Store className="mr-2 size-4" />
                              <span>Dashboard</span>
                            </Button>
                          </Link>
                        )}
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full justify-start h-8"
                          onClick={handleLogout}
                          disabled={isLoggingOut}
                        >
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
                        </Button>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <Link href="/login">
                      <Button variant="outline" className="w-full">Sign In</Button>
                    </Link>
                    <Link href="/register">
                      <Button className="w-full">Sign Up</Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}
