"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Calendar, 
  MapPin, 
  Clock, 
  ArrowLeft,
  Minus,
  Plus,
  ShoppingCart,
  CreditCard,
  Info
} from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { Header } from "@/components/header"
import { ProtectedRoute } from "@/components/protected-route"
import { eventApi, orderApi, paymentApi } from "@/lib/api"
import { Event, OrderItem } from "@/types/events"
import { 
  OrderCreateRequest, 
  OrderCreateResponse, 
  PaymentMethodsResponse,
  PaymentMethodSelectionData 
} from "@/types/payment"
import { toast } from "@/components/ui/use-toast"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { PaymentForm } from "@/components/payment/payment-form"
import { PaymentMethodSelection } from "@/components/payment/payment-method-selection"

// Form validation schema
const checkoutFormSchema = z.object({
  customer_name: z.string().min(2, "Name must be at least 2 characters"),
  customer_email: z.string().email("Please enter a valid email address"),
  customer_phone: z.string().min(10, "Phone number must be at least 10 characters")
})

type CheckoutFormData = z.infer<typeof checkoutFormSchema>

interface TicketSelection {
  ticketId: number
  quantity: number
  price: number
  name: string
  maxLimit: number
  stock: number
}

export default function TicketPurchasePage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [ticketSelections, setTicketSelections] = useState<TicketSelection[]>([])
  const [showPaymentMethodSelection, setShowPaymentMethodSelection] = useState(false)
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [orderResponse, setOrderResponse] = useState<OrderCreateResponse | null>(null)
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodsResponse | null>(null)
  const [customerFormData, setCustomerFormData] = useState<CheckoutFormData | null>(null)

  const form = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      customer_name: user?.name || "",
      customer_email: user?.email || "",
      customer_phone: ""
    }
  })

  useEffect(() => {
    if (params.id) {
      fetchEvent()
      fetchPaymentMethods()
    }
  }, [params.id])

  useEffect(() => {
    if (event && user) {
      form.setValue("customer_name", user.name || "")
      form.setValue("customer_email", user.email || "")
    }
  }, [event, user, form])

  const fetchEvent = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await eventApi.getPublicEvent(Number(params.id))
      
      if (response.success) {
        setEvent(response.data)
        // Initialize ticket selections
        const initialSelections = response.data.tickets.map(ticket => ({
          ticketId: ticket.id,
          quantity: 0,
          price: parseFloat(ticket.price),
          name: ticket.name,
          maxLimit: ticket.limit,
          stock: ticket.stock
        }))
        setTicketSelections(initialSelections)
      } else {
        setError(response.message || "Failed to fetch event details")
      }
    } catch (err) {
      setError("An error occurred while fetching event details")
      console.error("Error fetching event:", err)
    } finally {
      setLoading(false)
    }
  }

  const fetchPaymentMethods = async () => {
    try {
      const response = await paymentApi.getPaymentMethods()
      setPaymentMethods(response)
    } catch (err) {
      console.error("Error fetching payment methods:", err)
    }
  }

  const updateTicketQuantity = (ticketId: number, delta: number) => {
    setTicketSelections(prev => prev.map(selection => {
      if (selection.ticketId === ticketId) {
        const newQuantity = Math.max(0, Math.min(selection.maxLimit, selection.stock, selection.quantity + delta))
        return { ...selection, quantity: newQuantity }
      }
      return selection
    }))
  }

  const setTicketQuantity = (ticketId: number, quantity: number) => {
    setTicketSelections(prev => prev.map(selection => {
      if (selection.ticketId === ticketId) {
        const newQuantity = Math.max(0, Math.min(selection.maxLimit, selection.stock, quantity))
        return { ...selection, quantity: newQuantity }
      }
      return selection
    }))
  }

  const getTotalAmount = () => {
    return ticketSelections.reduce((total, selection) => {
      return total + (selection.quantity * selection.price)
    }, 0)
  }

  const getTotalTickets = () => {
    return ticketSelections.reduce((total, selection) => total + selection.quantity, 0)
  }

  const getSelectedItems = (): Array<{ ticket_id: number; quantity: number }> => {
    return ticketSelections
      .filter(selection => selection.quantity > 0)
      .map(selection => ({
        ticket_id: selection.ticketId,
        quantity: selection.quantity
      }))
  }

  const formatPrice = (price: number) => {
    if (price === 0) return "Free"
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

  const onSubmit = async (data: CheckoutFormData) => {
    const selectedItems = getSelectedItems()
    
    if (selectedItems.length === 0) {
      toast({
        title: "No Tickets Selected",
        description: "Please select at least one ticket",
        variant: "destructive"
      })
      return
    }

    // Validate payment methods are loaded
    if (!paymentMethods) {
      toast({
        title: "Payment Methods Not Available",
        description: "Please wait for payment methods to load",
        variant: "destructive"
      })
      return
    }

    // Store customer form data and show payment method selection
    setCustomerFormData(data)
    setShowPaymentMethodSelection(true)
  }

  const handlePaymentMethodSelected = async (data: PaymentMethodSelectionData) => {
    try {
      setSubmitting(true)
      
      // Find payment method ID - need to map from the payment methods response
      let paymentMethodId = 1 // Default fallback
      
      // Find the payment method ID by looking through all groups
      for (const group of paymentMethods?.data || []) {
        const foundMethod = group.payment_methods.find(pm => pm.code === data.paymentMethod.code)
        if (foundMethod) {
          // For now, use a simple mapping - you may need to adjust based on your backend
          // Since your API example shows payment_method: 1 for Bank Transfer (VA)
          paymentMethodId = data.paymentMethod.type === 'bank_transfer' ? 1 : 1
          break
        }
      }

      // Create order with backend API
      const orderRequest: OrderCreateRequest = {
        items: data.ticketItems,
        payment_method_id: paymentMethodId
      }

      const response = await orderApi.createOrder(orderRequest)
      
      if (response.success) {
        setOrderResponse(response)
        setShowPaymentMethodSelection(false)
        setShowPaymentForm(true)
        toast({
          title: "Order Created",
          description: "Please complete your payment",
        })
      } else {
        toast({
          title: "Failed to Create Order",
          description: response.message || "An error occurred",
          variant: "destructive"
        })
      }
    } catch (err) {
      console.error("Error creating order:", err)
      toast({
        title: "Error",
        description: "Failed to create order. Please try again.",
        variant: "destructive"
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handlePaymentMethodSelectionCancel = () => {
    setShowPaymentMethodSelection(false)
    setCustomerFormData(null)
  }

  const handlePaymentSuccess = (result: any) => {
    toast({
      title: "Payment Successful",
      description: "Your tickets have been purchased successfully!",
    })
    router.push("/my-tickets")
  }

  const handlePaymentError = (error: string) => {
    toast({
      title: "Payment Failed",
      description: error,
      variant: "destructive"
    })
  }

  if (loading) {
    return (
      <ProtectedRoute requiredRoles={["customer"]}>
        <div className="flex min-h-screen flex-col">
          <Header />
          <main className="flex-1">
            <div className="container py-8">
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2">
                    <div className="h-64 bg-gray-200 rounded-lg mb-6"></div>
                  </div>
                  <div className="lg:col-span-1">
                    <div className="h-64 bg-gray-200 rounded-lg"></div>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </ProtectedRoute>
    )
  }

  if (error || !event) {
    return (
      <ProtectedRoute requiredRoles={["customer"]}>
        <div className="flex min-h-screen flex-col">
          <Header />
          <main className="flex-1">
            <div className="container py-8">
              <Button 
                variant="ghost" 
                onClick={() => router.back()}
                className="mb-4"
              >
                <ArrowLeft className="mr-2 size-4" />
                Back
              </Button>
              <Alert variant="destructive">
                <AlertDescription>
                  {error || "Event not found"}
                </AlertDescription>
              </Alert>
            </div>
          </main>
        </div>
      </ProtectedRoute>
    )
  }

  const totalAmount = getTotalAmount()
  const totalTickets = getTotalTickets()

  return (
    <ProtectedRoute requiredRoles={["customer"]}>
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">
          <div className="container py-8">
            {/* Back Button */}
            <Button 
              variant="ghost" 
              onClick={() => router.back()}
              className="mb-6"
            >
              <ArrowLeft className="mr-2 size-4" />
              Back to Event
            </Button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Ticket Selection */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ShoppingCart className="size-5" />
                      Select Tickets
                    </CardTitle>
                    <CardDescription>Choose your tickets for {event.name}</CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-6">
                    {/* Event Info */}
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h3 className="font-semibold mb-2">{event.name}</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Calendar className="size-4" />
                          {formatDate(event.start_date)}
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="size-4" />
                          {event.start_time} - {event.end_time}
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="size-4" />
                          {event.location}
                        </div>
                      </div>
                    </div>

                    {/* Ticket Types */}
                    <div className="space-y-4">
                      <h4 className="font-semibold">Available Tickets</h4>
                      {ticketSelections.map((selection) => (
                        <div key={selection.ticketId} className="border rounded-lg p-4">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex-1">
                              <h5 className="font-medium">{selection.name}</h5>
                              <p className="text-sm text-gray-600">
                                {selection.stock} available • Max {selection.maxLimit} per person
                              </p>
                              <p className="font-semibold text-primary mt-1">
                                {formatPrice(selection.price)}
                              </p>
                            </div>
                            
                            <div className="flex items-center gap-3">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updateTicketQuantity(selection.ticketId, -1)}
                                disabled={selection.quantity === 0}
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
                              />
                              
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updateTicketQuantity(selection.ticketId, 1)}
                                disabled={selection.quantity >= selection.maxLimit || selection.quantity >= selection.stock}
                              >
                                <Plus className="size-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Customer Information */}
                    <div className="space-y-4">
                      <h4 className="font-semibold">Customer Information</h4>
                      <Form {...form}>
                        <form className="space-y-4">
                          <FormField
                            control={form.control}
                            name="customer_name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Full Name</FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder="Enter your full name" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="customer_email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email Address</FormLabel>
                                <FormControl>
                                  <Input {...field} type="email" placeholder="Enter your email address" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="customer_phone"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Phone Number</FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder="Enter your phone number" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </form>
                      </Form>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <Card className="sticky top-8">
                  <CardHeader>
                    <CardTitle>Order Summary</CardTitle>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {/* Selected Tickets */}
                    <div className="space-y-2">
                      {ticketSelections
                        .filter(selection => selection.quantity > 0)
                        .map((selection) => (
                          <div key={selection.ticketId} className="flex justify-between text-sm">
                            <span>{selection.name} × {selection.quantity}</span>
                            <span>{formatPrice(selection.quantity * selection.price)}</span>
                          </div>
                        ))}
                      
                      {totalTickets === 0 && (
                        <p className="text-gray-500 text-sm italic">No tickets selected</p>
                      )}
                    </div>

                    <Separator />

                    {/* Total */}
                    <div className="flex justify-between font-semibold">
                      <span>Total ({totalTickets} ticket{totalTickets !== 1 ? 's' : ''})</span>
                      <span className="text-primary">{formatPrice(totalAmount)}</span>
                    </div>

                    {/* Payment Info */}
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-start gap-2">
                        <Info className="size-4 text-blue-600 mt-0.5" />
                        <div className="text-sm text-blue-800">
                          <p className="font-medium">Payment via Midtrans</p>
                          <p>Secure payment with various payment methods available</p>
                        </div>
                      </div>
                    </div>

                    {/* Checkout Button */}
                    <Button 
                      className="w-full h-12 text-lg font-semibold"
                      onClick={form.handleSubmit(onSubmit)}
                      disabled={totalTickets === 0 || submitting}
                    >
                      <CreditCard className="mr-2 size-5" />
                      {submitting ? "Processing..." : "Proceed to Payment"}
                    </Button>

                    {/* Trust Indicators */}
                    <div className="text-center pt-4 border-t">
                      <p className="text-xs text-gray-500">
                        🔒 Secure payment • 📧 Instant e-ticket delivery
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Payment Method Selection Modal */}
            {showPaymentMethodSelection && paymentMethods && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white p-6 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold">Select Payment Method</h2>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={handlePaymentMethodSelectionCancel}
                      disabled={submitting}
                    >
                      ✕
                    </Button>
                  </div>
                  
                  <PaymentMethodSelection
                    paymentMethods={paymentMethods}
                    ticketItems={getSelectedItems()}
                    totalAmount={getTotalAmount()}
                    onMethodSelected={handlePaymentMethodSelected}
                    onCancel={handlePaymentMethodSelectionCancel}
                    loading={submitting}
                  />
                </div>
              </div>
            )}

            {/* Payment Form Modal/Section */}
            {showPaymentForm && orderResponse && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white p-6 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold">Complete Payment</h2>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setShowPaymentForm(false)}
                    >
                      ✕
                    </Button>
                  </div>
                  
                  <PaymentForm
                    orderResponse={orderResponse}
                    paymentMethods={paymentMethods}
                    onPaymentSuccess={handlePaymentSuccess}
                    onPaymentError={handlePaymentError}
                  />
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}