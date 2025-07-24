// Midtrans Core API types and interfaces

export interface PaymentMethod {
  id: string
  name: string
  type: 'credit_card' | 'bank_transfer' | 'echannel' | 'gopay' | 'shopeepay' | 'qris'
  icon?: string
  description?: string
}

export interface CreditCardData {
  card_number: string
  card_exp_month: string
  card_exp_year: string
  card_cvv: string
}

export interface CustomerDetails {
  first_name: string
  last_name: string
  email: string
  phone: string
}

export interface ItemDetail {
  id: string
  price: number
  quantity: number
  name: string
}

export interface TransactionDetails {
  order_id: string
  gross_amount: number
}

// Core API Charge Request
export interface CoreAPIChargeRequest {
  payment_type: string
  transaction_details: TransactionDetails
  customer_details: CustomerDetails
  item_details: ItemDetail[]
  credit_card?: CreditCardData
  bank_transfer?: {
    bank: string
  }
  echannel?: {
    bill_info1: string
    bill_info2: string
  }
  gopay?: {
    enable_callback: boolean
    callback_url: string
  }
  shopeepay?: {
    callback_url: string
  }
}

// Core API Response
export interface CoreAPIResponse {
  status_code: string
  status_message: string
  transaction_id: string
  order_id: string
  merchant_id: string
  gross_amount: string
  currency: string
  payment_type: string
  transaction_time: string
  transaction_status: string
  va_numbers?: Array<{
    bank: string
    va_number: string
  }>
  bca_va_number?: string
  bill_key?: string
  biller_code?: string
  actions?: Array<{
    name: string
    method: string
    url: string
  }>
  qr_string?: string
  deeplink_redirect_url?: string
}

// Payment Status Response
export interface PaymentStatusResponse {
  status_code: string
  status_message: string
  transaction_id: string
  order_id: string
  payment_type: string
  transaction_time: string
  transaction_status: string
  settlement_time?: string
  gross_amount: string
  currency: string
}

// Form validation schemas
export interface PaymentFormData {
  payment_method: string
  customer_details: CustomerDetails
  credit_card?: CreditCardData
  bank_transfer?: {
    bank: string
  }
}

// UI State types
export interface PaymentState {
  loading: boolean
  processing: boolean
  error: string | null
  success: boolean
  transaction_result: CoreAPIResponse | null
}

// Available payment methods
export const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: 'credit_card',
    name: 'Credit/Debit Card',
    type: 'credit_card',
    description: 'Visa, Mastercard, JCB, Amex'
  },
  {
    id: 'bca_va',
    name: 'BCA Virtual Account',
    type: 'bank_transfer',
    description: 'Transfer via BCA Virtual Account'
  },
  {
    id: 'bni_va',
    name: 'BNI Virtual Account',
    type: 'bank_transfer',
    description: 'Transfer via BNI Virtual Account'
  },
  {
    id: 'bri_va',
    name: 'BRI Virtual Account',
    type: 'bank_transfer',
    description: 'Transfer via BRI Virtual Account'
  },
  {
    id: 'permata_va',
    name: 'Permata Virtual Account',
    type: 'bank_transfer',
    description: 'Transfer via Permata Virtual Account'
  },
  {
    id: 'echannel',
    name: 'Mandiri Bill Payment',
    type: 'echannel',
    description: 'Pay via Mandiri e-channel'
  },
  {
    id: 'gopay',
    name: 'GoPay',
    type: 'gopay',
    description: 'Pay with GoPay e-wallet'
  },
  {
    id: 'shopeepay',
    name: 'ShopeePay',
    type: 'shopeepay',
    description: 'Pay with ShopeePay e-wallet'
  },
  {
    id: 'qris',
    name: 'QRIS',
    type: 'qris',
    description: 'Scan QR code to pay'
  }
]

// Bank options for Virtual Account
export const BANK_OPTIONS = [
  { value: 'bca', label: 'BCA' },
  { value: 'bni', label: 'BNI' },
  { value: 'bri', label: 'BRI' },
  { value: 'permata', label: 'Permata' }
]