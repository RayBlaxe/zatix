"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Calendar, Edit, Eye, MoreHorizontal, Plus, Search, Trash2, Users, MapPin, Clock, Image as ImageIcon } from "lucide-react"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator 
} from "@/components/ui/dropdown-menu"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { eventApi } from "@/lib/api"
import { Event, EventFilters } from "@/types/events"
import { format } from "date-fns"
import { useAuth } from "@/hooks/use-auth"

export default function EventsPage() {
  const { user } = useAuth()
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [filters, setFilters] = useState<EventFilters>({})
  const [searchTerm, setSearchTerm] = useState("")

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
      if (isPublished) {
        await eventApi.unpublishEvent(eventId)
      } else {
        await eventApi.publishEvent(eventId)
      }
      
      // Refresh events list
      fetchEvents()
    } catch (err) {
      console.error("Error toggling publish status:", err)
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

  const getStatusBadge = (event: Event) => {
    if (event.status === "draft") {
      return <Badge variant="outline">Draft</Badge>
    } else if (event.status === "active" && event.is_published) {
      return <Badge variant="default">Published</Badge>
    } else if (event.status === "active" && !event.is_published) {
      return <Badge variant="secondary">Unpublished</Badge>
    } else {
      return <Badge variant="destructive">Completed</Badge>
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
        <Link href="/dashboard/events/create">
          <Button>
            <Plus className="mr-2 size-4" />
            Create Event
          </Button>
        </Link>
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
              <SelectItem value="completed">Completed</SelectItem>
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
            <Link href="/dashboard/events/create">
              <Button>
                <Plus className="mr-2 size-4" />
                Create Event
              </Button>
            </Link>
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
                      <DropdownMenuItem asChild>
                        <Link href={`/dashboard/events/${event.id}/edit`}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => handlePublishToggle(event.id, event.is_published)}
                      >
                        {event.is_published ? 'Unpublish' : 'Publish'}
                      </DropdownMenuItem>
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
                      src={event.poster} 
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
    </div>
  )
}