"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Download, X, Smartphone, Calendar, MapPin, Clock } from "lucide-react"
import { CustomerTicket } from "@/types/events"
import jsPDF from 'jspdf'

interface QRCodeModalProps {
  ticket: CustomerTicket | null
  qrCodeData: string | null
  isOpen: boolean
  onClose: () => void
}

export function QRCodeModal({ ticket, qrCodeData, isOpen, onClose }: QRCodeModalProps) {
  const [imageError, setImageError] = useState(false)

  if (!ticket || !qrCodeData) return null

  const event = ticket.ticket?.event || ticket.order?.event
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const handleDownloadQR = () => {
    try {
      // Create a temporary link to download the QR code
      const link = document.createElement('a')
      link.href = qrCodeData
      link.download = `ticket-${ticket.ticket_code}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error('Error downloading QR code:', error)
    }
  }

  const generatePDFTicket = async () => {
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
      
      // Add QR code image
      if (qrCodeData) {
        const qrSize = 60
        const qrX = (pageWidth - qrSize) / 2
        pdf.addImage(qrCodeData, 'PNG', qrX, yPos, qrSize, qrSize)
        yPos += qrSize + 15
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
    } catch (error) {
      console.error('Error generating PDF ticket:', error)
      // Fallback to original QR download
      handleDownloadQR()
    }
  }

  const handleSaveToPhone = () => {
    // Generate and download PDF for all devices
    generatePDFTicket()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle>E-Ticket QR Code</DialogTitle>
          <DialogDescription>
            Show this QR code at the event entrance
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Event Info */}
          {event && (
            <Card>
              <CardContent className="p-4">
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg">{event.name}</h3>
                  <div className="grid grid-cols-1 gap-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="size-4" />
                      <span>{formatDate(event.start_date)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="size-4" />
                      <span>{event.start_time} - {event.end_time} WIB</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="size-4" />
                      <span>{event.location}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Ticket Info */}
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2">
              <Badge variant="outline">{ticket.ticket?.name || 'Ticket'}</Badge>
              <Badge variant={(ticket.status || 'active') === 'active' ? 'default' : 'secondary'}>
                {(ticket.status || 'active').charAt(0).toUpperCase() + (ticket.status || 'active').slice(1)}
              </Badge>
            </div>
            <p className="text-sm text-gray-600">Ticket Code: {ticket.ticket_code}</p>
          </div>

          {/* QR Code */}
          <div className="flex justify-center">
            <Card className="p-4">
              <CardContent className="p-0">
                {!imageError ? (
                  <img
                    src={qrCodeData}
                    alt={`QR Code for ticket ${ticket.ticket_code}`}
                    className="w-48 h-48 object-contain"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <div className="w-48 h-48 bg-gray-100 flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <div className="size-12 mx-auto mb-2 bg-gray-300 rounded"></div>
                      <p className="text-sm">QR Code</p>
                      <p className="text-xs">{ticket.ticket_code}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">How to use:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Show this QR code to event staff at the entrance</li>
              <li>• Make sure your phone screen is bright and clear</li>
              <li>• Keep this ticket available during the event</li>
              <li>• One scan per entry - do not share this QR code</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" onClick={generatePDFTicket} className="w-full">
              <Download className="mr-2 size-4" />
              Download Ticket
            </Button>
            <Button onClick={generatePDFTicket} className="w-full">
              <Smartphone className="mr-2 size-4" />
              Save to Phone
            </Button>
          </div>

          {/* Security Notice */}
          <div className="text-center text-xs text-gray-500">
            <p>🔒 This QR code is unique and cannot be transferred</p>
            <p>Valid for single entry only</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}