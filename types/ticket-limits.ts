// Ticket Order Limits System Types
export interface TicketLimitRule {
  id: number
  ticket_id: number
  limit_type: 'per_order' | 'cumulative' | 'daily' | 'total'
  limit_value: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface UserTicketPurchaseHistory {
  user_id: number
  ticket_id: number
  total_purchased: number
  daily_purchased: number
  last_purchase_date: string
  orders: PurchaseHistoryOrder[]
}

export interface PurchaseHistoryOrder {
  order_id: number
  quantity: number
  purchase_date: string
  status: 'success' | 'pending' | 'failed' | 'cancelled'
}

export interface TicketLimitValidation {
  ticket_id: number
  requested_quantity: number
  available_quantity: number
  limit_type: string
  limit_value: number
  user_purchased: number
  is_valid: boolean
  error_message?: string
}

export interface TicketLimitCheckRequest {
  ticket_id: number
  user_id: number
  requested_quantity: number
}

export interface TicketLimitCheckResponse {
  success: boolean
  data?: TicketLimitValidation
  message?: string
}

export interface BulkLimitCheckRequest {
  user_id: number
  items: Array<{
    ticket_id: number
    quantity: number
  }>
}

export interface BulkLimitCheckResponse {
  success: boolean
  data?: {
    valid: boolean
    validations: TicketLimitValidation[]
    total_violations: number
  }
  message?: string
}

export interface TicketLimitSettings {
  id: number
  event_id: number
  enable_per_order_limits: boolean
  enable_cumulative_limits: boolean
  enable_daily_limits: boolean
  default_per_order_limit: number
  default_cumulative_limit: number
  default_daily_limit: number
  grace_period_minutes: number
  created_at: string
  updated_at: string
}

export interface TicketLimitAnalytics {
  ticket_id: number
  ticket_name: string
  limit_type: string
  limit_value: number
  current_usage: number
  usage_percentage: number
  violations_count: number
  top_violators: Array<{
    user_id: number
    user_name: string
    attempted_quantity: number
    violation_date: string
  }>
}

export interface EventLimitOverview {
  event_id: number
  event_name: string
  total_tickets: number
  tickets_with_limits: number
  total_limit_violations: number
  most_limited_ticket: {
    name: string
    limit_value: number
    usage_percentage: number
  }
  limit_analytics: TicketLimitAnalytics[]
}
