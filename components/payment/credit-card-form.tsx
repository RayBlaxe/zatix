"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CreditCard, Lock } from "lucide-react"
import { formatCreditCardNumber, formatExpiryDate, validateCreditCard } from "@/lib/midtrans"
import { CreditCardData } from "@/types/payment"

// Validation schema for credit card form
const creditCardSchema = z.object({
  card_number: z.string()
    .min(13, "Card number must be at least 13 digits")
    .max(19, "Card number cannot exceed 19 digits")
    .refine((val) => validateCreditCard(val.replace(/\\s/g, '')), "Invalid card number"),
  card_exp_month: z.string()
    .min(2, "Month is required")
    .max(2, "Invalid month")
    .refine((val) => {
      const month = parseInt(val)
      return month >= 1 && month <= 12
    }, "Invalid month (01-12)"),
  card_exp_year: z.string()
    .min(2, "Year is required")
    .max(2, "Invalid year")
    .refine((val) => {
      const currentYear = new Date().getFullYear() % 100
      const year = parseInt(val)
      return year >= currentYear && year <= currentYear + 20
    }, "Invalid year"),
  card_cvv: z.string()
    .min(3, "CVV must be 3-4 digits")
    .max(4, "CVV must be 3-4 digits")
    .regex(/^\\d+$/, "CVV must contain only numbers")
})

type CreditCardFormData = z.infer<typeof creditCardSchema>

interface CreditCardFormProps {
  onSubmit: (cardData: CreditCardData) => void
  loading?: boolean
  error?: string | null
  className?: string
}

export function CreditCardForm({ 
  onSubmit, 
  loading = false, 
  error, 
  className 
}: CreditCardFormProps) {
  const [cardType, setCardType] = useState<string>("")
  
  const form = useForm<CreditCardFormData>({
    resolver: zodResolver(creditCardSchema),
    defaultValues: {
      card_number: "",
      card_exp_month: "",
      card_exp_year: "",
      card_cvv: ""
    }
  })

  // Detect card type based on card number
  const detectCardType = (cardNumber: string): string => {
    const cleanNumber = cardNumber.replace(/\\s/g, '')
    
    if (/^4/.test(cleanNumber)) return "Visa"
    if (/^5[1-5]/.test(cleanNumber)) return "Mastercard"
    if (/^3[47]/.test(cleanNumber)) return "American Express"
    if (/^35/.test(cleanNumber)) return "JCB"
    
    return ""
  }

  const handleCardNumberChange = (value: string) => {
    const formatted = formatCreditCardNumber(value)
    form.setValue("card_number", formatted)
    setCardType(detectCardType(formatted))
  }

  const handleExpiryChange = (value: string) => {
    const formatted = formatExpiryDate(value)
    form.setValue("card_exp_month", formatted.split('/')[0] || "")
    form.setValue("card_exp_year", formatted.split('/')[1] || "")
  }

  const handleSubmit = (data: CreditCardFormData) => {
    const cardData: CreditCardData = {
      card_number: data.card_number.replace(/\\s/g, ''),
      card_exp_month: data.card_exp_month,
      card_exp_year: data.card_exp_year,
      card_cvv: data.card_cvv
    }
    
    onSubmit(cardData)
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="size-5" />
          Credit/Debit Card Information
        </CardTitle>
        <CardDescription>
          Enter your card details to complete the payment
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {/* Card Number */}
            <FormField
              control={form.control}
              name="card_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Card Number</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        {...field}
                        placeholder="1234 5678 9012 3456"
                        maxLength={19}
                        onChange={(e) => {
                          handleCardNumberChange(e.target.value)
                        }}
                        className="pr-20"
                      />
                      {cardType && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <span className="text-sm font-medium text-gray-600">
                            {cardType}
                          </span>
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              {/* Expiry Date */}
              <FormField
                control={form.control}
                name="card_exp_month"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expiry Date</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="MM/YY"
                        maxLength={5}
                        onChange={(e) => {
                          handleExpiryChange(e.target.value)
                        }}
                        value={`${form.getValues("card_exp_month")}${form.getValues("card_exp_year") ? '/' + form.getValues("card_exp_year") : ''}`}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* CVV */}
              <FormField
                control={form.control}
                name="card_cvv"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CVV</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="password"
                        placeholder="123"
                        maxLength={4}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\\D/g, '')
                          field.onChange(value)
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Security Notice */}
            <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
              <Lock className="size-4" />
              <span>Your card information is encrypted and secure</span>
            </div>

            {/* Submit Button */}
            <Button 
              type="submit" 
              className="w-full h-12" 
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Processing Payment...
                </div>
              ) : (
                "Complete Payment"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}