// Event-level staff management types based on new /events/{eventId}/staffs API response structure
export interface StaffRole {
  id: number
  name: 'super-admin' | 'eo-owner' | 'event-pic' | 'crew' | 'finance' | 'cashier' | 'customer'
  guard_name: string
  created_at: string
  updated_at: string
  pivot: {
    model_type: string
    model_id: number
    role_id: number
  }
}

export interface EventStaff {
  id: number
  created_by: number
  name: string
  email: string
  email_verified_at: string | null
  two_factor_secret: string | null
  two_factor_recovery_codes: string | null
  two_factor_confirmed_at: string | null
  created_at: string
  updated_at: string
  roles: StaffRole[]
  pivot: {
    event_id: number  // NEW: Staff is assigned to specific event
    user_id: number
  }
}

// Legacy Staff interface for backward compatibility
export interface Staff {
  id: number
  name: string
  email: string
  email_verified_at: string | null
  two_factor_secret: string | null
  two_factor_recovery_codes: string | null
  two_factor_confirmed_at: string | null
  created_at: string
  updated_at: string
  roles: StaffRole[]
  pivot: {
    eo_id: number
    user_id: number
  }
}

export interface EventStaffPaginationLink {
  url: string | null
  label: string
  active: boolean
}

export interface EventStaffResponse {
  success: boolean
  message: string
  data: {
    current_page: number
    data: EventStaff[]
    first_page_url: string
    from: number
    last_page: number
    last_page_url: string
    links: EventStaffPaginationLink[]
    next_page_url: string | null
    path: string
    per_page: number
    prev_page_url: string | null
    to: number
    total: number
  }
}

export interface EventStaffCreateRequest {
  name: string
  email: string
  role: 'event-pic' | 'crew' | 'finance' | 'cashier'
  event_id: number
}

export interface EventStaffUpdateRequest {
  name?: string
  role?: 'event-pic' | 'crew' | 'finance' | 'cashier'
}

export interface EventStaffCreateResponse {
  success: boolean
  message: string
  data: {
    name: string
    email: string
    role: string
    assigned_to_event?: string
    temporary_password_for_testing?: string
  }
}

export interface EventStaffDeleteResponse {
  success: boolean
  message: string
  data: any[]
}

// Legacy interfaces for backward compatibility
export interface StaffPaginationLink {
  url: string | null
  label: string
  active: boolean
}

export interface StaffResponse {
  success: boolean
  message: string
  data: {
    current_page: number
    data: Staff[]
    first_page_url: string
    from: number
    last_page: number
    last_page_url: string
    links: StaffPaginationLink[]
    next_page_url: string | null
    path: string
    per_page: number
    prev_page_url: string | null
    to: number
    total: number
  }
}

export interface StaffCreateRequest {
  name: string
  email: string
  role: string
}

export interface StaffUpdateRequest {
  name?: string
  email?: string
  roles?: StaffRole[]
}

export interface StaffCreateResponse {
  success: boolean
  message: string
  data: {
    name: string
    email: string
    role: string
  }
}

// Legacy types for backward compatibility - will be removed after migration
export interface Role {
  id: string
  name: string
  permissions: string[]
  usersCount: number
  createdAt: string
}

export interface UserRole {
  id: string
  name: string
  email: string
  roles: string[]
  assignedAt: string
} 