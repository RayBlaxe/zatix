// Backend API types and interfaces

// Payment Method from backend API
export interface PaymentMethod {
  name: string
  code: string
  type: 'bank_transfer' | 'echannel' | 'gopay' | 'qris'
  image: string
}

export interface PaymentMethodGroup {
  name: string
  payment_methods: PaymentMethod[]
}

export interface PaymentMethodsResponse {
  data: PaymentMethodGroup[]
}

// Order Creation
export interface OrderCreateRequest {
  items: Array<{
    ticket_id: number
    quantity: number
  }>
  payment_method_id: number
}

export interface OrderCreateResponse {
  success: boolean
  message: string
  data: {
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
    fraud_status: string
    va_numbers?: Array<{
      bank: string
      va_number: string
    }>
    expiry_time: string
  }
}

// Order Status - Updated to match backend API response format
export interface OrderStatusResponse {
  success: boolean
  message: string
  data: {
    id: string
    user_id: number
    event_id: number
    gross_amount: number
    discount_amount: number
    tax_amount: number
    net_amount: number
    status: 'unpaid' | 'paid' | 'cancelled' | 'expired'
    created_at: string
    updated_at: string
    order_items: Array<{
      id: number
      order_id: string
      ticket_id: number
      quantity: number
      price: number
      discount: number
      subtotal: number
      created_at: string
      updated_at: string
      ticket: {
        id: number
        event_id: number
        ticket_type_id: number
        name: string
        price: string
        stock: number
        limit: number
        start_date: string
        end_date: string
        created_at: string
        updated_at: string
      }
    }>
    event: {
      id: number
      eo_id: number
      name: string
      poster: string | null
      description: string
      start_date: string
      start_time: string
      end_date: string
      end_time: string
      location: string
      status: 'active' | 'inactive' | 'cancelled' | 'archived'
      is_published: boolean
      is_public: boolean
      contact_phone: string
      tnc_id: number
      created_at: string
      updated_at: string
    }
    transactions: Array<{
      id: number
      order_id: string
      user_id: number
      version_of_payment: number
      grand_discount: number
      grand_amount: number
      type: 'transfer' | 'gopay' | 'qris' | 'echannel'
      status: 'pending' | 'success' | 'settlement' | 'failed' | 'cancelled'
      created_at: string
      updated_at: string
      payment_detail: {
        id: number
        transaction_id: number
        payment_method_id: number
        va_number?: string
        bill_key?: string | null
        biller_code?: string | null
        qris_url?: string | null
        expiry_at: string
        created_at: string
        updated_at: string
      }
    }>
  }
}

// Form validation schemas
export interface PaymentFormData {
  payment_method: PaymentMethod
}

// UI State types for payment processing
export interface PaymentUIState {
  loading: boolean
  processing: boolean
  error: string | null
  success: boolean
  selectedPaymentMethod: PaymentMethod | null
  orderData: OrderCreateResponse | null
}

// Payment Method Selection Data
export interface PaymentMethodSelectionData {
  paymentMethod: PaymentMethod
  ticketItems: Array<{
    ticket_id: number
    quantity: number
  }>
}

// Legacy exports for backward compatibility
export interface CreditCardData {
  cardNumber: string
  expiryMonth: string
  expiryYear: string
  cvv: string
  cardholderName: string
}

export interface CoreAPIChargeRequest {
  payment_type: string
  transaction_details: {
    order_id: string
    gross_amount: number
  }
  customer_details?: {
    first_name: string
    email: string
    phone: string
  }
}

export interface CoreAPIResponse {
  status_code: string
  status_message: string
  transaction_id: string
  order_id: string
  gross_amount: string
  payment_type: string
  transaction_time: string
  transaction_status: string
}

export interface PaymentStatusResponse {
  status_code: string
  status_message: string
  transaction_id: string
  order_id: string
  payment_type: string
  transaction_status: string
  gross_amount: string
}

export const BANK_OPTIONS = [
  { code: 'bca', name: 'BCA' },
  { code: 'bni', name: 'BNI' },
  { code: 'bri', name: 'BRI' },
  { code: 'mandiri', name: 'Mandiri' }
]

export const PAYMENT_METHODS = [
  {
    id: 'bank_transfer',
    name: 'Bank Transfer',
    type: 'bank_transfer' as const,
    image: '/bank-transfer.png'
  },
  {
    id: 'credit_card',
    name: 'Credit Card',
    type: 'credit_card' as const,
    image: '/credit-card.png'
  }
]