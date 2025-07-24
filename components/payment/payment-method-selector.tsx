"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { 
  CreditCard, 
  Building, 
  Smartphone, 
  QrCode,
  Banknote
} from "lucide-react"
import { PaymentMethod, PAYMENT_METHODS } from "@/types/payment"

interface PaymentMethodSelectorProps {
  selectedMethod: string
  onMethodChange: (method: string) => void
  className?: string
}

const PaymentMethodIcon = ({ type }: { type: PaymentMethod['type'] }) => {
  switch (type) {
    case 'credit_card':
      return <CreditCard className="size-5" />
    case 'bank_transfer':
      return <Building className="size-5" />
    case 'echannel':
      return <Banknote className="size-5" />
    case 'gopay':
    case 'shopeepay':
      return <Smartphone className="size-5" />
    case 'qris':
      return <QrCode className="size-5" />
    default:
      return <CreditCard className="size-5" />
  }
}

export function PaymentMethodSelector({ 
  selectedMethod, 
  onMethodChange, 
  className 
}: PaymentMethodSelectorProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="size-5" />
          Payment Method
        </CardTitle>
        <CardDescription>
          Choose your preferred payment method
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <RadioGroup 
          value={selectedMethod} 
          onValueChange={onMethodChange}
          className="space-y-3"
        >
          {PAYMENT_METHODS.map((method) => (
            <div key={method.id} className="flex items-center space-x-3">
              <RadioGroupItem 
                value={method.id} 
                id={method.id}
                className="mt-1"
              />
              <Label 
                htmlFor={method.id} 
                className="flex-1 cursor-pointer p-3 rounded-lg border border-transparent hover:border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <PaymentMethodIcon type={method.type} />
                    <div>
                      <div className="font-medium">{method.name}</div>
                      <div className="text-sm text-gray-600">{method.description}</div>
                    </div>
                  </div>
                  
                  {/* Show popular badge for credit card */}
                  {method.id === 'credit_card' && (
                    <Badge variant="secondary" className="text-xs">
                      Most Popular
                    </Badge>
                  )}
                  
                  {/* Show instant badge for e-wallets */}
                  {(method.type === 'gopay' || method.type === 'shopeepay') && (
                    <Badge variant="outline" className="text-xs">
                      Instant
                    </Badge>
                  )}
                </div>
              </Label>
            </div>
          ))}
        </RadioGroup>
        
        {/* Payment security notice */}
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="text-sm text-blue-800">
            <div className="flex items-center gap-2 font-medium mb-1">
              🔒 Secure Payment
            </div>
            <p>
              All payments are processed securely through Midtrans. 
              Your payment information is encrypted and protected.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}