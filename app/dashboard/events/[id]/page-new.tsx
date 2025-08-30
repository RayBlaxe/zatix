"use client"

import { useParams } from "next/navigation"
import { EventDetailsPage } from "@/components/dashboard/event-details-page"

export default function EventPage() {
  const params = useParams()
  const eventId = parseInt(params.id as string)

  if (isNaN(eventId)) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center">
          <h1 className="text-xl font-semibold mb-2">Invalid Event ID</h1>
          <p className="text-muted-foreground">The event ID provided is not valid.</p>
        </div>
      </div>
    )
  }

  return <EventDetailsPage eventId={eventId} />
}
