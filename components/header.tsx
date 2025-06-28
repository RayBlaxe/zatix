"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CalendarDays, Menu, Plus, Ticket, ShoppingCart, Info} from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { UserAccountNav } from "@/components/user-account-nav"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

export function Header() {
  const { isAuthenticated, user } = useAuth()
  const currentRole = user?.currentRole

  return (
    <header className="sticky top-0 z-10 border-b bg-background">
      <div className="container flex h-16 items-center justify-between py-4">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <Ticket className="size-6" />
            <span className="text-xl font-bold">ZaTix</span>
          </Link>
        </div>

        <div className="hidden md:flex items-center gap-6">
          <nav className="flex items-center gap-6">
            <Link href="/" className="text-sm font-medium">
              Home
            </Link>
            
            {/* Event Organizer Navigation */}
            {isAuthenticated && (currentRole === "eo-owner" || currentRole === "super-admin") && (
              <Link href="/dashboard" className="text-sm font-medium">
                Dashboard
              </Link>
            )}
            
            {/* Customer Navigation */}
            {isAuthenticated && currentRole === "customer" && (
              <>
                <Link href="/events" className="text-sm font-medium">
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
                <Link href="/events" className="text-sm font-medium">
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
                    
                    <div className="pt-2">
                      <UserAccountNav />
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
