"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { TicketLimitManagement } from "@/components/dashboard/ticket-limit-management"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { eventApi } from "@/lib/api"
import { Event } from "@/types/events"
import { useAuth } from "@/hooks/use-auth"
import { Shield, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

export default function EventLimitsPage() {
  const params = useParams()
  const router = useRouter()
  const { hasRole } = useAuth()
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (params.id) {
      loadEvent()
    }
  }, [params.id])

  const loadEvent = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await eventApi.getMyEvent(Number(params.id))
      
      if (response.success) {
        setEvent(response.data)
      } else {
        setError(response.message || "Failed to load event")
      }
    } catch (err) {
      setError("An error occurred while loading the event")
      console.error("Error loading event:", err)
    } finally {
      setLoading(false)
    }
  }

  // Check permissions
  if (!hasRole("eo-owner") && !hasRole("event-pic") && !hasRole("super-admin")) {
    return (
      <div className="container py-8">
        <Alert variant="destructive">
          <Shield className="h-4 w-4" />
          <AlertDescription>
            You don't have permission to manage ticket limits for this event.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="container py-8 space-y-6">
        <div className="flex items-center gap-4">
          <div className="h-8 w-8 bg-gray-300 rounded animate-pulse"></div>
          <div className="h-8 w-48 bg-gray-300 rounded animate-pulse"></div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-300 rounded animate-pulse"></div>
          ))}
        </div>
        <div className="h-96 bg-gray-300 rounded animate-pulse"></div>
      </div>
    )
  }

  if (error || !event) {
    return (
      <div className="container py-8">
        <Button 
          variant="ghost" 
          onClick={() => router.back()}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 size-4" />
          Back
        </Button>
        <Alert variant="destructive">
          <AlertDescription>
            {error || "Event not found"}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="mb-6">
        <Button 
          variant="ghost" 
          onClick={() => router.back()}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 size-4" />
          Back to Event
        </Button>
        <div className="flex items-center gap-3 mb-2">
          <Shield className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold">Ticket Limits</h1>
        </div>
        <p className="text-muted-foreground">
          Manage purchase limits for <span className="font-medium">{event.name}</span>
        </p>
      </div>

      {/* Event Info Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Event Information</CardTitle>
          <CardDescription>Current event details and ticket overview</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <h4 className="font-medium text-sm text-muted-foreground">Event Name</h4>
              <p className="font-medium">{event.name}</p>
            </div>
            <div>
              <h4 className="font-medium text-sm text-muted-foreground">Date & Time</h4>
              <p className="font-medium">
                {new Date(event.start_date).toLocaleDateString("id-ID")} at {event.start_time}
              </p>
            </div>
            <div>
              <h4 className="font-medium text-sm text-muted-foreground">Total Ticket Types</h4>
              <p className="font-medium">{event.tickets?.length || 0} types</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ticket Limits Management */}
      {event.tickets && event.tickets.length > 0 ? (
        <TicketLimitManagement 
          eventId={event.id} 
          tickets={event.tickets.map(ticket => ({
            id: ticket.id,
            name: ticket.name,
            price: ticket.price,
            stock: ticket.stock,
            limit: ticket.limit
          }))}
        />
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-medium mb-2">No Tickets Found</h3>
            <p className="text-muted-foreground">
              This event doesn't have any tickets configured yet. 
              Please add tickets to the event before managing limits.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
