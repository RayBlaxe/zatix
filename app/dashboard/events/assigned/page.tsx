"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Users, 
  Ticket, 
  DollarSign,
  Eye,
  Settings,
  UserPlus
} from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { eventStaffApi } from "@/lib/api"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"
import { getEventPosterUrl } from "@/lib/api"

interface AssignedEvent {
  id: number
  name: string
  poster: string | null
  description: string
  start_date: string
  start_time: string
  end_date: string
  end_time: string
  location: string
  status: 'draft' | 'active' | 'inactive' | 'archive' | 'completed'
  is_published: boolean
  is_public: boolean
  tickets: any[]
  staff_count?: number
}

export default function AssignedEventsPage() {
  const [events, setEvents] = useState<AssignedEvent[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    loadAssignedEvents()
  }, [])

  const loadAssignedEvents = async () => {
    try {
      setLoading(true)
      // API call to get events assigned to current user as Event PIC
      const response = await eventStaffApi.getMyAssignedEvents()
      const eventsData = response.data?.data || response.data || []
      setEvents(Array.isArray(eventsData) ? eventsData : [])
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load assigned events",
        variant: "destructive",
      })
      setEvents([])
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "draft":
        return "bg-gray-100 text-gray-800"
      case "completed":
        return "bg-blue-100 text-blue-800"
      case "inactive":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatDateTime = (date: string, time: string) => {
    const dateObj = new Date(`${date}T${time}`)
    return dateObj.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading assigned events...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Assigned Events</h1>
        <p className="text-muted-foreground">
          Manage events where you are assigned as Event PIC
        </p>
      </div>

      {events.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Calendar className="mx-auto h-16 w-16 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-semibold">No assigned events</h3>
            <p className="text-muted-foreground">
              You haven't been assigned as Event PIC for any events yet.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <Card key={event.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-video relative">
                <Image
                  src={getEventPosterUrl(event.poster)}
                  alt={event.name}
                  fill
                  className="object-cover"
                />
                <div className="absolute top-2 left-2">
                  <Badge className={getStatusColor(event.status)}>
                    {event.status}
                  </Badge>
                </div>
              </div>
              
              <CardHeader className="pb-2">
                <CardTitle className="text-lg line-clamp-2">{event.name}</CardTitle>
                <CardDescription className="line-clamp-2">
                  {event.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDateTime(event.start_date, event.start_time)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span className="line-clamp-1">{event.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Ticket className="h-4 w-4" />
                    <span>{event.tickets.length} ticket types</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>{event.staff_count || 0} staff members</span>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    className="flex-1"
                    onClick={() => router.push(`/dashboard/events/${event.id}`)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Manage Event
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => router.push(`/dashboard/events/${event.id}?tab=staff`)}
                  >
                    <UserPlus className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
