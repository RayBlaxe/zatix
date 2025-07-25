"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  OrderCreateResponse, 
  PaymentMethodsResponse,
  OrderStatusResponse
} from "@/types/payment"
import { orderApi } from "@/lib/api"
import { QrCode, Copy, CheckCircle, Clock, RefreshCw } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

interface PaymentFormProps {
  orderResponse: OrderCreateResponse
  paymentMethods: PaymentMethodsResponse | null
  onPaymentSuccess: (result: any) => void
  onPaymentError: (error: string) => void
  className?: string
}

export function PaymentForm({
  orderResponse,
  paymentMethods,
  onPaymentSuccess,
  onPaymentError,
  className
}: PaymentFormProps) {
  const [loading, setLoading] = useState(false)
  const [orderStatus, setOrderStatus] = useState<OrderStatusResponse | null>(null)
  const [checkingStatus, setCheckingStatus] = useState(false)

  // Check payment status periodically
  useEffect(() => {
    const checkPaymentStatus = async () => {
      if (!orderResponse.data.order_id) return
      
      try {
        setCheckingStatus(true)
        const status = await orderApi.getOrderStatus(orderResponse.data.order_id)
        setOrderStatus(status)
        
        if (status.success && status.data.payment_status === 'success') {
          onPaymentSuccess(status)
        }
      } catch (err) {
        console.error('Error checking payment status:', err)
      } finally {
        setCheckingStatus(false)
      }
    }

    // Check status immediately
    checkPaymentStatus()
    
    // Set up periodic status checking every 10 seconds
    const interval = setInterval(checkPaymentStatus, 10000)
    
    return () => clearInterval(interval)
  }, [orderResponse.data.order_id, onPaymentSuccess])

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied!",
      description: "Information copied to clipboard"
    })
  }

  const formatPrice = (amount: string) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(parseFloat(amount))
  }

  const manualStatusCheck = async () => {
    setCheckingStatus(true)
    try {
      const status = await orderApi.getOrderStatus(orderResponse.data.order_id)
      setOrderStatus(status)
      
      if (status.success && status.data.payment_status === 'success') {
        onPaymentSuccess(status)
      } else {
        toast({
          title: "Payment Status",
          description: `Current status: ${status.data.payment_status}`,
        })
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to check payment status",
        variant: "destructive"
      })
    } finally {
      setCheckingStatus(false)
    }
  }

  // Show payment success if order is completed
  if (orderStatus?.success && orderStatus.data.payment_status === 'success') {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-center text-green-600 flex items-center justify-center gap-2">
            <CheckCircle className="size-6" />
            Payment Successful!
          </CardTitle>
          <CardDescription className="text-center">
            Your tickets have been purchased successfully
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="text-center">
            <div className="text-sm text-gray-600 mb-2">Transaction ID</div>
            <div className="font-mono text-sm bg-gray-100 px-3 py-2 rounded">
              {orderResponse.data.transaction_id}
            </div>
          </div>
          
          <Alert>
            <CheckCircle className="size-4" />
            <AlertDescription>
              Your e-tickets will be sent to your email shortly. You can also view your tickets in the "My Tickets" section.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  // Show payment details based on payment type
  return (
    <div className={className}>
      <div className="space-y-6">
        {/* Order Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="size-5" />
              Payment Details
            </CardTitle>
            <CardDescription>
              Complete your payment using the details below
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Order Information */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-gray-600">Order ID</div>
                <div className="font-mono">{orderResponse.data.order_id}</div>
              </div>
              <div>
                <div className="text-gray-600">Amount</div>
                <div className="font-semibold">{formatPrice(orderResponse.data.gross_amount)}</div>
              </div>
              <div>
                <div className="text-gray-600">Status</div>
                <Badge variant={orderResponse.data.transaction_status === 'pending' ? 'secondary' : 'default'}>
                  {orderResponse.data.transaction_status}
                </Badge>
              </div>
              <div>
                <div className="text-gray-600">Expires</div>
                <div className="text-sm">{new Date(orderResponse.data.expiry_time).toLocaleString('id-ID')}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Virtual Account Payment (Bank Transfer) */}
        {orderResponse.data.payment_type === 'bank_transfer' && orderResponse.data.va_numbers && (
          <Card>
            <CardHeader>
              <CardTitle className="text-center text-blue-600">
                Virtual Account Payment
              </CardTitle>
              <CardDescription className="text-center">
                Transfer to the virtual account number below
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="text-center space-y-2">
                  <div className="font-semibold text-blue-800">
                    {orderResponse.data.va_numbers[0]?.bank?.toUpperCase()} Virtual Account
                  </div>
                  <div className="text-2xl font-mono bg-white px-4 py-2 rounded border">
                    {orderResponse.data.va_numbers[0]?.va_number}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(orderResponse.data.va_numbers?.[0]?.va_number || '')}
                  >
                    <Copy className="size-4 mr-2" />
                    Copy Account Number
                  </Button>
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-sm text-gray-600 mb-2">Amount to Transfer</div>
                <div className="text-xl font-semibold">
                  {formatPrice(orderResponse.data.gross_amount)}
                </div>
              </div>
              
              <Alert>
                <AlertDescription>
                  <strong>Payment Instructions:</strong>
                  <ol className="list-decimal ml-4 mt-2 space-y-1">
                    <li>Open your mobile banking or visit ATM</li>
                    <li>Select "Transfer" → "Virtual Account"</li>
                    <li>Enter the virtual account number above</li>
                    <li>Enter the exact amount: {formatPrice(orderResponse.data.gross_amount)}</li>
                    <li>Complete the transfer</li>
                    <li>Your payment will be confirmed automatically</li>
                  </ol>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        )}

        {/* Payment Status Check */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="size-5" />
              Payment Status
            </CardTitle>
            <CardDescription>
              {orderStatus ? 
                `Current status: ${orderStatus.data.payment_status}` : 
                'Checking payment status...'}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <Button 
              onClick={manualStatusCheck}
              disabled={checkingStatus}
              className="w-full"
              variant="outline"
            >
              {checkingStatus ? (
                <div className="flex items-center gap-2">
                  <div className="size-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                  Checking Status...
                </div>
              ) : (
                <>
                  <RefreshCw className="size-4 mr-2" />
                  Check Payment Status
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Auto-refresh notice */}
        <Alert>
          <Clock className="size-4" />
          <AlertDescription>
            Payment status is automatically checked every 10 seconds. Once payment is confirmed, you will be redirected to your tickets.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  )
}