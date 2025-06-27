"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Calendar, MapPin, Search, Users, Clock } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"

interface Event {
  id: string
  title: string
  description: string
  date: string
  time: string
  location: string
  category: string
  price: number
  availableSeats: number
  totalSeats: number
  image?: string
}

export default function EventsPage() {
  const { user } = useAuth()
  const [events, setEvents] = useState<Event[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [isLoading, setIsLoading] = useState(true)

  // Mock events data
  useEffect(() => {
    const mockEvents: Event[] = [
      {
        id: "1",
        title: "Tech Conference 2024",
        description: "Join us for the biggest tech conference of the year featuring industry leaders and cutting-edge innovations.",
        date: "2024-03-15",
        time: "09:00",
        location: "Jakarta Convention Center",
        category: "Technology",
        price: 150000,
        availableSeats: 50,
        totalSeats: 200
      },
      {
        id: "2",
        title: "Music Festival Jakarta",
        description: "Experience amazing live performances from local and international artists.",
        date: "2024-03-20",
        time: "18:00",
        location: "Gelora Bung Karno",
        category: "Music",
        price: 75000,
        availableSeats: 100,
        totalSeats: 500
      },
      {
        id: "3",
        title: "Food & Culinary Expo",
        description: "Discover the best cuisines and culinary experiences from across Indonesia.",
        date: "2024-03-25",
        time: "10:00",
        location: "Plaza Indonesia",
        category: "Food & Drink",
        price: 25000,
        availableSeats: 200,
        totalSeats: 300
      }
    ]
    
    setTimeout(() => {
      setEvents(mockEvents)
      setIsLoading(false)
    }, 1000)
  }, [])

  const categories = ["all", "Technology", "Music", "Food & Drink", "Sports", "Arts & Culture"]

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || event.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(price)
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          {user?.currentRole === "customer" ? "Explore Events" : "Discover Amazing Events"}
        </h1>
        <p className="text-muted-foreground">
          Find and book tickets for the best events happening around you
        </p>
      </div>

      {/* Search and Filters */}
      <div className="mb-8 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground size-4" />
          <Input
            placeholder="Search events..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex flex-wrap gap-2">
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
      </div>

      {/* Events Grid */}
      {filteredEvents.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold mb-2">No events found</h3>
          <p className="text-muted-foreground">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <Card key={event.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <Badge variant="secondary">{event.category}</Badge>
                  <span className="text-lg font-bold text-primary">
                    {formatPrice(event.price)}
                  </span>
                </div>
                <CardTitle className="line-clamp-2">{event.title}</CardTitle>
                <CardDescription className="line-clamp-3">
                  {event.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-3">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="mr-2 size-4" />
                  {formatDate(event.date)}
                </div>
                
                <div className="flex items-center text-sm text-muted-foreground">
                  <Clock className="mr-2 size-4" />
                  {event.time} WIB
                </div>
                
                <div className="flex items-center text-sm text-muted-foreground">
                  <MapPin className="mr-2 size-4" />
                  {event.location}
                </div>
                
                <div className="flex items-center text-sm text-muted-foreground">
                  <Users className="mr-2 size-4" />
                  {event.availableSeats} / {event.totalSeats} seats available
                </div>
              </CardContent>
              
              <CardFooter>
                <Link href={`/events/${event.id}`} className="w-full">
                  <Button className="w-full" disabled={event.availableSeats === 0}>
                    {event.availableSeats === 0 ? "Sold Out" : "View Details"}
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}