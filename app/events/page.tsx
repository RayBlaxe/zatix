"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Calendar, MapPin, Search, Users, Clock, Image as ImageIcon } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/hooks/use-auth"
import { Header } from "@/components/header"
import { BlurFade } from "@/components/ui/blur-fade"
import { DotPattern } from "@/components/ui/dot-pattern"
import { cn } from "@/lib/utils"
import { eventApi, getEventPosterUrl } from "@/lib/api"
import { Event, PublicEventFilters } from "@/types/events"
import { format } from "date-fns"

export default function EventsPage() {
  const { user } = useAuth()
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [filters, setFilters] = useState<PublicEventFilters>({})
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")

  useEffect(() => {
    fetchEvents()
  }, [currentPage, filters])

  const fetchEvents = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await eventApi.getPublicEvents(currentPage, {
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

  const handleFilterChange = (key: keyof PublicEventFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setCurrentPage(1)
  }

  const clearFilters = () => {
    setFilters({})
    setSearchTerm("")
    setSelectedCategory("all")
    setCurrentPage(1)
  }

  const getEventStatus = (event: Event) => {
    const now = new Date()
    const eventDate = new Date(event.start_date)
    const endDate = new Date(event.end_date)
    
    if (now < eventDate) {
      return { label: "Upcoming", variant: "default" as const }
    } else if (now >= eventDate && now <= endDate) {
      return { label: "Live", variant: "destructive" as const }
    } else {
      return { label: "Past", variant: "secondary" as const }
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

  const categories = ["all", "Technology", "Music", "Food & Drink", "Sports", "Arts & Culture", "Business", "Entertainment"]

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">
          <section className="relative py-16 bg-gradient-to-br from-primary/10 via-secondary/5 to-background overflow-hidden">
            <DotPattern
              className={cn(
                "opacity-30",
                "[mask-image:radial-gradient(600px_circle_at_center,white,transparent)]"
              )}
            />
            <div className="container relative z-10">
              <div className="h-12 bg-gray-200 rounded w-1/2 mx-auto animate-pulse mb-6"></div>
              <div className="h-6 bg-gray-200 rounded w-2/3 mx-auto animate-pulse"></div>
            </div>
          </section>
          <section className="py-12">
            <div className="container">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader>
                      <div className="h-32 bg-gray-200 rounded mb-4"></div>
                      <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="h-4 bg-gray-200 rounded"></div>
                        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-16 bg-gradient-to-br from-primary/10 via-secondary/5 to-background overflow-hidden">
          <DotPattern
            className={cn(
              "opacity-30",
              "[mask-image:radial-gradient(600px_circle_at_center,white,transparent)]"
            )}
          />
          <div className="container relative z-10">
            <BlurFade delay={0.25} inView>
              <h1 className="text-4xl md:text-6xl font-bold mb-6 text-center">
                {user?.currentRole === "customer" ? "Explore Events" : "Discover Amazing Events"}
              </h1>
            </BlurFade>
            <BlurFade delay={0.5} inView>
              <p className="text-xl text-muted-foreground text-center max-w-3xl mx-auto mb-8">
                Find and book tickets for the best events happening around you. From concerts to conferences, discover experiences that matter.
              </p>
            </BlurFade>
          </div>
        </section>

        <section className="py-12">
          <div className="container">
            {/* Search and Filters */}
            <BlurFade delay={0.75} inView>
              <div className="mb-8 space-y-4">
                <div className="relative max-w-2xl mx-auto">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground size-4" />
                  <Input
                    placeholder="Search events..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-12 text-lg"
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>
                
                <div className="flex flex-wrap gap-2 justify-center">
                  {categories.map((category) => (
                    <Button
                      key={category}
                      variant={selectedCategory === category ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCategory(category)}
                    >
                      {category === "all" ? "All Categories" : category}
                    </Button>
                  ))}
                </div>

                <div className="flex justify-center gap-2">
                  <Select 
                    value={filters.location || "all"} 
                    onValueChange={(value) => handleFilterChange('location', value === 'all' ? undefined : value)}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Location" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Locations</SelectItem>
                      <SelectItem value="Jakarta">Jakarta</SelectItem>
                      <SelectItem value="Bandung">Bandung</SelectItem>
                      <SelectItem value="Surabaya">Surabaya</SelectItem>
                      <SelectItem value="Yogyakarta">Yogyakarta</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button onClick={handleSearch}>
                    Search
                  </Button>

                  {(Object.keys(filters).length > 0 || searchTerm || selectedCategory !== "all") && (
                    <Button variant="outline" onClick={clearFilters}>
                      Clear Filters
                    </Button>
                  )}
                </div>
              </div>
            </BlurFade>

            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Events Grid */}
            {events.length === 0 ? (
              <BlurFade delay={1} inView>
                <div className="text-center py-12">
                  <Calendar className="size-24 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No events found</h3>
                  <p className="text-muted-foreground mb-6">
                    {searchTerm || Object.keys(filters).length > 0 || selectedCategory !== "all"
                      ? "Try adjusting your search or filters" 
                      : "Check back later for upcoming events"}
                  </p>
                  {(searchTerm || Object.keys(filters).length > 0 || selectedCategory !== "all") && (
                    <Button onClick={clearFilters} variant="outline">
                      Clear Filters
                    </Button>
                  )}
                </div>
              </BlurFade>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.map((event, index) => {
                  const status = getEventStatus(event)
                  const availableSeats = getAvailableSeats(event.tickets)
                  
                  return (
                    <BlurFade key={event.id} delay={1 + index * 0.1} inView>
                      <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-border/50 overflow-hidden">
                        {/* Event Image */}
                        <div className="relative h-48 bg-gradient-to-br from-blue-50 to-purple-50 overflow-hidden">
                          {event.poster ? (
                            <img 
                              src={getEventPosterUrl(event.poster)} 
                              alt={event.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full">
                              <ImageIcon className="size-12 text-gray-400" />
                            </div>
                          )}
                          
                          {/* Status Badge */}
                          <div className="absolute top-4 left-4">
                            <Badge variant={status.variant}>{status.label}</Badge>
                          </div>
                          
                          {/* Price Badge */}
                          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1">
                            <span className="text-sm font-bold text-primary">
                              {formatPrice(event.tickets)}
                            </span>
                          </div>
                        </div>

                        <CardHeader>
                          <CardTitle className="line-clamp-2 text-lg">{event.name}</CardTitle>
                          <CardDescription className="line-clamp-3">
                            {event.description}
                          </CardDescription>
                        </CardHeader>
                        
                        <CardContent className="space-y-3">
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Calendar className="mr-2 size-4" />
                            {formatDate(event.start_date)}
                          </div>
                          
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Clock className="mr-2 size-4" />
                            {event.start_time} - {event.end_time} WIB
                          </div>
                          
                          <div className="flex items-center text-sm text-muted-foreground">
                            <MapPin className="mr-2 size-4" />
                            {event.location}
                          </div>
                          
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Users className="mr-2 size-4" />
                            {event.event_organizer?.name || 'Event Organizer'}
                          </div>

                          {event.tickets.length > 0 && (
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Users className="mr-2 size-4" />
                              {availableSeats} tickets available
                            </div>
                          )}
                        </CardContent>
                        
                        <CardFooter>
                          <Link href={`/events/${event.id}`} className="w-full">
                            <Button className="w-full" disabled={availableSeats === 0}>
                              {availableSeats === 0 ? "Sold Out" : "View Details"}
                            </Button>
                          </Link>
                        </CardFooter>
                      </Card>
                    </BlurFade>
                  )
                })}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-8 gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <div className="flex items-center gap-2">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = i + 1
                    return (
                      <Button
                        key={pageNum}
                        variant={pageNum === currentPage ? "default" : "outline"}
                        onClick={() => setCurrentPage(pageNum)}
                        className="w-10"
                      >
                        {pageNum}
                      </Button>
                    )
                  })}
                  {totalPages > 5 && (
                    <>
                      <span className="text-muted-foreground">...</span>
                      <Button
                        variant={totalPages === currentPage ? "default" : "outline"}
                        onClick={() => setCurrentPage(totalPages)}
                        className="w-10"
                      >
                        {totalPages}
                      </Button>
                    </>
                  )}
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
        </section>
      </main>

      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            © 2025 ZaTix. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <Link href="/terms-and-conditions" className="hover:underline">
              Terms
            </Link>
            <Link href="#" className="hover:underline">
              Privacy
            </Link>
            <Link href="#" className="hover:underline">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}