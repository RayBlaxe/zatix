"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  ShieldCheck,
  Users,
  Clock,
  Minus,
  Plus
} from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"
import { ticketLimitsApi } from "@/lib/api"
import { cn } from "@/lib/utils"

interface EnhancedTicketSelectionProps {
  tickets: Array<{
    id: number
    name: string
    price: string
    stock: number
    limit: number
    start_date: string
    end_date: string
  }>
  ticketSelections: Array<{
    ticketId: number
    quantity: number
    price: number
    name: string
    maxLimit: number
    stock: number
  }>
  onSelectionChange: (selections: Array<{
    ticketId: number
    quantity: number
    price: number
    name: string
    maxLimit: number
    stock: number
  }>) => void
}

interface LimitValidationStatus {
  ticket_id: number
  is_valid: boolean
  available_quantity: number
  limit_type: string
  limit_value: number
  user_purchased: number
  error_message?: string
}

export function EnhancedTicketSelection({ 
  tickets, 
  ticketSelections, 
  onSelectionChange 
}: EnhancedTicketSelectionProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  
  const [validationStatus, setValidationStatus] = useState<Record<number, LimitValidationStatus>>({})
  const [checking, setChecking] = useState(false)
  const [userHistory, setUserHistory] = useState<Record<number, any>>({})

  useEffect(() => {
    // Load user purchase history for all tickets
    if (user && tickets.length > 0) {
      loadUserHistory()
    }
  }, [user, tickets])

  useEffect(() => {
    // Validate limits whenever selections change
    if (user && ticketSelections.some(s => s.quantity > 0)) {
      validateLimits()
    }
  }, [ticketSelections, user])

  const loadUserHistory = async () => {
    if (!user) return

    try {
      const historyPromises = tickets.map(async (ticket) => {
        try {
          const response = await ticketLimitsApi.getUserPurchaseHistory(parseInt(user.id), ticket.id)
          return { ticketId: ticket.id, history: response.success ? response.data : null }
        } catch (error) {
          return { ticketId: ticket.id, history: null }
        }
      })
      
      const allHistory = await Promise.all(historyPromises)
      const historyMap = allHistory.reduce((acc, { ticketId, history }) => {
        acc[ticketId] = history
        return acc
      }, {} as Record<number, any>)
      setUserHistory(historyMap)
    } catch (error) {
      console.error("Failed to load user history:", error)
    }
  }

  const validateLimits = async () => {
    if (!user) return

    try {
      setChecking(true)
      
      // Prepare bulk validation request
      const items = ticketSelections
        .filter(s => s.quantity > 0)
        .map(s => ({
          ticket_id: s.ticketId,
          quantity: s.quantity
        }))

      if (items.length === 0) {
        setValidationStatus({})
        return
      }

      const response = await ticketLimitsApi.bulkCheckLimits({
        user_id: parseInt(user.id),
        items
      })

      if (response.success && response.data) {
        const statusMap = response.data.validations.reduce((acc: Record<number, LimitValidationStatus>, validation: any) => {
          acc[validation.ticket_id] = validation
          return acc
        }, {})
        setValidationStatus(statusMap)

        // Show toast for violations
        if (response.data.total_violations > 0) {
          toast({
            title: "Limit Violation Detected",
            description: `${response.data.total_violations} ticket(s) exceed purchase limits`,
            variant: "destructive",
          })
        }
      }
    } catch (error) {
      console.error("Failed to validate limits:", error)
    } finally {
      setChecking(false)
    }
  }

  const updateTicketQuantity = async (ticketId: number, delta: number) => {
    const currentSelection = ticketSelections.find(s => s.ticketId === ticketId)
    if (!currentSelection) return

    const newQuantity = Math.max(0, currentSelection.quantity + delta)
    const maxAllowed = Math.min(currentSelection.maxLimit, currentSelection.stock)
    
    // Basic quantity bounds check
    if (newQuantity > maxAllowed) {
      toast({
        title: "Quantity Limit Exceeded",
        description: `Maximum ${maxAllowed} tickets allowed for ${currentSelection.name}`,
        variant: "destructive",
      })
      return
    }

    // Update selections
    const newSelections = ticketSelections.map(s => 
      s.ticketId === ticketId ? { ...s, quantity: newQuantity } : s
    )
    onSelectionChange(newSelections)
  }

  const setTicketQuantity = (ticketId: number, quantity: number) => {
    const currentSelection = ticketSelections.find(s => s.ticketId === ticketId)
    if (!currentSelection) return

    const maxAllowed = Math.min(currentSelection.maxLimit, currentSelection.stock)
    const boundedQuantity = Math.max(0, Math.min(maxAllowed, quantity))
    
    const newSelections = ticketSelections.map(s => 
      s.ticketId === ticketId ? { ...s, quantity: boundedQuantity } : s
    )
    onSelectionChange(newSelections)
  }

  const formatPrice = (price: number) => {
    if (price === 0) return "Free"
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(price)
  }

  const getLimitStatusIcon = (ticketId: number) => {
    const status = validationStatus[ticketId]
    if (!status) return <Info className="h-4 w-4 text-muted-foreground" />
    
    return status.is_valid ? 
      <CheckCircle className="h-4 w-4 text-green-500" /> :
      <AlertTriangle className="h-4 w-4 text-red-500" />
  }

  const getLimitStatusColor = (ticketId: number) => {
    const status = validationStatus[ticketId]
    if (!status) return "border-gray-200"
    return status.is_valid ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"
  }

  const isTicketAvailable = (ticket: any) => {
    const now = new Date()
    const startDate = new Date(ticket.start_date)
    const endDate = new Date(ticket.end_date)
    return now >= startDate && now <= endDate && ticket.stock > 0
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold">Available Tickets</h4>
        {checking && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4 animate-spin" />
            Validating limits...
          </div>
        )}
      </div>

      {ticketSelections.map((selection) => {
        const ticket = tickets.find(t => t.id === selection.ticketId)
        const isAvailable = ticket ? isTicketAvailable(ticket) : false
        const status = validationStatus[selection.ticketId]
        const history = userHistory[selection.ticketId]
        
        return (
          <div 
            key={selection.ticketId} 
            className={cn(
              "border rounded-lg p-4 transition-colors",
              getLimitStatusColor(selection.ticketId)
            )}
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h5 className="font-medium">{selection.name}</h5>
                  {getLimitStatusIcon(selection.ticketId)}
                  {!isAvailable && (
                    <Badge variant="destructive">Unavailable</Badge>
                  )}
                </div>
                
                <div className="space-y-1 text-sm text-gray-600">
                  <p>
                    {selection.stock} available • Max {selection.maxLimit} per order
                  </p>
                  {history && (
                    <p className="flex items-center gap-2">
                      <Users className="h-3 w-3" />
                      You've purchased {history.total_purchased} total tickets
                      {history.daily_purchased > 0 && ` (${history.daily_purchased} today)`}
                    </p>
                  )}
                </div>
                
                <p className="font-semibold text-primary mt-1">
                  {formatPrice(selection.price)}
                </p>

                {/* Limit Validation Message */}
                {status && !status.is_valid && (
                  <Alert className="mt-2 border-red-200 bg-red-50">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription className="text-sm">
                      {status.error_message}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Limit Information */}
                {status && status.is_valid && selection.quantity > 0 && (
                  <Alert className="mt-2 border-green-200 bg-green-50">
                    <ShieldCheck className="h-4 w-4" />
                    <AlertDescription className="text-sm">
                      Valid purchase • {status.limit_type} limit: {status.limit_value}
                      {status.user_purchased > 0 && ` (You've used ${status.user_purchased})`}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
              
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateTicketQuantity(selection.ticketId, -1)}
                  disabled={selection.quantity === 0 || !isAvailable}
                >
                  <Minus className="size-4" />
                </Button>
                
                <Input
                  type="number"
                  min="0"
                  max={Math.min(selection.maxLimit, selection.stock)}
                  value={selection.quantity}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 0
                    setTicketQuantity(selection.ticketId, value)
                  }}
                  className="w-16 text-center"
                  disabled={!isAvailable}
                />
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateTicketQuantity(selection.ticketId, 1)}
                  disabled={
                    !isAvailable ||
                    selection.quantity >= selection.maxLimit || 
                    selection.quantity >= selection.stock ||
                    (status && !status.is_valid)
                  }
                >
                  <Plus className="size-4" />
                </Button>
              </div>
            </div>
          </div>
        )
      })}

      {/* Overall Validation Summary */}
      {Object.keys(validationStatus).length > 0 && (
        <Card className="mt-4">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <ShieldCheck className="h-4 w-4" />
              Purchase Limit Validation
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {Object.values(validationStatus).every((s: any) => s.is_valid) ? (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm">All selections are within limits</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-red-600">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="text-sm">
                    Some selections exceed limits and cannot be purchased
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
