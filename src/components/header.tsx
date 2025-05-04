import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CalendarDays, Menu, Plus } from "lucide-react"

export function Header() {
  return (
    <header className="sticky top-0 z-10 border-b bg-background">
      <div className="container flex h-16 items-center justify-between py-4">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <CalendarDays className="h-6 w-6" />
            <span className="text-xl font-bold">EventHub</span>
          </Link>
        </div>

        <div className="hidden md:flex items-center gap-6">
          <nav className="flex items-center gap-6">
            <Link href="/" className="text-sm font-medium">
              Home
            </Link>
            <Link href="/dashboard" className="text-sm font-medium">
              Dashboard
            </Link>
            <Link href="#" className="text-sm font-medium">
              Explore
            </Link>
            <Link href="#" className="text-sm font-medium">
              About
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            <Link href="/terms-and-conditions">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Event
              </Button>
            </Link>
            <Button variant="outline">Sign In</Button>
          </div>
        </div>

        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </div>
    </header>
  )
}
