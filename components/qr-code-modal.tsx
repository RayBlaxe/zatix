"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Download, X, Smartphone, Calendar, MapPin, Clock } from "lucide-react"
import { CustomerTicket } from "@/types/events"

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

  const handleSaveToPhone = () => {
    // For mobile devices, open QR code in new tab for saving
    if (navigator.userAgent.match(/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i)) {
      window.open(qrCodeData, '_blank')
    } else {
      handleDownloadQR()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>E-Ticket QR Code</span>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="size-4" />
            </Button>
          </DialogTitle>
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
            <Button variant="outline" onClick={handleDownloadQR} className="w-full">
              <Download className="mr-2 size-4" />
              Download
            </Button>
            <Button onClick={handleSaveToPhone} className="w-full">
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