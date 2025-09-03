"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, MapPin, Clock, Download, QrCode, RefreshCw } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { ProtectedRoute } from "@/components/protected-route"
import { Header } from "@/components/header"
import { orderApi } from "@/lib/api"
import { CustomerTicket } from "@/types/events"
import { toast } from "@/components/ui/use-toast"
import { QRCodeModal } from "@/components/qr-code-modal"
import QRCode from 'qrcode'
import jsPDF from 'jspdf'

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
      const pdf = new jsPDF('portrait', 'mm', 'a4')
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      
      // Colors
      const primaryColor = '#2563eb' // Blue
      const grayColor = '#6b7280'
      const lightGrayColor = '#f3f4f6'
      
      // Add Zatix logo
      try {
        const logoImg = new Image()
        logoImg.crossOrigin = 'anonymous'
        logoImg.src = '/zatix-logo.png'
        
        await new Promise((resolve, reject) => {
          logoImg.onload = resolve
          logoImg.onerror = reject
          // Add timeout to prevent hanging
          setTimeout(reject, 3000)
        })
        
        // Add logo (top left)
        pdf.addImage(logoImg, 'PNG', 20, 15, 40, 15)
      } catch (error) {
        console.warn('Could not load logo, continuing without it:', error)
        // Add text logo as fallback
        pdf.setFontSize(16)
        pdf.setTextColor(primaryColor)
        pdf.text('ZATIX', 20, 25)
      }
      
      // Header - E-Ticket
      pdf.setFontSize(24)
      pdf.setTextColor(primaryColor)
      pdf.text('E-TICKET', pageWidth - 20, 25, { align: 'right' })
      
      // Ticket code
      pdf.setFontSize(12)
      pdf.setTextColor(grayColor)
      pdf.text(`Ticket Code: ${ticket.ticket_code}`, pageWidth - 20, 32, { align: 'right' })
      
      // Draw separator line
      pdf.setDrawColor(lightGrayColor)
      pdf.setLineWidth(0.5)
      pdf.line(20, 45, pageWidth - 20, 45)
      
      // Event Information Section
      let yPos = 60
      const event = ticket.ticket?.event
      
      if (event) {
        pdf.setFontSize(18)
        pdf.setTextColor(0, 0, 0)
        pdf.text('EVENT INFORMATION', 20, yPos)
        yPos += 15
        
        // Event name
        pdf.setFontSize(16)
        pdf.setTextColor(primaryColor)
        const eventName = pdf.splitTextToSize(event.name, pageWidth - 40)
        pdf.text(eventName, 20, yPos)
        yPos += (eventName.length * 7) + 10
        
        // Event details
        pdf.setFontSize(11)
        pdf.setTextColor(0, 0, 0)
        
        // Date
        pdf.text('📅 Date:', 20, yPos)
        pdf.text(formatDate(event.start_date), 50, yPos)
        yPos += 8
        
        // Time
        pdf.text('🕐 Time:', 20, yPos)
        pdf.text(`${event.start_time} - ${event.end_time} WIB`, 50, yPos)
        yPos += 8
        
        // Location
        pdf.text('📍 Location:', 20, yPos)
        const locationText = pdf.splitTextToSize(event.location, pageWidth - 60)
        pdf.text(locationText, 50, yPos)
        yPos += (locationText.length * 6) + 15
      }
      
      // Ticket Information Section
      pdf.setFontSize(18)
      pdf.setTextColor(0, 0, 0)
      pdf.text('TICKET INFORMATION', 20, yPos)
      yPos += 15
      
      pdf.setFontSize(11)
      pdf.text('Attendee Name:', 20, yPos)
      pdf.text(ticket.attendee_name, 60, yPos)
      yPos += 8
      
      pdf.text('Ticket Type:', 20, yPos)
      pdf.text(ticket.ticket?.name || 'Standard Ticket', 60, yPos)
      yPos += 8
      
      pdf.text('Status:', 20, yPos)
      pdf.setTextColor(ticket.status === 'active' ? '#059669' : '#dc2626')
      pdf.text((ticket.status || 'active').toUpperCase(), 60, yPos)
      yPos += 20
      
      // QR Code Section
      pdf.setTextColor(0, 0, 0)
      pdf.setFontSize(18)
      pdf.text('QR CODE', 20, yPos)
      yPos += 10
      
      // Generate and add QR code
      try {
        const qrCodeDataURL = await QRCode.toDataURL(ticket.ticket_code, {
          width: 300,
          margin: 2,
          errorCorrectionLevel: 'M',
          type: 'image/png',
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        })
        
        const qrSize = 60
        const qrX = (pageWidth - qrSize) / 2
        pdf.addImage(qrCodeDataURL, 'PNG', qrX, yPos, qrSize, qrSize)
        yPos += qrSize + 15
      } catch (error) {
        console.warn('Could not generate QR code for PDF')
        yPos += 15
      }
      
      // Instructions
      pdf.setFontSize(14)
      pdf.setTextColor(primaryColor)
      pdf.text('INSTRUCTIONS', 20, yPos)
      yPos += 10
      
      pdf.setFontSize(10)
      pdf.setTextColor(0, 0, 0)
      const instructions = [
        '• Show this QR code to event staff at the entrance',
        '• Make sure the QR code is clearly visible and not damaged',
        '• Keep this ticket available during the event',
        '• One scan per entry - do not share this QR code',
        '• This ticket is non-transferable and valid for single use only'
      ]
      
      instructions.forEach(instruction => {
        pdf.text(instruction, 25, yPos)
        yPos += 6
      })
      
      // Footer
      yPos = pageHeight - 30
      pdf.setDrawColor(lightGrayColor)
      pdf.line(20, yPos, pageWidth - 20, yPos)
      yPos += 8
      
      pdf.setFontSize(9)
      pdf.setTextColor(grayColor)
      pdf.text('🔒 This ticket is unique and cannot be transferred', 20, yPos)
      pdf.text('Generated by Zatix Event Management', pageWidth - 20, yPos, { align: 'right' })
      
      // Download the PDF
      pdf.save(`zatix-ticket-${ticket.ticket_code}.pdf`)
      
      toast({
        title: "Ticket Downloaded",
        description: "Your PDF ticket has been downloaded successfully"
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
        <div className="flex min-h-screen flex-col">
          <Header />
          <main className="flex-1">
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
          </main>
        </div>
      </ProtectedRoute>
    )
  }

  if (error) {
    return (
      <ProtectedRoute requiredRoles={["customer"]}>
        <div className="flex min-h-screen flex-col">
          <Header />
          <main className="flex-1">
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
          </main>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute requiredRoles={["customer"]}>
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">
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
        </main>
      </div>
    </ProtectedRoute>
  )
}