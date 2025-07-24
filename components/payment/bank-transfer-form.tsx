"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group" 
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Building, Clock, Copy } from "lucide-react"
import { BANK_OPTIONS } from "@/types/payment"
import { toast } from "@/components/ui/use-toast"

interface BankTransferFormProps {
  onSubmit: (bank: string) => void
  loading?: boolean
  error?: string | null
  className?: string
}

export function BankTransferForm({ 
  onSubmit, 
  loading = false, 
  error, 
  className 
}: BankTransferFormProps) {
  const [selectedBank, setSelectedBank] = useState<string>("")

  const handleSubmit = () => {
    if (!selectedBank) {
      toast({
        title: "Bank Selection Required",
        description: "Please select a bank for virtual account transfer",
        variant: "destructive"
      })
      return
    }
    
    onSubmit(selectedBank)
  }

  const getBankLogo = (bankCode: string): string => {
    // In a real app, you'd have actual bank logos
    const logos: Record<string, string> = {
      bca: "🏦",
      bni: "🏛️", 
      bri: "🏪",
      permata: "🏢"
    }
    return logos[bankCode] || "🏦"
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building className="size-5" />
          Bank Transfer - Virtual Account
        </CardTitle>
        <CardDescription>
          Choose your preferred bank for virtual account transfer
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <RadioGroup 
            value={selectedBank} 
            onValueChange={setSelectedBank}
            className="space-y-3"
          >
            {BANK_OPTIONS.map((bank) => (
              <div key={bank.value} className="flex items-center space-x-3">
                <RadioGroupItem 
                  value={bank.value} 
                  id={bank.value}
                  className="mt-1"
                />
                <Label 
                  htmlFor={bank.value}
                  className="flex-1 cursor-pointer p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{getBankLogo(bank.value)}</span>
                    <div>
                      <div className="font-medium">{bank.label}</div>
                      <div className="text-sm text-gray-600">
                        Virtual Account - Free transfer from {bank.label}
                      </div>
                    </div>
                  </div>
                </Label>
              </div>
            ))}
          </RadioGroup>

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <Clock className="size-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <div className="font-medium mb-1">How Virtual Account Works:</div>
                <ol className="list-decimal ml-4 space-y-1">
                  <li>Select your preferred bank</li>
                  <li>You'll receive a virtual account number</li>
                  <li>Transfer the exact amount to the virtual account</li>
                  <li>Payment is confirmed automatically (usually within 1-5 minutes)</li>
                  <li>Your tickets will be sent via email</li>
                </ol>
              </div>
            </div>
          </div>

          {/* Transfer Notice */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="text-sm text-yellow-800">
              <div className="font-medium mb-1">⚠️ Important Notes:</div>
              <ul className="list-disc ml-4 space-y-1">
                <li>Virtual account is valid for 24 hours</li>
                <li>Transfer the exact amount (including unique code if any)</li>
                <li>Payment confirmation is automatic</li>
                <li>Keep your transfer receipt for reference</li>
              </ul>
            </div>
          </div>

          {/* Submit Button */}
          <Button 
            onClick={handleSubmit}
            className="w-full h-12" 
            disabled={loading || !selectedBank}
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Creating Virtual Account...
              </div>
            ) : (
              "Generate Virtual Account"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}