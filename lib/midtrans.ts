// Midtrans Core API integration utilities for custom payment forms
import { CoreAPIChargeRequest, CoreAPIResponse, PaymentStatusResponse } from '@/types/payment'

// Environment variables for Midtrans configuration
const MIDTRANS_MERCHANT_ID = process.env.MIDTRANS_MERCHANT_ID || ''
const MIDTRANS_SERVER_KEY = process.env.MIDTRANS_SERVER_KEY || ''
const MIDTRANS_CLIENT_KEY = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || ''
const MIDTRANS_IS_PRODUCTION = process.env.MIDTRANS_IS_PRODUCTION === 'true'
const MIDTRANS_IS_SANITIZED = process.env.MIDTRANS_IS_SANITIZED === 'true'
const MIDTRANS_IS_3DS = process.env.MIDTRANS_IS_3DS === 'true'

// Use MIDTRANS_IS_PRODUCTION flag to determine API base URL
const MIDTRANS_BASE_URL = MIDTRANS_IS_PRODUCTION
  ? 'https://api.midtrans.com/v2' 
  : 'https://api.sandbox.midtrans.com/v2'

// Export configuration for use in client-side components
export const getMidtransConfig = () => ({
  merchantId: MIDTRANS_MERCHANT_ID,
  clientKey: MIDTRANS_CLIENT_KEY,
  isProduction: MIDTRANS_IS_PRODUCTION,
  isSanitized: MIDTRANS_IS_SANITIZED,
  is3DS: MIDTRANS_IS_3DS
})

// Create authorization header for server-side calls
const getAuthHeader = () => {
  const encodedKey = btoa(MIDTRANS_SERVER_KEY + ':')
  return `Basic ${encodedKey}`
}

// Core API charge request
export const chargeTransaction = async (chargeData: CoreAPIChargeRequest): Promise<CoreAPIResponse> => {
  try {
    const response = await fetch(`${MIDTRANS_BASE_URL}/charge`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': getAuthHeader(),
        'Accept': 'application/json'
      },
      body: JSON.stringify(chargeData)
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result: CoreAPIResponse = await response.json()
    return result
  } catch (error) {
    console.error('Error charging transaction:', error)
    throw error
  }
}

// Check payment status
export const checkPaymentStatus = async (orderId: string): Promise<PaymentStatusResponse> => {
  try {
    const response = await fetch(`${MIDTRANS_BASE_URL}/${orderId}/status`, {
      method: 'GET',
      headers: {
        'Authorization': getAuthHeader(),
        'Accept': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result: PaymentStatusResponse = await response.json()
    return result
  } catch (error) {
    console.error('Error checking payment status:', error)
    throw error
  }
}

// Create charge request for credit card
export const createCreditCardCharge = (
  orderId: string,
  grossAmount: number,
  customerDetails: any,
  itemDetails: any[],
  cardData: {
    card_number: string
    card_exp_month: string
    card_exp_year: string
    card_cvv: string
  }
): CoreAPIChargeRequest => {
  return {
    payment_type: 'credit_card',
    transaction_details: {
      order_id: orderId,
      gross_amount: grossAmount
    },
    customer_details: customerDetails,
    item_details: itemDetails,
    credit_card: cardData
  }
}

// Create charge request for bank transfer
export const createBankTransferCharge = (
  orderId: string,
  grossAmount: number,
  customerDetails: any,
  itemDetails: any[],
  bank: string
): CoreAPIChargeRequest => {
  return {
    payment_type: 'bank_transfer',
    transaction_details: {
      order_id: orderId,
      gross_amount: grossAmount
    },
    customer_details: customerDetails,
    item_details: itemDetails,
    bank_transfer: {
      bank: bank
    }
  }
}

// Create charge request for e-channel (Mandiri)
export const createEchannelCharge = (
  orderId: string,
  grossAmount: number,
  customerDetails: any,
  itemDetails: any[]
): CoreAPIChargeRequest => {
  return {
    payment_type: 'echannel',
    transaction_details: {
      order_id: orderId,
      gross_amount: grossAmount
    },
    customer_details: customerDetails,
    item_details: itemDetails,
    echannel: {
      bill_info1: 'Payment for tickets',
      bill_info2: 'Order: ' + orderId
    }
  }
}

// Create charge request for GoPay
export const createGopayCharge = (
  orderId: string,
  grossAmount: number,
  customerDetails: any,
  itemDetails: any[],
  callbackUrl?: string
): CoreAPIChargeRequest => {
  return {
    payment_type: 'gopay',
    transaction_details: {
      order_id: orderId,
      gross_amount: grossAmount
    },
    customer_details: customerDetails,
    item_details: itemDetails,
    gopay: {
      enable_callback: true,
      callback_url: callbackUrl || `${window.location.origin}/payment/callback`
    }
  }
}

// Create charge request for ShopeePay
export const createShopeepayCharge = (
  orderId: string,
  grossAmount: number,
  customerDetails: any,
  itemDetails: any[],
  callbackUrl?: string
): CoreAPIChargeRequest => {
  return {
    payment_type: 'shopeepay',
    transaction_details: {
      order_id: orderId,
      gross_amount: grossAmount
    },
    customer_details: customerDetails,
    item_details: itemDetails,
    shopeepay: {
      callback_url: callbackUrl || `${window.location.origin}/payment/callback`
    }
  }
}

// Helper function to format amount for Midtrans (in IDR)
export const formatAmountForMidtrans = (amount: number): number => {
  return Math.round(amount) // Midtrans expects amount in IDR
}

// Payment status mapping
export const mapMidtransStatus = (status: string): 'pending' | 'success' | 'failed' => {
  switch (status) {
    case 'capture':
    case 'settlement':
      return 'success'
    case 'pending':
      return 'pending'
    case 'deny':
    case 'cancel':
    case 'expire':
    case 'failure':
      return 'failed'
    default:
      return 'pending'
  }
}

// Validate credit card number (basic Luhn algorithm)
export const validateCreditCard = (cardNumber: string): boolean => {
  const cleanNumber = cardNumber.replace(/\D/g, '')
  
  if (cleanNumber.length < 13 || cleanNumber.length > 19) {
    return false
  }
  
  let sum = 0
  let isEven = false
  
  for (let i = cleanNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(cleanNumber[i])
    
    if (isEven) {
      digit *= 2
      if (digit > 9) {
        digit -= 9
      }
    }
    
    sum += digit
    isEven = !isEven
  }
  
  return sum % 10 === 0
}

// Format credit card number with spaces
export const formatCreditCardNumber = (value: string): string => {
  const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
  const matches = v.match(/\d{4,16}/g)
  const match = matches && matches[0] || ''
  const parts = []
  
  for (let i = 0, len = match.length; i < len; i += 4) {
    parts.push(match.substring(i, i + 4))
  }
  
  if (parts.length) {
    return parts.join(' ')
  } else {
    return v
  }
}

// Format expiry date
export const formatExpiryDate = (value: string): string => {
  const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
  if (v.length >= 2) {
    return v.substring(0, 2) + (v.length > 2 ? '/' + v.substring(2, 4) : '')
  }
  return v
}