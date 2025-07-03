// Staff management types based on /staff API response structure
export interface StaffRole {
  id: number
  name: string
  guard_name: string
  created_at: string
  updated_at: string
  pivot: {
    model_type: string
    model_id: number
    role_id: number
  }
}

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