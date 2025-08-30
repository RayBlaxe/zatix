"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator 
} from "@/components/ui/dropdown-menu"
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  MapPin, 
  Phone, 
  Users, 
  DollarSign, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff,
  Globe,
  Lock,
  Image as ImageIcon,
  CheckCircle,
  XCircle,
  AlertCircle,
  Archive,
  Pause,
  MoreHorizontal
} from "lucide-react"
import { format } from "date-fns"
import { eventApi, getEventPosterUrl } from "@/lib/api"
import { Event } from "@/types/events"
import { useAuth } from "@/hooks/use-auth"
import { toast } from "@/components/ui/use-toast"

export default function EventDetailPage() {
  const { user } = useAuth()
  const router = useRouter()
  const params = useParams()
  const eventId = parseInt(params.id as string)

  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (eventId) {
      fetchEventDetail()
    }
  }, [eventId])

  const fetchEventDetail = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await eventApi.getMyEvent(eventId)
      
      if (response.success) {
        setEvent(response.data)
      } else {
        setError(response.message || "Failed to fetch event details")
      }
    } catch (err) {
      setError("An error occurred while fetching event details")
      console.error("Error fetching event details:", err)
    } finally {
      setLoading(false)
    }
  }

  const handlePublishToggle = async () => {
    if (!event) return
    
    // Business rule: published events cannot be unpublished
    if (event.is_published) {
      toast({
        title: "Cannot Unpublish",
        description: "Published events cannot be unpublished",
        variant: "destructive"
      })
      return
    }
    
    // Show confirmation dialog before publishing
    const confirmed = window.confirm(
      "⚠️ IMPORTANT WARNING ⚠️\n\n" +
      "Once you publish this event:\n" +
      "• It CANNOT be edited anymore\n" +
      "• It CANNOT be unpublished\n" +
      "• Changes become permanent\n\n" +
      "Are you sure you want to publish this event now?"
    )
    
    if (!confirmed) {
      return
    }
    
    try {
      await eventApi.publishEvent(event.id)
      toast({
        title: "Success", 
        description: "Event published successfully"
      })
      
      // Refresh event details
      fetchEventDetail()
    } catch (err) {
      console.error("Error publishing event:", err)
      toast({
        title: "Error",
        description: "Failed to publish event",
        variant: "destructive"
      })
    }
  }


  const handleStatusChange = async (newStatus: 'deactivate' | 'archive') => {
    if (!event) return
    
    const confirmMessage = newStatus === 'archive' 
      ? "Are you sure you want to archive this event? Archived events cannot be easily restored."
      : "Are you sure you want to deactivate this event?"
    
    if (!window.confirm(confirmMessage)) return
    
    try {
      if (newStatus === 'deactivate') {
        await eventApi.deactivateEvent(event.id)
        toast({
          title: "Success",
          description: "Event deactivated successfully"
        })
      } else {
        await eventApi.archiveEvent(event.id)
        toast({
          title: "Success",
          description: "Event archived successfully"
        })
      }
      
      // Refresh event details
      fetchEventDetail()
    } catch (err) {
      console.error("Error changing event status:", err)
      toast({
        title: "Error",
        description: "Failed to change event status",
        variant: "destructive"
      })
    }
  }

  const handleDeleteEvent = async () => {
    if (!event) return
    
    if (window.confirm("Are you sure you want to delete this event? This action cannot be undone.")) {
      try {
        await eventApi.deleteEvent(event.id)
        toast({
          title: "Success",
          description: "Event deleted successfully"
        })
        router.push("/dashboard/events")
      } catch (err) {
        console.error("Error deleting event:", err)
        toast({
          title: "Error", 
          description: "Failed to delete event",
          variant: "destructive"
        })
      }
    }
  }

  const getStatusBadge = (event: Event) => {
    switch (event.status) {
      case "draft":
        return <Badge variant="outline" className="bg-gray-100 text-gray-800">Draft</Badge>
      case "active":
        if (event.is_published) {
          return <Badge variant="default" className="bg-green-100 text-green-800">Active & Published</Badge>
        } else {
          return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Active (Unpublished)</Badge>
        }
      case "inactive":
        return <Badge variant="destructive" className="bg-red-100 text-red-800">Inactive</Badge>
      case "archive":
        return <Badge variant="outline" className="bg-purple-100 text-purple-800">Archived</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const getVisibilityBadge = (event: Event) => {
    if (event.is_public) {
      return (
        <Badge variant="default" className="bg-blue-100 text-blue-800">
          <Globe className="mr-1 h-3 w-3" />
          Public
        </Badge>
      )
    } else {
      return (
        <Badge variant="outline" className="border-orange-300 text-orange-800">
          <Lock className="mr-1 h-3 w-3" />
          Private
        </Badge>
      )
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-8 bg-gray-200 rounded w-64 animate-pulse"></div>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-20 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error || !event) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">Event Not Found</h1>
        </div>
        
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error || "Event not found or you don't have permission to view it."}
          </AlertDescription>
        </Alert>
        
        <div className="text-center">
          <Link href="/dashboard/events">
            <Button>Return to Events</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{event.name}</h1>
            <div className="flex gap-2 mt-2">
              {getStatusBadge(event)}
              {getVisibilityBadge(event)}
            </div>
          </div>
        </div>
        
        <div className="flex gap-2">
          {!event.is_published && (
            <Button 
              variant="outline" 
              onClick={handlePublishToggle}
              className="flex items-center gap-2"
            >
              <Eye className="h-4 w-4" />
              Publish
            </Button>
          )}
          
          <Button 
            variant="outline" 
            disabled
            className="flex items-center gap-2"
            title="Visibility is set during event creation and cannot be changed"
          >
            {event.is_public ? (
              <>
                <Globe className="h-4 w-4" />
                Public Event
              </>
            ) : (
              <>
                <Lock className="h-4 w-4" />
                Private Event
              </>
            )}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <MoreHorizontal className="h-4 w-4" />
                Actions
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {event.status === 'draft' ? (
                <DropdownMenuItem asChild>
                  <Link href={`/dashboard/events/${event.id}/edit`}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Event
                  </Link>
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem disabled>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Event (Draft Only)
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              {event.status === 'active' && (
                <DropdownMenuItem 
                  onClick={() => handleStatusChange('deactivate')}
                >
                  <Pause className="mr-2 h-4 w-4" />
                  Deactivate
                </DropdownMenuItem>
              )}
              {(event.status === 'active' || event.status === 'inactive') && (
                <DropdownMenuItem 
                  onClick={() => handleStatusChange('archive')}
                >
                  <Archive className="mr-2 h-4 w-4" />
                  Archive
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={handleDeleteEvent}
                className="text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Event
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Event Details */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Event Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-medium text-sm text-muted-foreground">Description</h3>
              <p className="mt-1">{event.description}</p>
            </div>
            
            <Separator />
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium text-sm text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Start Date
                </h3>
                <p className="mt-1">{format(new Date(event.start_date), 'PPP')}</p>
              </div>
              <div>
                <h3 className="font-medium text-sm text-muted-foreground flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  Start Time
                </h3>
                <p className="mt-1">{event.start_time}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium text-sm text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  End Date
                </h3>
                <p className="mt-1">{format(new Date(event.end_date), 'PPP')}</p>
              </div>
              <div>
                <h3 className="font-medium text-sm text-muted-foreground flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  End Time
                </h3>
                <p className="mt-1">{event.end_time}</p>
              </div>
            </div>
            
            <Separator />
            
            <div>
              <h3 className="font-medium text-sm text-muted-foreground flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                Location
              </h3>
              <p className="mt-1">{event.location}</p>
            </div>
            
            <div>
              <h3 className="font-medium text-sm text-muted-foreground flex items-center gap-1">
                <Phone className="h-4 w-4" />
                Contact Phone
              </h3>
              <p className="mt-1">{event.contact_phone}</p>
            </div>
          </CardContent>
        </Card>

        {/* Event Poster */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              Event Poster
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative h-64 bg-gray-100 rounded-lg overflow-hidden">
              {event.poster ? (
                <img 
                  src={getEventPosterUrl(event.poster)} 
                  alt={event.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No poster uploaded</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Facilities */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Facilities
            </CardTitle>
          </CardHeader>
          <CardContent>
            {event.facilities && event.facilities.length > 0 ? (
              <div className="grid grid-cols-2 gap-2">
                {event.facilities.map((facility) => (
                  <div key={facility.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                    <i className={facility.icon} aria-hidden="true"></i>
                    <span className="text-sm">{facility.name}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No facilities selected</p>
            )}
          </CardContent>
        </Card>

        {/* Tickets */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Ticket Types
            </CardTitle>
          </CardHeader>
          <CardContent>
            {event.tickets && event.tickets.length > 0 ? (
              <div className="space-y-3">
                {event.tickets.map((ticket) => (
                  <div key={ticket.id} className="p-3 border rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium">{ticket.name}</h3>
                      <div className="flex items-center gap-1 text-green-600">
                        <DollarSign className="h-4 w-4" />
                        <span className="font-semibold">
                          Rp {parseInt(ticket.price).toLocaleString('id-ID')}
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                      <div>
                        <span className="font-medium">Stock:</span> {ticket.stock}
                      </div>
                      <div>
                        <span className="font-medium">Limit per person:</span> {ticket.limit}
                      </div>
                      <div>
                        <span className="font-medium">Sales start:</span> {format(new Date(ticket.start_date), 'PP')}
                      </div>
                      <div>
                        <span className="font-medium">Sales end:</span> {format(new Date(ticket.end_date), 'PP')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No tickets configured</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Event Organizer Info */}
      {event.event_organizer && (
        <Card>
          <CardHeader>
            <CardTitle>Event Organizer</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium text-sm text-muted-foreground">Organization Name</h3>
                <p className="mt-1">{event.event_organizer.name}</p>
              </div>
              <div>
                <h3 className="font-medium text-sm text-muted-foreground">Type</h3>
                <p className="mt-1 capitalize">{event.event_organizer.organizer_type}</p>
              </div>
              <div>
                <h3 className="font-medium text-sm text-muted-foreground">Email</h3>
                <p className="mt-1">{event.event_organizer.email_eo}</p>
              </div>
              <div>
                <h3 className="font-medium text-sm text-muted-foreground">Phone</h3>
                <p className="mt-1">{event.event_organizer.phone_no_eo}</p>
              </div>
              <div className="md:col-span-2">
                <h3 className="font-medium text-sm text-muted-foreground">Address</h3>
                <p className="mt-1">{event.event_organizer.address_eo}</p>
              </div>
              <div className="md:col-span-2">
                <h3 className="font-medium text-sm text-muted-foreground">Description</h3>
                <p className="mt-1">{event.event_organizer.description}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Metadata */}
      <Card>
        <CardHeader>
          <CardTitle>Metadata</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-muted-foreground">Created:</span>{" "}
              {format(new Date(event.created_at), 'PPp')}
            </div>
            <div>
              <span className="font-medium text-muted-foreground">Last Updated:</span>{" "}
              {format(new Date(event.updated_at), 'PPp')}
            </div>
            <div>
              <span className="font-medium text-muted-foreground">Event ID:</span>{" "}
              {event.id}
            </div>
            <div>
              <span className="font-medium text-muted-foreground">TNC ID:</span>{" "}
              {event.tnc_id}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}