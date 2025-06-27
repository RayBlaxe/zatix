"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CalendarDays, Menu, Plus, Ticket} from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { UserAccountNav } from "@/components/user-account-nav"

export function Header() {
  const { isAuthenticated } = useAuth()

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
            {isAuthenticated && (
              <Link href="/dashboard" className="text-sm font-medium">
                Dashboard
              </Link>
            )}
            <Link href="#" className="text-sm font-medium">
              Explore
            </Link>
            <Link href="#" className="text-sm font-medium">
              About
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <>
                <Link href="/terms-and-conditions?for=event">
                  <Button>
                    <Plus className="mr-2 size-4" />
                    Create Event
                  </Button>
                </Link>
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

        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="size-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </div>
    </header>
  )
}
