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
import QRCode from 'qrcode'

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
      console.log("My tickets API response:", response) // Debug log
      
      if (response.success) {
        // Handle paginated response structure
        const ticketsData = Array.isArray(response.data?.data) ? response.data.data : 
                           Array.isArray(response.data) ? response.data : []
        console.log("Setting tickets:", ticketsData) // Debug log
        setTickets(ticketsData)
      } else {
        console.log("API returned error:", response.message) // Debug log
        setError(response.message || "Failed to fetch tickets")
        setTickets([]) // Set empty array on error
      }
    } catch (err) {
      console.error("Error fetching tickets:", err)
      setError("An error occurred while fetching your tickets")
      setTickets([]) // Set empty array on error
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

  const upcomingTickets = Array.isArray(tickets) ? tickets.filter(ticket => {
    // For now, since we don't have event date info in the API response,
    // we'll show all active tickets as upcoming
    const ticketStatus = ticket.status || 'active'
    return ticketStatus === "active" && !ticket.checked_in_at
  }) : []

  const pastTickets = Array.isArray(tickets) ? tickets.filter(ticket => {
    // Show tickets that have been checked in as past events
    return ticket.checked_in_at !== null
  }) : []

  const pendingTickets = Array.isArray(tickets) ? tickets.filter(ticket => {
    // Since we don't have order status in the current API response,
    // we'll use a different logic or show empty for now
    return false // No pending tickets for now
  }) : []

  const handleViewQR = async (ticket: CustomerTicket) => {
    try {
      // Generate QR code directly from ticket code
      const qrCodeDataURL = await QRCode.toDataURL(ticket.ticket_code, {
        width: 300,
        margin: 2,
        errorCorrectionLevel: 'M',
        type: 'image/png',
        quality: 0.92,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      })
      
      setSelectedTicket(ticket)
      setQrCodeData(qrCodeDataURL)
      setShowQRModal(true)
      toast({
        title: "QR Code Generated",
        description: "Your e-ticket QR code is ready"
      })
    } catch (err) {
      console.error("Error generating QR code:", err)
      toast({
        title: "Error",
        description: "Failed to generate QR code",
        variant: "destructive"
      })
    }
  }

  const handleCloseQRModal = () => {
    setShowQRModal(false)
    setSelectedTicket(null)
    setQrCodeData(null)
  }

  const handleDownloadTicket = async (ticket: CustomerTicket) => {
    try {
      // Generate QR code for the ticket
      const qrCodeDataURL = await QRCode.toDataURL(ticket.ticket_code, {
        width: 200,
        margin: 2,
        errorCorrectionLevel: 'M',
        type: 'image/png',
        quality: 0.92,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      })
      
      // Generate ticket HTML with QR code
      const ticketHTML = generateTicketHTML(ticket, qrCodeDataURL)
      
      // Create a blob and download it
      const blob = new Blob([ticketHTML], { type: 'text/html' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `ticket-${ticket.ticket_code}.html`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
      toast({
        title: "Ticket Downloaded",
        description: "Your ticket has been downloaded successfully"
      })
    } catch (err) {
      console.error("Error downloading ticket:", err)
      toast({
        title: "Error",
        description: "Failed to download ticket",
        variant: "destructive"
      })
    }
  }

  const generateTicketHTML = (ticket: CustomerTicket, qrCodeDataURL?: string) => {
    const event = ticket.ticket?.event
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>E-Ticket - ${ticket.ticket_code}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .ticket {
            background: white;
            border-radius: 12px;
            padding: 30px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
            border: 2px dashed #e5e5e5;
        }
        .header {
            text-align: center;
            border-bottom: 2px solid #3b82f6;
            padding-bottom: 20px;
            margin-bottom: 20px;
        }
        .logo {
            font-size: 28px;
            font-weight: bold;
            color: #3b82f6;
            margin-bottom: 10px;
        }
        .event-name {
            font-size: 24px;
            font-weight: bold;
            color: #1f2937;
            margin-bottom: 10px;
        }
        .ticket-code {
            font-size: 18px;
            color: #6b7280;
            font-family: monospace;
            background: #f3f4f6;
            padding: 8px 16px;
            border-radius: 6px;
            display: inline-block;
        }
        .details {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin: 20px 0;
        }
        .detail-item {
            padding: 15px;
            background: #f8fafc;
            border-radius: 8px;
            border-left: 4px solid #3b82f6;
        }
        .detail-label {
            font-weight: bold;
            color: #374151;
            margin-bottom: 5px;
        }
        .detail-value {
            color: #6b7280;
            font-size: 16px;
        }
        .qr-section {
            text-align: center;
            margin: 30px 0;
            padding: 20px;
            background: #f8fafc;
            border-radius: 8px;
        }
        .instructions {
            margin-top: 30px;
            padding: 20px;
            background: #fef3c7;
            border-radius: 8px;
            border-left: 4px solid #f59e0b;
        }
        .instructions h3 {
            color: #92400e;
            margin-bottom: 10px;
        }
        .instructions ul {
            color: #92400e;
            padding-left: 20px;
        }
        .instructions li {
            margin-bottom: 5px;
        }
        @media print {
            body { background-color: white; }
            .ticket { box-shadow: none; }
        }
    </style>
</head>
<body>
    <div class="ticket">
        <div class="header">
            <div class="logo">🎫 ZaTix</div>
            <div class="event-name">${event?.name || 'Event Ticket'}</div>
            <div class="ticket-code">${ticket.ticket_code}</div>
        </div>
        
        <div class="details">
            <div class="detail-item">
                <div class="detail-label">Attendee Name</div>
                <div class="detail-value">${ticket.attendee_name}</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Ticket Type</div>
                <div class="detail-value">${ticket.ticket?.name || 'N/A'}</div>
            </div>
            ${event ? `
            <div class="detail-item">
                <div class="detail-label">Event Date</div>
                <div class="detail-value">${formatDate(event.start_date)}</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Event Time</div>
                <div class="detail-value">${event.start_time} - ${event.end_time} WIB</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Location</div>
                <div class="detail-value">${event.location}</div>
            </div>
            ` : ''}
            <div class="detail-item">
                <div class="detail-label">Check-in Status</div>
                <div class="detail-value">${ticket.checked_in_at ? 'Checked In' : 'Not Checked In'}</div>
            </div>
        </div>
        
        <div class="qr-section">
            <p><strong>QR Code:</strong></p>
            ${qrCodeDataURL ? `<img src="${qrCodeDataURL}" alt="QR Code for ${ticket.ticket_code}" style="margin: 10px auto; display: block; max-width: 200px; height: auto;" />` : ''}
            <p>Please present this QR code at the event entrance</p>
            <p>Ticket Code: <strong>${ticket.ticket_code}</strong></p>
        </div>
        
        <div class="instructions">
            <h3>🎯 Instructions</h3>
            <ul>
                <li>Bring this ticket (printed or digital) to the event</li>
                <li>Present your ticket code at the entrance for scanning</li>
                <li>Arrive 30 minutes before the event starts</li>
                <li>This ticket is non-transferable and valid for single entry only</li>
                <li>Keep this ticket safe - lost tickets cannot be replaced</li>
            </ul>
        </div>
        
        <div style="text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px;">
            <p>Generated on ${new Date().toLocaleDateString('id-ID')} • ZaTix Event Management</p>
            <p>🔒 This is a secure e-ticket • Do not share this ticket code</p>
        </div>
    </div>
</body>
</html>
    `
  }

  const renderTicketCard = (ticket: CustomerTicket) => {
    const event = ticket.ticket?.event
    const ticketStatus = ticket.status || 'active'
    
    // For now, since we don't have event data in the ticket response, 
    // we'll display the available ticket information
    return (
      <Card key={ticket.id} className="hover:shadow-md transition-shadow">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <CardTitle className="text-lg">
                {event?.name || `${ticket.ticket?.name || 'Event'} Ticket`}
              </CardTitle>
              <CardDescription>
                Ticket Code: {ticket.ticket_code} • Attendee: {ticket.attendee_name}
              </CardDescription>
            </div>
            <Badge variant={getStatusColor(ticketStatus)}>
              {ticketStatus.charAt(0).toUpperCase() + ticketStatus.slice(1)}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              {event && (
                <>
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
                </>
              )}
              {!event && (
                <div className="text-sm text-muted-foreground">
                  Event details not available
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <div className="text-sm">
                <span className="font-medium">Ticket Type:</span> {ticket.ticket?.name || 'N/A'}
              </div>
              <div className="text-sm">
                <span className="font-medium">Check-in Status:</span> {
                  ticket.checked_in_at ? 'Checked In' : 'Not Checked In'
                }
              </div>
              {ticket.checked_in_at && (
                <div className="text-sm">
                  <span className="font-medium">Checked In:</span> {
                    new Date(ticket.checked_in_at).toLocaleDateString('id-ID')
                  }
                </div>
              )}
            </div>
          </div>
          
          {ticketStatus === "active" && (
            <div className="flex flex-wrap gap-2 pt-4">
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => handleDownloadTicket(ticket)}
              >
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
          
          {!ticket.checked_in_at && ticketStatus === "active" && (
            <div className="flex items-center gap-2 pt-4">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-green-600 font-medium">
                Ready for event
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