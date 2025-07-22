"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, MapPin, Clock, Download, QrCode, RefreshCw } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { ProtectedRoute } from "@/components/protected-route"
import { orderApi } from "@/lib/api"
import { CustomerTicket } from "@/types/events"
import { toast } from "@/components/ui/use-toast"
import { QRCodeModal } from "@/components/qr-code-modal"

export default function MyTicketsPage() {
  const { user } = useAuth()
  const [tickets, setTickets] = useState<CustomerTicket[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedTicket, setSelectedTicket] = useState<CustomerTicket | null>(null)
  const [qrCodeData, setQrCodeData] = useState<string | null>(null)
  const [showQRModal, setShowQRModal] = useState(false)

  useEffect(() => {
    fetchMyTickets()
  }, [])

  const fetchMyTickets = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await orderApi.getMyTickets()
      
      if (response.success) {
        setTickets(response.data)
      } else {
        setError(response.message || "Failed to fetch tickets")
      }
    } catch (err) {
      console.error("Error fetching tickets:", err)
      setError("An error occurred while fetching your tickets")
    } finally {
      setIsLoading(false)
    }
  }

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
      case "active":
        return "default"
      case "used":
        return "secondary"
      case "expired":
        return "destructive"
      default:
        return "secondary"
    }
  }

  const getOrderStatus = (order: any) => {
    if (order?.payment_status === "success") return "confirmed"
    if (order?.payment_status === "pending") return "pending"
    return "cancelled"
  }

  const upcomingTickets = tickets.filter(ticket => {
    if (!ticket.order?.event) return false
    const eventDate = new Date(ticket.order.event.start_date)
    const today = new Date()
    return eventDate >= today && ticket.status === "active" && getOrderStatus(ticket.order) === "confirmed"
  })

  const pastTickets = tickets.filter(ticket => {
    if (!ticket.order?.event) return false
    const eventDate = new Date(ticket.order.event.start_date)
    const today = new Date()
    return eventDate < today
  })

  const pendingTickets = tickets.filter(ticket => {
    return getOrderStatus(ticket.order) === "pending"
  })

  const handleViewQR = async (ticket: CustomerTicket) => {
    try {
      const response = await orderApi.getTicketQR(ticket.ticket_code)
      if (response.success) {
        setSelectedTicket(ticket)
        setQrCodeData(response.data.qr_code)
        setShowQRModal(true)
        toast({
          title: "QR Code Loaded",
          description: "Your e-ticket QR code is ready"
        })
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to load QR code",
          variant: "destructive"
        })
      }
    } catch (err) {
      console.error("Error fetching QR code:", err)
      toast({
        title: "Error",
        description: "An error occurred while loading QR code",
        variant: "destructive"
      })
    }
  }

  const handleCloseQRModal = () => {
    setShowQRModal(false)
    setSelectedTicket(null)
    setQrCodeData(null)
  }

  const renderTicketCard = (ticket: CustomerTicket) => {
    const event = ticket.order?.event
    const orderStatus = getOrderStatus(ticket.order)
    
    if (!event) return null
    
    return (
      <Card key={ticket.id} className="hover:shadow-md transition-shadow">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <CardTitle className="text-lg">{event.name}</CardTitle>
              <CardDescription>Ticket Code: {ticket.ticket_code}</CardDescription>
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
            </div>
            
            <div className="space-y-2">
              <div className="text-sm">
                <span className="font-medium">Ticket Type:</span> {ticket.ticket?.name || 'N/A'}
              </div>
              <div className="text-sm">
                <span className="font-medium">Order:</span> {ticket.order?.order_number}
              </div>
              <div className="text-sm">
                <span className="font-medium">Total:</span> {formatPrice(ticket.order?.total_amount || 0)}
              </div>
            </div>
          </div>
          
          {orderStatus === "confirmed" && ticket.status === "active" && (
            <div className="flex flex-wrap gap-2 pt-4">
              <Button size="sm" variant="outline">
                <Download className="mr-2 size-4" />
                Download Ticket
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => handleViewQR(ticket)}
              >
                <QrCode className="mr-2 size-4" />
                View QR Code
              </Button>
            </div>
          )}
          
          {orderStatus === "pending" && (
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
  }

  if (isLoading) {
    return (
      <ProtectedRoute requiredRoles={["customer"]}>
        <div className="container mx-auto py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">My Tickets</h1>
            <p className="text-muted-foreground">Loading your tickets...</p>
          </div>
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

  if (error) {
    return (
      <ProtectedRoute requiredRoles={["customer"]}>
        <div className="container mx-auto py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">My Tickets</h1>
          </div>
          <Card>
            <CardContent className="p-8 text-center">
              <div className="text-red-500 mb-4">
                <RefreshCw className="size-12 mx-auto" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Unable to Load Tickets</h3>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={fetchMyTickets}>
                <RefreshCw className="mr-2 size-4" />
                Try Again
              </Button>
            </CardContent>
          </Card>
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

        {/* QR Code Modal */}
        <QRCodeModal
          ticket={selectedTicket}
          qrCodeData={qrCodeData}
          isOpen={showQRModal}
          onClose={handleCloseQRModal}
        />
      </div>
    </ProtectedRoute>
  )
}