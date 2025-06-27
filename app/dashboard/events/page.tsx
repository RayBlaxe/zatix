import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarPlus, Plus } from "lucide-react"

export default function EventsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Events</h1>
          <p className="text-muted-foreground">Manage your events and create new ones.</p>
        </div>
        <Link href="/terms-and-conditions?for=event">
          <Button>
            <Plus className="mr-2 size-4" />
            Create Event
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="flex flex-col justify-between">
          <CardHeader>
            <CardTitle>Create Your First Event</CardTitle>
            <CardDescription>Get started by creating your first event</CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="flex h-40 items-center justify-center rounded-md border-2 border-dashed">
              <div className="flex flex-col items-center gap-1 text-center">
                <CalendarPlus className="size-10 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">No events created yet</p>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Link href="/terms-and-conditions?for=event" className="w-full">
              <Button className="w-full">
                <Plus className="mr-2 size-4" />
                Create Event
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>

      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <h3 className="text-lg font-medium">Free Account Limitations</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Your free account is limited to 1 event with a maximum of 10 participants. Upgrade your account to create more
          events and increase participant limits.
        </p>
        <div className="mt-4">
          <Button variant="outline">Upgrade Account</Button>
        </div>
      </div>
    </div>
  )
}
