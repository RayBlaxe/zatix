"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Users, 
  Phone, 
  ArrowLeft,
  Share2,
  Heart,
  Image as ImageIcon,
  CheckCircle,
  Star
} from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/hooks/use-auth"
import { Header } from "@/components/header"
import { eventApi } from "@/lib/api"
import { Event } from "@/types/events"
import { format } from "date-fns"
import { toast } from "@/components/ui/use-toast"

export default function EventDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (params.id) {
      fetchEvent()
    }
  }, [params.id])

  const fetchEvent = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await eventApi.getPublicEvent(Number(params.id))
      
      if (response.success) {
        setEvent(response.data)
      } else {
        setError(response.message || "Failed to fetch event details")
      }
    } catch (err) {
      setError("An error occurred while fetching event details")
      console.error("Error fetching event:", err)
    } finally {
      setLoading(false)
    }
  }

  const getEventStatus = (event: Event) => {
    const now = new Date()
    const eventDate = new Date(event.start_date)
    const endDate = new Date(event.end_date)
    
    if (now < eventDate) {
      return { label: "Upcoming", variant: "default" as const, color: "text-blue-600" }
    } else if (now >= eventDate && now <= endDate) {
      return { label: "Live Now", variant: "destructive" as const, color: "text-red-600" }
    } else {
      return { label: "Event Ended", variant: "secondary" as const, color: "text-gray-600" }
    }
  }

  const formatPrice = (tickets: any[]) => {
    if (tickets.length === 0) return "Free"
    
    const prices = tickets.map(ticket => parseFloat(ticket.price))
    const minPrice = Math.min(...prices)
    const maxPrice = Math.max(...prices)
    
    if (minPrice === 0 && maxPrice === 0) return "Free"
    if (minPrice === maxPrice) {
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR'
      }).format(minPrice)
    }
    return `${new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(minPrice)} - ${new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(maxPrice)}`
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getAvailableSeats = (tickets: any[]) => {
    const totalStock = tickets.reduce((sum, ticket) => sum + parseInt(ticket.stock), 0)
    return totalStock
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: event?.name,
          text: event?.description,
          url: window.location.href
        })
      } catch (err) {
        console.log("Error sharing:", err)
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href)
      toast({
        title: "Link copied!",
        description: "Event link has been copied to clipboard"
      })
    }
  }

  const handleBookTicket = () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to book tickets",
        variant: "destructive"
      })
      router.push("/login")
      return
    }
    
    // Navigate to ticket booking page (to be implemented in Iteration 5)
    router.push(`/events/${params.id}/tickets`)
  }

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">
          <div className="container py-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <div className="h-64 bg-gray-200 rounded-lg mb-6"></div>
                  <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
                <div className="lg:col-span-1">
                  <div className="h-64 bg-gray-200 rounded-lg"></div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (error || !event) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">
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
        </main>
      </div>
    )
  }

  const status = getEventStatus(event)
  const availableSeats = getAvailableSeats(event.tickets)

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <div className="container py-8">
          {/* Back Button */}
          <Button 
            variant="ghost" 
            onClick={() => router.back()}
            className="mb-6"
          >
            <ArrowLeft className="mr-2 size-4" />
            Back to Events
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Event Image */}
              <div className="relative h-64 md:h-80 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg overflow-hidden mb-6">
                {event.poster ? (
                  <img 
                    src={event.poster} 
                    alt={event.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <ImageIcon className="size-24 text-gray-400" />
                  </div>
                )}
                
                {/* Status Badge */}
                <div className="absolute top-4 left-4">
                  <Badge variant={status.variant} className="text-sm">
                    {status.label}
                  </Badge>
                </div>
              </div>

              {/* Event Info */}
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h1 className="text-3xl font-bold text-gray-900">{event.name}</h1>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={handleShare}>
                        <Share2 className="size-4 mr-2" />
                        Share
                      </Button>
                      <Button variant="outline" size="sm">
                        <Heart className="size-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 text-lg leading-relaxed">
                    {event.description}
                  </p>
                </div>

                {/* Event Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Calendar className="size-5 text-gray-500" />
                      <div>
                        <p className="font-medium">Event Date</p>
                        <p className="text-gray-600">{formatDate(event.start_date)}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Clock className="size-5 text-gray-500" />
                      <div>
                        <p className="font-medium">Time</p>
                        <p className="text-gray-600">{event.start_time} - {event.end_time} WIB</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <MapPin className="size-5 text-gray-500" />
                      <div>
                        <p className="font-medium">Location</p>
                        <p className="text-gray-600">{event.location}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Users className="size-5 text-gray-500" />
                      <div>
                        <p className="font-medium">Organized by</p>
                        <p className="text-gray-600">{event.event_organizer?.name || 'Event Organizer'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Phone className="size-5 text-gray-500" />
                      <div>
                        <p className="font-medium">Contact</p>
                        <p className="text-gray-600">{event.contact_phone}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Star className="size-5 text-gray-500" />
                      <div>
                        <p className="font-medium">Available Tickets</p>
                        <p className="text-gray-600">{availableSeats} tickets remaining</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Facilities */}
                {event.facilities && event.facilities.length > 0 && (
                  <div>
                    <h3 className="text-xl font-semibold mb-4">Facilities</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {event.facilities.map((facility) => (
                        <div key={facility.id} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                          <i className={`${facility.icon} text-gray-600`}></i>
                          <span className="text-sm font-medium">{facility.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <Card className="sticky top-8">
                <CardHeader>
                  <CardTitle className="text-xl">Book Your Tickets</CardTitle>
                  <CardDescription>
                    Starting from <span className="text-xl font-bold text-primary">{formatPrice(event.tickets)}</span>
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Ticket Types */}
                  <div>
                    <h4 className="font-semibold mb-3">Available Tickets</h4>
                    <div className="space-y-3">
                      {event.tickets.map((ticket) => (
                        <div key={ticket.id} className="flex justify-between items-center p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">{ticket.name}</p>
                            <p className="text-sm text-gray-600">
                              {parseInt(ticket.stock)} available
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-primary">
                              {parseFloat(ticket.price) === 0 ? 'Free' : 
                                new Intl.NumberFormat('id-ID', {
                                  style: 'currency',
                                  currency: 'IDR'
                                }).format(parseFloat(ticket.price))
                              }
                            </p>
                            <p className="text-xs text-gray-500">
                              Max {ticket.limit} per person
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Booking Button */}
                  <div className="space-y-3">
                    <Button 
                      className="w-full h-12 text-lg font-semibold"
                      onClick={handleBookTicket}
                      disabled={availableSeats === 0 || status.label === "Event Ended"}
                    >
                      {availableSeats === 0 ? "Sold Out" : 
                       status.label === "Event Ended" ? "Event Ended" : 
                       "Book Tickets"}
                    </Button>
                    
                    {availableSeats > 0 && status.label !== "Event Ended" && (
                      <p className="text-xs text-gray-500 text-center">
                        <CheckCircle className="size-4 inline mr-1" />
                        Free cancellation up to 24 hours before event
                      </p>
                    )}
                  </div>

                  {/* Trust Indicators */}
                  <div className="text-center pt-4 border-t">
                    <div className="flex justify-center items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <CheckCircle className="size-4 text-green-500" />
                        <span>Instant confirmation</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <CheckCircle className="size-4 text-green-500" />
                        <span>Mobile tickets</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}