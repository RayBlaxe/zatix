"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Calendar, Edit, Eye, MoreHorizontal, Plus, Search, Trash2, Users, MapPin, Clock, Image as ImageIcon, Globe, Lock, Archive, Pause } from "lucide-react"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator 
} from "@/components/ui/dropdown-menu"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { eventApi, tncApi, getToken, getEventPosterUrl } from "@/lib/api"
import { Event, EventFilters } from "@/types/events"
import { format } from "date-fns"
import { useAuth } from "@/hooks/use-auth"
import { toast } from "@/components/ui/use-toast"
import { TNCAcceptanceModal } from "@/components/tnc-acceptance-modal"

export default function EventsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [filters, setFilters] = useState<EventFilters>({})
  const [searchTerm, setSearchTerm] = useState("")
  const [showTNCModal, setShowTNCModal] = useState(false)

  useEffect(() => {
    fetchEvents()
  }, [currentPage, filters])

  const fetchEvents = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await eventApi.getMyEvents(currentPage, {
        ...filters,
        search: searchTerm || undefined
      })
      
      if (response.success) {
        setEvents(response.data.data)
        setTotalPages(response.data.last_page)
      } else {
        setError(response.message || "Failed to fetch events")
      }
    } catch (err) {
      setError("An error occurred while fetching events")
      console.error("Error fetching events:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    setCurrentPage(1)
    fetchEvents()
  }

  const handleFilterChange = (key: keyof EventFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setCurrentPage(1)
  }

  const handlePublishToggle = async (eventId: number, isPublished: boolean) => {
    try {
      // Business rule: published events cannot be unpublished
      if (isPublished) {
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
      
      await eventApi.publishEvent(eventId)
      
      toast({
        title: "Event Published",
        description: "Your event has been successfully published and is now live!",
        variant: "default"
      })
      
      // Refresh events list
      fetchEvents()
    } catch (err) {
      console.error("Error publishing event:", err)
      toast({
        title: "Error",
        description: "Failed to publish event. Please try again.",
        variant: "destructive"
      })
    }
  }


  const handleStatusChange = async (eventId: number, newStatus: 'deactivate' | 'archive') => {
    const confirmMessage = newStatus === 'archive' 
      ? "Are you sure you want to archive this event?"
      : "Are you sure you want to deactivate this event?"
    
    if (!window.confirm(confirmMessage)) return
    
    try {
      if (newStatus === 'deactivate') {
        await eventApi.deactivateEvent(eventId)
      } else {
        await eventApi.archiveEvent(eventId)
      }
      
      // Refresh events list
      fetchEvents()
    } catch (err) {
      console.error("Error changing event status:", err)
    }
  }

  const handleDeleteEvent = async (eventId: number) => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      try {
        await eventApi.deleteEvent(eventId)
        fetchEvents()
      } catch (err) {
        console.error("Error deleting event:", err)
      }
    }
  }

  const handleCreateEventClick = async () => {
    try {
      const token = getToken()
      if (!token) {
        toast({
          title: "Authentication Required",
          description: "Please log in to create an event",
          variant: "destructive"
        })
        return
      }

      // Check if TNC has been accepted
      const tncResponse = await tncApi.getTNCEvents(token)
      if (tncResponse.success && tncResponse.data) {
        if (tncResponse.data.already_accepted) {
          // TNC already accepted, go directly to create event
          router.push("/dashboard/events/create")
        } else {
          // Need to accept TNC first
          setShowTNCModal(true)
        }
      } else {
        toast({
          title: "Error",
          description: "Failed to check terms and conditions. Please try again.",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Error checking TNC:", error)
      toast({
        title: "Error",
        description: "Failed to check terms and conditions. Please try again.",
        variant: "destructive"
      })
    }
  }

  const handleTNCAccepted = () => {
    setShowTNCModal(false)
    router.push("/dashboard/events/create")
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
      return <Badge variant="default" className="bg-green-100 text-green-800">Public</Badge>
    } else {
      return <Badge variant="outline" className="border-orange-300 text-orange-800">Private</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Events</h1>
          <p className="text-muted-foreground">Manage your events and create new ones.</p>
        </div>
        <Button onClick={handleCreateEventClick}>
          <Plus className="mr-2 size-4" />
          Create Event
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-4 md:flex-row">
        <div className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 size-4 text-muted-foreground" />
            <Input
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <Button onClick={handleSearch} variant="outline">
            Search
          </Button>
        </div>
        
        <div className="flex gap-2">
          <Select value={filters.status || "all"} onValueChange={(value) => handleFilterChange('status', value === 'all' ? undefined : value)}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="archive">Archive</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters.is_published?.toString() || "all"} onValueChange={(value) => handleFilterChange('is_published', value === 'all' ? undefined : value === 'true')}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Published" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="true">Published</SelectItem>
              <SelectItem value="false">Unpublished</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters.is_public?.toString() || "all"} onValueChange={(value) => handleFilterChange('is_public', value === 'all' ? undefined : value === 'true')}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Visibility" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="true">Public</SelectItem>
              <SelectItem value="false">Private</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Events Grid */}
      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-20 bg-gray-200 rounded mb-4"></div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : events.length === 0 ? (
        <Card className="flex flex-col justify-center items-center h-64">
          <CardContent className="text-center">
            <Calendar className="size-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No events found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || Object.keys(filters).length > 0 
                ? "Try adjusting your search or filters" 
                : "Create your first event to get started"}
            </p>
            <Button onClick={handleCreateEventClick}>
              <Plus className="mr-2 size-4" />
              Create Event
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <Card key={event.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg leading-6">{event.name}</CardTitle>
                    <div className="flex gap-2 mt-2">
                      {getStatusBadge(event)}
                      {getVisibilityBadge(event)}
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/dashboard/events/${event.id}`}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </Link>
                      </DropdownMenuItem>
                      {event.status === 'draft' ? (
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/events/${event.id}/edit`}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem disabled>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit (Draft Only)
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      {!event.is_published && (
                        <DropdownMenuItem 
                          onClick={() => handlePublishToggle(event.id, event.is_published)}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          Publish
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem disabled>
                        {event.is_public ? (
                          <>
                            <Globe className="mr-2 h-4 w-4" />
                            Public Event
                          </>
                        ) : (
                          <>
                            <Lock className="mr-2 h-4 w-4" />
                            Private Event
                          </>
                        )}
                        <span className="text-xs text-muted-foreground ml-2">(Set during creation)</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {event.status === 'active' && (
                        <DropdownMenuItem 
                          onClick={() => handleStatusChange(event.id, 'deactivate')}
                        >
                          <Pause className="mr-2 h-4 w-4" />
                          Deactivate
                        </DropdownMenuItem>
                      )}
                      {(event.status === 'active' || event.status === 'inactive') && (
                        <DropdownMenuItem 
                          onClick={() => handleStatusChange(event.id, 'archive')}
                        >
                          <Archive className="mr-2 h-4 w-4" />
                          Archive
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => handleDeleteEvent(event.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                {/* Event poster placeholder */}
                <div className="relative h-32 bg-gray-100 rounded-lg mb-4 overflow-hidden">
                  {event.poster ? (
                    <img 
                      src={getEventPosterUrl(event.poster)} 
                      alt={event.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <ImageIcon className="size-8 text-gray-400" />
                    </div>
                  )}
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="size-4" />
                    <span>{format(new Date(event.start_date), 'PPP')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="size-4" />
                    <span>{event.start_time} - {event.end_time}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="size-4" />
                    <span className="truncate">{event.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="size-4" />
                    <span>{event.tickets.length} ticket type(s)</span>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground mt-3 line-clamp-2">
                  {event.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button 
            variant="outline" 
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <div className="flex items-center gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <Button
                key={page}
                variant={page === currentPage ? "default" : "outline"}
                onClick={() => setCurrentPage(page)}
                className="w-10"
              >
                {page}
              </Button>
            ))}
          </div>
          <Button 
            variant="outline" 
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}

      {/* TNC Acceptance Modal */}
      <TNCAcceptanceModal
        open={showTNCModal}
        onOpenChange={setShowTNCModal}
        onAccept={handleTNCAccepted}
      />
    </div>
  )
}