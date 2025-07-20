// Verification types for Iteration 2: Document Upload & Admin Verification System

export type OrganizerType = 'company' | 'individual'

export type DocumentType = 'ktp' | 'nib' | 'npwp'

export type DocumentStatus = 'pending' | 'verified' | 'rejected' | 'replaced'

export type NotificationType = 'App\\Notifications\\DocumentStatusUpdated'

// EO Profile Completion
export interface EOProfileCreateRequest {
  name: string
  logo?: File
  description: string
  email_eo: string
  phone_no_eo: string
  address_eo: string
  organization_type: OrganizerType
}

export interface EOProfileResponse {
  success: boolean
  message: string
  data: {
    id: number
    name: string
    organizer_type: OrganizerType
    logo?: string
    description: string
    email_eo: string
    phone_no_eo: string
    address_eo: string
    eo_owner_id: number
    updated_at: string
    created_at: string
    is_verified: boolean
  }
}

// Document Upload
export interface DocumentUploadRequest {
  type: DocumentType
  file: File
  number: string
  name: string
  address: string
}

export interface DocumentUploadResponse {
  success: boolean
  message: string
  data: {
    id: number
    type: DocumentType
    file: string
    number: string
    name: string
    address: string
    status: DocumentStatus
    documentable_id: number
    documentable_type: string
    updated_at: string
    created_at: string
    documentable: {
      id: number
      eo_owner_id: number
      organizer_type: OrganizerType
      name: string
      logo?: string
      description: string
      email_eo: string
      phone_no_eo: string
      address_eo: string
      created_at: string
      updated_at: string
      is_verified: boolean
    }
  }
}

// EO Profile Data
export interface EOProfileData {
  id: number
  eo_owner_id: number
  organizer_type: OrganizerType
  name: string
  logo?: string
  description: string
  email_eo: string
  phone_no_eo: string
  address_eo: string
  created_at: string
  updated_at: string
  is_verified: boolean
  documents: DocumentData[]
}

export interface EOProfileDataResponse {
  success: boolean
  message: string
  data: EOProfileData
}

// Document Data
export interface DocumentData {
  id: number
  documentable_type: string
  documentable_id: number
  type: DocumentType
  file: string
  number: string
  name: string
  address: string
  status: DocumentStatus
  reason_rejected?: string
  created_at: string
  updated_at: string
  documentable?: {
    id: number
    eo_owner_id: number
    organizer_type: OrganizerType
    name: string
    logo?: string
    description: string
    email_eo: string
    phone_no_eo: string
    address_eo: string
    created_at: string
    updated_at: string
    is_verified: boolean
    eo_owner?: {
      id: number
      name: string
      email: string
      email_verified_at?: string
      two_factor_secret?: string
      two_factor_recovery_codes?: string
      two_factor_confirmed_at?: string
      created_at: string
      updated_at: string
    }
  }
}

// Admin Verification List
export interface DocumentListResponse {
  success: boolean
  message: string
  data: {
    current_page: number
    data: DocumentData[]
    first_page_url: string
    from: number
    last_page: number
    last_page_url: string
    links: {
      url?: string
      label: string
      active: boolean
    }[]
    next_page_url?: string
    path: string
    per_page: number
    prev_page_url?: string
    to: number
    total: number
  }
}

// Document Details
export interface DocumentDetailResponse {
  success: boolean
  message: string
  data: DocumentData
}

// Document Status Update
export interface DocumentStatusUpdateRequest {
  status: 'verified' | 'rejected'
  reason_rejected?: string
  _method: 'PUT'
}

export interface DocumentStatusUpdateResponse {
  success: boolean
  message: string
  data: DocumentData
}

// Notifications
export interface NotificationData {
  id: string
  type: NotificationType
  notifiable_type: string
  notifiable_id: number
  data: {
    document_id: number
    document_type: DocumentType
    status: DocumentStatus
    message: string
  }
  read_at?: string
  created_at: string
  updated_at: string
}

export interface NotificationListResponse {
  success: boolean
  message: string
  data: {
    all: NotificationData[]
    unread: NotificationData[]
  }
}

export interface NotificationReadResponse {
  success: boolean
  message: string
  data: []
}

// Error Response
export interface DocumentErrorResponse {
  success: false
  message: string
}

// Form validation
export interface DocumentValidationRules {
  maxFileSize: number // in bytes
  allowedTypes: string[]
  requiredFields: string[]
}

// Component Props
export interface DocumentUploadProps {
  organizerType: OrganizerType
  onUploadSuccess?: (document: DocumentData) => void
  onUploadError?: (error: string) => void
}

export interface AdminVerificationProps {
  documents: DocumentData[]
  onStatusUpdate?: (documentId: number, status: DocumentStatus) => void
}

export interface VerificationStatusProps {
  profile: EOProfileData
  notifications: NotificationData[]
}

// Business Rules
export const DOCUMENT_RULES = {
  company: {
    required: ['nib', 'npwp'] as DocumentType[],
    optional: [] as DocumentType[]
  },
  individual: {
    required: ['ktp'] as DocumentType[],
    optional: ['npwp'] as DocumentType[]
  }
} as const

export const FILE_VALIDATION = {
  maxSize: 10 * 1024 * 1024, // 10MB
  allowedTypes: ['image/jpeg', 'image/png', 'application/pdf'],
  allowedExtensions: ['.jpg', '.jpeg', '.png', '.pdf']
} as const

export const DOCUMENT_LABELS = {
  ktp: 'KTP (Kartu Tanda Penduduk)',
  nib: 'NIB (Nomor Induk Berusaha)',
  npwp: 'NPWP (Nomor Pokok Wajib Pajak)'
} as const

export const STATUS_LABELS = {
  pending: 'Pending Review',
  verified: 'Verified',
  rejected: 'Rejected',
  replaced: 'Replaced'
} as const