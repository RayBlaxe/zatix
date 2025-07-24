"use client"

import { useState } from "react"
import { PaymentMethodSelector } from "./payment-method-selector"
import { CreditCardForm } from "./credit-card-form"
import { BankTransferForm } from "./bank-transfer-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  CreditCardData, 
  CustomerDetails, 
  ItemDetail,
  CoreAPIChargeRequest 
} from "@/types/payment"
import { 
  createCreditCardCharge,
  createBankTransferCharge,
  createEchannelCharge,
  createGopayCharge,
  createShopeepayCharge,
  chargeTransaction
} from "@/lib/midtrans"
import { QrCode, Smartphone, Copy } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

interface PaymentFormProps {
  orderId: string
  totalAmount: number
  customerDetails: CustomerDetails
  itemDetails: ItemDetail[]
  onPaymentSuccess: (result: any) => void
  onPaymentError: (error: string) => void
  className?: string
}

export function PaymentForm({
  orderId,
  totalAmount,
  customerDetails,
  itemDetails,
  onPaymentSuccess,
  onPaymentError,
  className
}: PaymentFormProps) {
  const [selectedMethod, setSelectedMethod] = useState<string>("credit_card")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [vaResult, setVaResult] = useState<any>(null)
  const [qrResult, setQrResult] = useState<any>(null)

  const handleCreditCardSubmit = async (cardData: CreditCardData) => {
    setLoading(true)
    setError(null)
    
    try {
      const chargeRequest = createCreditCardCharge(
        orderId,
        totalAmount,
        customerDetails,
        itemDetails,
        cardData
      )
      
      const result = await chargeTransaction(chargeRequest)
      
      if (result.status_code === '200') {
        onPaymentSuccess(result)
      } else {
        throw new Error(result.status_message || 'Payment failed')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Payment processing failed'
      setError(errorMessage)
      onPaymentError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleBankTransferSubmit = async (bank: string) => {
    setLoading(true)
    setError(null)
    
    try {
      const chargeRequest = createBankTransferCharge(
        orderId,
        totalAmount,
        customerDetails,
        itemDetails,
        bank
      )
      
      const result = await chargeTransaction(chargeRequest)
      
      if (result.status_code === '201') {
        setVaResult(result)
      } else {
        throw new Error(result.status_message || 'Failed to create virtual account')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Virtual account creation failed'
      setError(errorMessage)
      onPaymentError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleEwalletSubmit = async (method: string) => {
    setLoading(true)
    setError(null)
    
    try {
      let chargeRequest: CoreAPIChargeRequest
      
      if (method === 'gopay') {
        chargeRequest = createGopayCharge(orderId, totalAmount, customerDetails, itemDetails)
      } else if (method === 'shopeepay') {
        chargeRequest = createShopeepayCharge(orderId, totalAmount, customerDetails, itemDetails)
      } else {
        throw new Error('Unsupported e-wallet method')
      }
      
      const result = await chargeTransaction(chargeRequest)
      
      if (result.status_code === '201') {
        setQrResult(result)
      } else {
        throw new Error(result.status_message || 'E-wallet payment failed')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'E-wallet payment failed'
      setError(errorMessage)
      onPaymentError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied!",
      description: "Information copied to clipboard"
    })
  }

  // Show VA result if bank transfer is successful
  if (vaResult) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-center text-green-600">
            Virtual Account Created Successfully!
          </CardTitle>
          <CardDescription className="text-center">
            Please complete your payment using the details below
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="text-center space-y-2">
              <div className="font-semibold text-green-800">
                {vaResult.va_numbers?.[0]?.bank?.toUpperCase() || 'BANK'} Virtual Account
              </div>
              <div className="text-2xl font-mono bg-white px-4 py-2 rounded border">
                {vaResult.va_numbers?.[0]?.va_number || vaResult.bca_va_number}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(vaResult.va_numbers?.[0]?.va_number || vaResult.bca_va_number)}
              >
                <Copy className="size-4 mr-2" />
                Copy Account Number
              </Button>
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-sm text-gray-600 mb-2">Amount to Transfer</div>
            <div className="text-xl font-semibold">
              Rp {totalAmount.toLocaleString('id-ID')}
            </div>
          </div>
          
          <Alert>
            <AlertDescription>
              <strong>Payment Instructions:</strong>
              <ol className="list-decimal ml-4 mt-2 space-y-1">
                <li>Open your mobile banking or visit ATM</li>
                <li>Select "Transfer" → "Virtual Account"</li>
                <li>Enter the virtual account number above</li>
                <li>Enter the exact amount: Rp {totalAmount.toLocaleString('id-ID')}</li>
                <li>Complete the transfer</li>
                <li>Your payment will be confirmed automatically</li>
              </ol>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  // Show QR result for e-wallets
  if (qrResult) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-center">
            Scan QR Code to Pay
          </CardTitle>
          <CardDescription className="text-center">
            Open your {selectedMethod === 'gopay' ? 'GoPay' : 'ShopeePay'} app and scan the QR code below
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="text-center">
            <div className="inline-block p-4 bg-white border rounded-lg">
              {qrResult.qr_string ? (
                <img 
                  src={`data:image/svg+xml;base64,${btoa(qrResult.qr_string)}`}
                  alt="QR Code"
                  className="size-48 mx-auto"
                />
              ) : (
                <div className="size-48 flex items-center justify-center bg-gray-100 rounded">
                  <QrCode className="size-16 text-gray-400" />
                </div>
              )}
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-sm text-gray-600 mb-2">Amount</div>
            <div className="text-xl font-semibold">
              Rp {totalAmount.toLocaleString('id-ID')}
            </div>
          </div>
          
          {qrResult.deeplink_redirect_url && (
            <Button 
              className="w-full"
              onClick={() => window.open(qrResult.deeplink_redirect_url, '_blank')}
            >
              <Smartphone className="size-4 mr-2" />
              Open in {selectedMethod === 'gopay' ? 'GoPay' : 'ShopeePay'} App
            </Button>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={className}>
      <div className="space-y-6">
        {/* Payment Method Selector */}
        <PaymentMethodSelector
          selectedMethod={selectedMethod}
          onMethodChange={setSelectedMethod}
        />

        {/* Payment Form based on selected method */}
        {selectedMethod === 'credit_card' && (
          <CreditCardForm
            onSubmit={handleCreditCardSubmit}
            loading={loading}
            error={error}
          />
        )}

        {(selectedMethod.includes('_va') || selectedMethod === 'bca_va' || selectedMethod === 'bni_va' || selectedMethod === 'bri_va' || selectedMethod === 'permata_va') && (
          <BankTransferForm
            onSubmit={handleBankTransferSubmit}
            loading={loading}
            error={error}
          />
        )}

        {(selectedMethod === 'gopay' || selectedMethod === 'shopeepay') && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="size-5" />
                {selectedMethod === 'gopay' ? 'GoPay' : 'ShopeePay'} Payment
              </CardTitle>
              <CardDescription>
                Pay instantly with your {selectedMethod === 'gopay' ? 'GoPay' : 'ShopeePay'} e-wallet
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => handleEwalletSubmit(selectedMethod)}
                className="w-full h-12"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Generating QR Code...
                  </div>
                ) : (
                  `Pay with ${selectedMethod === 'gopay' ? 'GoPay' : 'ShopeePay'}`
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {selectedMethod === 'qris' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="size-5" />
                QRIS Payment
              </CardTitle>
              <CardDescription>
                Scan QR code with any QRIS-supported app
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => handleEwalletSubmit('qris')}
                className="w-full h-12"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Generating QR Code...
                  </div>
                ) : (
                  "Generate QRIS Code"
                )}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}