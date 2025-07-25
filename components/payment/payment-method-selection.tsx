"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { 
  PaymentMethodsResponse, 
  PaymentMethod, 
  PaymentMethodSelectionData 
} from "@/types/payment"
import { CreditCard, Building2, Smartphone, QrCode } from "lucide-react"

interface PaymentMethodSelectionProps {
  paymentMethods: PaymentMethodsResponse
  ticketItems: Array<{
    ticket_id: number
    quantity: number
  }>
  totalAmount: number
  onMethodSelected: (data: PaymentMethodSelectionData) => void
  onCancel: () => void
  loading?: boolean
}

export function PaymentMethodSelection({
  paymentMethods,
  ticketItems,
  totalAmount,
  onMethodSelected,
  onCancel,
  loading = false
}: PaymentMethodSelectionProps) {
  const [selectedMethodCode, setSelectedMethodCode] = useState<string>("")

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(amount)
  }

  const getPaymentIcon = (type: string) => {
    switch (type) {
      case 'bank_transfer':
        return <Building2 className="size-5" />
      case 'echannel':
        return <CreditCard className="size-5" />
      case 'gopay':
        return <Smartphone className="size-5" />
      case 'qris':
        return <QrCode className="size-5" />
      default:
        return <CreditCard className="size-5" />
    }
  }

  const getSelectedPaymentMethod = (): PaymentMethod | null => {
    for (const group of paymentMethods.data) {
      const method = group.payment_methods.find(pm => pm.code === selectedMethodCode)
      if (method) return method
    }
    return null
  }

  const handleProceed = () => {
    const paymentMethod = getSelectedPaymentMethod()
    if (!paymentMethod) return

    onMethodSelected({
      paymentMethod,
      ticketItems
    })
  }

  return (
    <div className="space-y-6">
      {/* Order Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Order Summary</CardTitle>
          <CardDescription>
            {ticketItems.reduce((total, item) => total + item.quantity, 0)} ticket(s) selected
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center text-lg font-semibold">
            <span>Total Amount</span>
            <span className="text-primary">{formatPrice(totalAmount)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Payment Method Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Payment Method</CardTitle>
          <CardDescription>
            Choose your preferred payment method to continue
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup 
            value={selectedMethodCode} 
            onValueChange={setSelectedMethodCode}
            className="space-y-4"
          >
            {paymentMethods.data.map((group) => (
              <div key={group.name} className="space-y-3">
                <h4 className="font-medium text-sm text-gray-600 uppercase tracking-wide">
                  {group.name}
                </h4>
                {group.payment_methods.map((method) => (
                  <div key={method.code} className="relative">
                    <RadioGroupItem
                      value={method.code}
                      id={method.code}
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor={method.code}
                      className="flex items-center gap-4 p-4 border rounded-lg cursor-pointer hover:bg-gray-50 peer-checked:bg-blue-50 peer-checked:border-blue-500 peer-checked:ring-1 peer-checked:ring-blue-500"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        {getPaymentIcon(method.type)}
                        <div className="flex items-center gap-3">
                          <img 
                            src={method.image} 
                            alt={method.name}
                            className="size-8 object-contain"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none'
                            }}
                          />
                          <div>
                            <div className="font-medium">{method.name}</div>
                            <div className="text-sm text-gray-500 capitalize">
                              {method.type.replace('_', ' ')}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {method.type === 'gopay' && (
                        <Badge variant="secondary" className="text-xs">
                          Instant
                        </Badge>
                      )}
                      
                      {method.type === 'qris' && (
                        <Badge variant="outline" className="text-xs">
                          QR Code
                        </Badge>
                      )}
                    </Label>
                  </div>
                ))}
              </div>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button 
          variant="outline" 
          onClick={onCancel}
          className="flex-1"
          disabled={loading}
        >
          Back
        </Button>
        <Button 
          onClick={handleProceed}
          disabled={!selectedMethodCode || loading}
          className="flex-1"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Processing...
            </div>
          ) : (
            "Continue to Payment"
          )}
        </Button>
      </div>
    </div>
  )
}