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

// Order Status
export interface OrderStatusResponse {
  success: boolean
  message: string
  data: {
    order_id: string
    payment_status: string
    transaction_status: string
    transaction_id: string
    gross_amount: string
    expiry_time: string
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