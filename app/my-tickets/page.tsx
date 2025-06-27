"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, MapPin, Clock, Download, QrCode, RefreshCw } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { ProtectedRoute } from "@/components/protected-route"

interface Ticket {
  id: string
  eventId: string
  eventTitle: string
  eventDate: string
  eventTime: string
  eventLocation: string
  ticketType: string
  quantity: number
  totalPrice: number
  status: "confirmed" | "pending" | "cancelled"
  purchaseDate: string
  qrCode?: string
}

export default function MyTicketsPage() {
  const { user } = useAuth()
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Mock tickets data
  useEffect(() => {
    const mockTickets: Ticket[] = [
      {
        id: "TIX001",
        eventId: "1",
        eventTitle: "Tech Conference 2024",
        eventDate: "2024-03-15",
        eventTime: "09:00",
        eventLocation: "Jakarta Convention Center",
        ticketType: "Regular",
        quantity: 2,
        totalPrice: 300000,
        status: "confirmed",
        purchaseDate: "2024-02-15",
        qrCode: "QR123456789"
      },
      {
        id: "TIX002",
        eventId: "2",
        eventTitle: "Music Festival Jakarta",
        eventDate: "2024-03-20",
        eventTime: "18:00",
        eventLocation: "Gelora Bung Karno",
        ticketType: "VIP",
        quantity: 1,
        totalPrice: 150000,
        status: "confirmed",
        purchaseDate: "2024-02-20",
        qrCode: "QR987654321"
      },
      {
        id: "TIX003",
        eventId: "3",
        eventTitle: "Food & Culinary Expo",
        eventDate: "2024-03-25",
        eventTime: "10:00",
        eventLocation: "Plaza Indonesia",
        ticketType: "Standard",
        quantity: 1,
        totalPrice: 25000,
        status: "pending",
        purchaseDate: "2024-02-25"
      }
    ]
    
    setTimeout(() => {
      setTickets(mockTickets)
      setIsLoading(false)
    }, 1000)
  }, [])

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "default"
      case "pending":
        return "secondary"
      case "cancelled":
        return "destructive"
      default:
        return "secondary"
    }
  }

  const upcomingTickets = tickets.filter(ticket => {
    const eventDate = new Date(ticket.eventDate)
    const today = new Date()
    return eventDate >= today && ticket.status === "confirmed"
  })

  const pastTickets = tickets.filter(ticket => {
    const eventDate = new Date(ticket.eventDate)
    const today = new Date()
    return eventDate < today
  })

  const pendingTickets = tickets.filter(ticket => ticket.status === "pending")

  const renderTicketCard = (ticket: Ticket) => (
    <Card key={ticket.id} className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg">{ticket.eventTitle}</CardTitle>
            <CardDescription>Ticket ID: {ticket.id}</CardDescription>
          </div>
          <Badge variant={getStatusColor(ticket.status)}>
            {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center text-sm text-muted-foreground">
              <Calendar className="mr-2 size-4" />
              {formatDate(ticket.eventDate)}
            </div>
            
            <div className="flex items-center text-sm text-muted-foreground">
              <Clock className="mr-2 size-4" />
              {ticket.eventTime} WIB
            </div>
            
            <div className="flex items-center text-sm text-muted-foreground">
              <MapPin className="mr-2 size-4" />
              {ticket.eventLocation}
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="text-sm">
              <span className="font-medium">Ticket Type:</span> {ticket.ticketType}
            </div>
            <div className="text-sm">
              <span className="font-medium">Quantity:</span> {ticket.quantity}
            </div>
            <div className="text-sm">
              <span className="font-medium">Total:</span> {formatPrice(ticket.totalPrice)}
            </div>
          </div>
        </div>
        
        {ticket.status === "confirmed" && (
          <div className="flex flex-wrap gap-2 pt-4">
            <Button size="sm" variant="outline">
              <Download className="mr-2 size-4" />
              Download Ticket
            </Button>
            <Button size="sm" variant="outline">
              <QrCode className="mr-2 size-4" />
              View QR Code
            </Button>
          </div>
        )}
        
        {ticket.status === "pending" && (
          <div className="flex items-center gap-2 pt-4">
            <RefreshCw className="size-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Payment confirmation pending
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )

  if (isLoading) {
    return (
      <ProtectedRoute requiredRoles={["customer"]}>
        <div className="container mx-auto py-8">
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
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
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute requiredRoles={["customer"]}>
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Tickets</h1>
          <p className="text-muted-foreground">
            Manage and view all your event tickets in one place
          </p>
        </div>

        <Tabs defaultValue="upcoming" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="upcoming">
              Upcoming ({upcomingTickets.length})
            </TabsTrigger>
            <TabsTrigger value="pending">
              Pending ({pendingTickets.length})
            </TabsTrigger>
            <TabsTrigger value="past">
              Past Events ({pastTickets.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="upcoming" className="space-y-4">
            {upcomingTickets.length === 0 ? (
              <div className="text-center py-12">
                <h3 className="text-lg font-semibold mb-2">No upcoming events</h3>
                <p className="text-muted-foreground mb-4">
                  You don't have any upcoming events. Start exploring events to book your tickets!
                </p>
                <Button asChild>
                  <a href="/events">Browse Events</a>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingTickets.map(renderTicketCard)}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="pending" className="space-y-4">
            {pendingTickets.length === 0 ? (
              <div className="text-center py-12">
                <h3 className="text-lg font-semibold mb-2">No pending tickets</h3>
                <p className="text-muted-foreground">
                  All your ticket purchases are confirmed
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingTickets.map(renderTicketCard)}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="past" className="space-y-4">
            {pastTickets.length === 0 ? (
              <div className="text-center py-12">
                <h3 className="text-lg font-semibold mb-2">No past events</h3>
                <p className="text-muted-foreground">
                  Your event history will appear here
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {pastTickets.map(renderTicketCard)}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </ProtectedRoute>
  )
}