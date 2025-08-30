"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Users, 
  Ticket, 
  DollarSign,
  Edit,
  Share,
  MoreVertical,
  Eye,
  Settings,
  Shield
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { EventStaffManagement } from "@/components/dashboard/event-staff-management"
import { Event } from "@/types/events"
import { useAuth } from "@/hooks/use-auth"
import { eventApi, getEventPosterUrl } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"

interface EventDetailsPageProps {
  eventId: number
}

export function EventDetailsPage({ eventId }: EventDetailsPageProps) {
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const isEOOwner = user?.roles?.includes("eo-owner")
  const isEventPIC = user?.roles?.includes("event-pic")
  const canManageEvent = isEOOwner || isEventPIC

  useEffect(() => {
    loadEventDetails()
  }, [eventId])

  const loadEventDetails = async () => {
    try {
      setLoading(true)
      const response = await eventApi.getMyEvent(eventId)
      setEvent(response.data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load event details",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleEditEvent = () => {
    router.push(`/dashboard/events/${eventId}/edit`)
  }

  const handleShareEvent = () => {
    const eventUrl = `${window.location.origin}/events/${eventId}`
    navigator.clipboard.writeText(eventUrl)
    toast({
      title: "Link Copied",
      description: "Event link copied to clipboard",
    })
  }

  const handlePreviewEvent = () => {
    window.open(`/events/${eventId}`, "_blank")
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-300 rounded w-1/3"></div>
          <div className="h-64 bg-gray-300 rounded"></div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-300 rounded w-3/4"></div>
            <div className="h-4 bg-gray-300 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="text-center py-12">
            <h2 className="text-xl font-semibold mb-2">Event Not Found</h2>
            <p className="text-muted-foreground mb-4">
              The event you're looking for doesn't exist or you don't have permission to view it.
            </p>
            <Button onClick={() => router.push("/dashboard/events")}>
              Back to Events
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{event.name}</h1>
          <p className="text-muted-foreground">
            Event Details & Management
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handlePreviewEvent}>
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button variant="outline" onClick={handleShareEvent}>
            <Share className="h-4 w-4 mr-2" />
            Share
          </Button>
          {canManageEvent && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleEditEvent}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Event
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push(`/dashboard/events/${eventId}/settings`)}>
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push(`/dashboard/events/${eventId}/limits`)}>
                  <Shield className="h-4 w-4 mr-2" />
                  Ticket Limits
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive">
                  Delete Event
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Event Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-6">
              <div className="aspect-video relative mb-4 rounded-lg overflow-hidden">
                <Image
                  src={getEventPosterUrl(event.poster)}
                  alt={event.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">About This Event</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {event.description}
                  </p>
                </div>
                <Separator />
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Event Status</h4>
                    <Badge 
                      variant={event.status === "active" ? "default" : "secondary"}
                    >
                      {event.status}
                    </Badge>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Published</h4>
                    <Badge 
                      variant={event.is_published ? "default" : "secondary"}
                    >
                      {event.is_published ? "Published" : "Draft"}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Quick Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Event Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">{formatDate(event.start_date)}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatTime(`${event.start_date}T${event.start_time}`)} - {formatTime(`${event.end_date}T${event.end_time}`)}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">{event.location}</p>
                  <p className="text-sm text-muted-foreground">Venue</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">{event.tickets.reduce((total, ticket) => total + ticket.stock, 0)} tickets</p>
                  <p className="text-sm text-muted-foreground">Total available</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <DollarSign className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">
                    {event.tickets.length > 0 ? 
                      `${formatCurrency(Math.min(...event.tickets.map(t => parseFloat(t.price))))} - ${formatCurrency(Math.max(...event.tickets.map(t => parseFloat(t.price))))}` :
                      "Free"
                    }
                  </p>
                  <p className="text-sm text-muted-foreground">Price range</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Tickets Sold</span>
                <span className="text-xl font-bold">128</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Revenue</span>
                <span className="text-xl font-bold">{formatCurrency(1250000)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Views</span>
                <span className="text-xl font-bold">1,247</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tabs Section */}
      <Tabs defaultValue="staff" className="space-y-4">
        <TabsList>
          <TabsTrigger value="staff">Staff Management</TabsTrigger>
          <TabsTrigger value="tickets">Tickets</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="staff">
          <EventStaffManagement 
            eventId={eventId}
            eventTitle={event.name}
            isEventPIC={isEventPIC}
            isEOOwner={isEOOwner}
          />
        </TabsContent>

        <TabsContent value="tickets">
          <Card>
            <CardHeader>
              <CardTitle>Ticket Management</CardTitle>
              <CardDescription>
                Manage ticket sales and attendance for this event
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <Ticket className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Ticket management coming soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Event Analytics</CardTitle>
              <CardDescription>
                View detailed analytics for this event
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Analytics dashboard coming soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Event Settings</CardTitle>
              <CardDescription>
                Configure advanced settings for this event
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Settings panel coming soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
