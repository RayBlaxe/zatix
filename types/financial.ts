// Financial system types for the three-tier reporting system

export interface FinancialSummary {
  total_income: number
  total_expenses: number
  net_profit: number
  tickets_sold: number
  ticket_sales: number
  other_income: number
}

export interface EventFinancialReport {
  event: {
    id: number
    name: string
  }
  summary: FinancialSummary
}

export interface EOFinancialReport {
  event_organizer: {
    id: number
    name: string
  }
  summary: FinancialSummary
  event_breakdowns: Array<{
    id: number
    name: string
    total_income: number
    total_expenses: number
    net_profit: number
    tickets_sold: number
  }>
}

export interface GlobalFinancialReport {
  summary: FinancialSummary
  eo_breakdowns: Array<{
    id: number
    name: string
    total_events: number
    subtotal_net_profit: number
    subtotal_tickets_sold: number
    subtotal_income: number
  }>
}

export interface Transaction {
  id: number
  order_id: string
  user_id: number
  version_of_payment: number
  grand_discount: number
  grand_amount: number
  type: "transfer" | "credit_card" | "ewallet"
  status: "pending" | "success" | "failed" | "cancelled"
  created_at: string
  updated_at: string
  user?: {
    id: number
    name: string
    email: string
  }
  event?: {
    id: number
    name: string
  }
  ticket_details?: Array<{
    id: number
    ticket_name: string
    quantity: number
    price: number
    subtotal: number
  }>
}

export interface PaymentDetails {
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
  expiry_time?: string
}

export interface FinancialMetrics {
  totalRevenue: number
  totalTransactions: number
  successfulTransactions: number
  pendingTransactions: number
  failedTransactions: number
  averageTransactionValue: number
  topEvents: Array<{
    eventId: number
    eventName: string
    revenue: number
    ticketsSold: number
  }>
  revenueGrowth: number
  transactionGrowth: number
}

// Request types for filtering and pagination
export interface FinancialReportParams {
  start_date?: string
  end_date?: string
  event_id?: number
  eo_id?: number
  transaction_status?: string
  payment_type?: string
  page?: number
  per_page?: number
}

// Response types for API calls
export interface FinancialReportResponse<T> {
  success: boolean
  message: string
  data: T
}

export interface TransactionListResponse {
  success: boolean
  message: string
  data: {
    current_page: number
    data: Transaction[]
    first_page_url: string
    from: number
    last_page: number
    last_page_url: string
    next_page_url: string | null
    path: string
    per_page: number
    prev_page_url: string | null
    to: number
    total: number
  }
}
