// Event Management Types for Iteration 4
export interface Facility {
  id: number
  name: string
  icon: string
  created_at: string | null
  updated_at: string | null
  pivot?: {
    event_id: number
    facility_id: number
  }
}

export interface Ticket {
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

export interface EventOrganizer {
  id: number
  eo_owner_id: number
  organizer_type: 'individual' | 'company'
  name: string
  logo: string | null
  description: string
  email_eo: string
  phone_no_eo: string
  address_eo: string
  created_at: string
  updated_at: string
  is_verified: boolean
}

export interface Event {
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
  status: 'draft' | 'active' | 'inactive' | 'archive' | 'completed'
  is_published: boolean
  is_public: boolean
  contact_phone: string
  tnc_id: number
  created_at: string
  updated_at: string
  event_organizer?: EventOrganizer
  facilities: Facility[]
  tickets: Ticket[]
}

// Request types for API calls
export interface EventCreateRequest {
  name: string
  description: string
  start_date: string
  start_time: string
  end_date: string
  end_time: string
  location: string
  contact_phone: string
  tnc_id: number
  facilities: number[]
  tickets: TicketCreateRequest[]
  poster?: File
}

export interface TicketCreateRequest {
  name: string
  price: number
  stock: number
  limit: number
  start_date: string
  end_date: string
  ticket_type_id: number
}

export interface EventUpdateRequest {
  name?: string
  description?: string
  start_date?: string
  start_time?: string
  end_date?: string
  end_time?: string
  location?: string
  contact_phone?: string
  tnc_id?: number
  facilities?: number[]
  tickets?: TicketCreateRequest[]
  poster?: File
  _method?: 'PUT'
}

// Response types
export interface EventResponse {
  success: boolean
  message: string
  data: Event
}

export interface EventListResponse {
  success: boolean
  message: string
  data: {
    current_page: number
    data: Event[]
    first_page_url: string
    from: number
    last_page: number
    last_page_url: string
    links: {
      url: string | null
      label: string
      active: boolean
    }[]
    next_page_url: string | null
    path: string
    per_page: number
    prev_page_url: string | null
    to: number
    total: number
  }
}

export interface EventPublishResponse {
  success: boolean
  message: string
  data?: Event
}

export interface EventDeleteResponse {
  message: string
}

// Facility types for master data
export interface FacilityResponse {
  success: boolean
  message: string
  data: Facility[]
}

export interface FacilityCreateRequest {
  name: string
  icon: string
}

// Ticket type for master data (hardcoded for now)
export interface TicketType {
  id: number
  name: string
  description: string
}

// Form validation types
export interface EventFormData {
  name: string
  description: string
  start_date: string
  start_time: string
  end_date: string
  end_time: string
  location: string
  contact_phone: string
  tnc_id: number
  facilities: number[]
  tickets: TicketFormData[]
  poster?: File
}

export interface TicketFormData {
  name: string
  price: string
  stock: string
  limit: string
  start_date: string
  end_date: string
  ticket_type_id: number
}

// Filter and search types
export interface EventFilters {
  status?: 'draft' | 'active' | 'completed'
  is_published?: boolean
  is_public?: boolean
  search?: string
  start_date?: string
  end_date?: string
}

export interface PublicEventFilters {
  search?: string
  start_date?: string
  end_date?: string
  location?: string
}

// Ticket Purchase Types for Iteration 5
export interface OrderItem {
  ticket_id: number
  quantity: number
}

export interface OrderCreateRequest {
  event_id: number
  items: OrderItem[]
  payment_method_id: string
  customer_name: string
  customer_email: string
  customer_phone: string
}

export interface Order {
  id: number
  customer_id: number
  event_id: number
  order_number: string
  total_amount: number
  status: 'pending' | 'paid' | 'cancelled' | 'expired'
  payment_method_id: string
  payment_status: 'pending' | 'success' | 'failed'
  payment_url?: string
  created_at: string
  updated_at: string
  items: OrderItemDetail[]
  event?: Event
}

export interface OrderItemDetail {
  id: number
  order_id: number
  ticket_id: number
  quantity: number
  price: number
  subtotal: number
  ticket?: Ticket
}

export interface OrderResponse {
  success: boolean
  message: string
  data: Order
}

export interface CustomerTicket {
  id: number
  order_id: number
  ticket_id: number
  ticket_code: string
  status: 'active' | 'used' | 'expired'
  qr_code?: string
  created_at: string
  order?: Order
  ticket?: Ticket
}

export interface CustomerTicketResponse {
  success: boolean
  message: string
  data: CustomerTicket[]
}

export interface QRCodeResponse {
  success: boolean
  message: string
  data: {
    qr_code: string
    ticket_code: string
  }
}