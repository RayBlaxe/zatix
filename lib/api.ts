import { APIResponse } from "@/types/api"
import { LoginResponse } from "@/types/auth/login"
import { RegisterResponse } from "@/types/auth/register"
import { TermsAndConditions, TNCListResponse, TNCEventResponse, TNCAcceptResponse, TNCItem } from "@/types/terms"
import { Role, UserRole } from "@/app/dashboard/roles/types"
import { CarouselResponse } from "@/types/carousel"
import { 
  EOProfileCreateRequest, 
  EOProfileResponse, 
  EOProfileDataResponse, 
  DocumentUploadRequest, 
  DocumentUploadResponse, 
  DocumentListResponse, 
  DocumentDetailResponse, 
  DocumentStatusUpdateRequest, 
  DocumentStatusUpdateResponse, 
  NotificationListResponse, 
  NotificationReadResponse 
} from "@/types/verification"
import {
  Event,
  EventCreateRequest,
  EventUpdateRequest,
  EventResponse,
  EventListResponse,
  EventPublishResponse,
  EventDeleteResponse,
  Facility,
  FacilityResponse,
  FacilityCreateRequest,
  EventFilters,
  PublicEventFilters,
  CustomerTicketResponse
} from "@/types/events"
import {
  PaymentMethodsResponse,
  OrderCreateRequest,
  OrderCreateResponse,
  OrderStatusResponse
} from "@/types/payment"
import {
  TicketLimitCheckRequest,
  TicketLimitCheckResponse,
  BulkLimitCheckRequest,
  BulkLimitCheckResponse,
  UserTicketPurchaseHistory,
  TicketLimitSettings,
  EventLimitOverview,
  TicketLimitRule
} from "@/types/ticket-limits"
import {
  EventCategory,
  CategoryHierarchy,
  CategoryFilters,
  CategoryEventResponse,
  CategoryCreateRequest,
  CategoryUpdateRequest,
  CategoryStatsResponse,
  UserCategoryPreferences,
  CategoryRecommendationRequest,
  CategoryRecommendationResponse
} from "@/types/category"

// Base API URL - use environment variable or fallback for development
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.zatix.id/api"

// Utility function to construct event poster URLs
export function getEventPosterUrl(posterPath: string | null | undefined): string {
  if (!posterPath) {
    return "/placeholder.svg"
  }
  
  // If it's already a full URL, return as is
  if (posterPath.startsWith('http://') || posterPath.startsWith('https://')) {
    return posterPath
  }
  
  // Remove leading slash if present to avoid double slashes
  const cleanPath = posterPath.startsWith('/') ? posterPath.substring(1) : posterPath
  
  // Construct full URL using the API base URL pattern with /storage/
  return `https://api.zatix.id/storage/${cleanPath}`
}

// Laravel Sanctum token utilities
export function getStoredTokenExpiration(): Date | null {
  if (typeof window !== "undefined") {
    const expirationStr = localStorage.getItem("token_expires_at")
    if (expirationStr) {
      return new Date(expirationStr)
    }
  }
  return null
}

export function isTokenExpiredByStorage(): boolean {
  const expiration = getStoredTokenExpiration()
  if (!expiration) {
    return false // If no expiration stored, assume valid
  }
  return new Date() >= expiration
}

export function getTokenTimeRemaining(): number {
  const expiration = getStoredTokenExpiration()
  if (!expiration) {
    return 0
  }
  return Math.max(0, expiration.getTime() - new Date().getTime())
}

// API-based token validation for Laravel Sanctum
export async function validateTokenWithAPI(token: string): Promise<{
  valid: boolean;
  expiresAt?: Date;
  user?: any;
}> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    })

    if (response.ok) {
      const data = await response.json()
      return {
        valid: true,
        user: data.user || data.data,
      }
    } else if (response.status === 401) {
      return { valid: false }
    } else {
      // For other errors, assume token might still be valid
      return { valid: true }
    }
  } catch (error) {
    console.error('Token validation error:', error)
    // On network error, fall back to stored expiration
    return { valid: !isTokenExpiredByStorage() }
  }
}

// Helper function for making API requests with FormData
async function apiRequestFormData<T>(endpoint: string, method = "GET", formData?: FormData, token?: string): Promise<any> {
  const url = `${API_BASE_URL}${endpoint}`

  // Check stored token expiration before making request
  if (isTokenExpiredByStorage()) {
    console.warn("Token is expired based on stored expiration, removing from storage")
    removeToken()
    // Dispatch custom event to notify components of token expiration
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("tokenExpired"))
    }
    throw new Error("Token expired")
  }

  const headers: HeadersInit = {
    "Accept": "application/json",
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  }

  const config: RequestInit = {
    method,
    headers,
    credentials: "include",
  }

  if (formData) {
    config.body = formData
  }

  try {
    const response = await fetch(url, config)

    // Handle authentication errors (401/403)
    if (response.status === 401 || response.status === 403) {
      console.warn("Authentication failed, removing token")
      removeToken()
      // Dispatch custom event to notify components of authentication failure
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("authenticationFailed", {
          detail: { status: response.status, endpoint }
        }))
      }
      
      const responseData = await response.json().catch(() => ({
        success: false,
        message: "Authentication failed",
        data: null
      }))
      
      return responseData as APIResponse<T>
    }

    // Handle non-JSON responses
    const contentType = response.headers.get("content-type")
    if (contentType && contentType.indexOf("application/json") !== -1) {
      const responseData = await response.json()

      if (!response.ok) {
        // Return the error response as-is, so the frontend can handle it
        return responseData as APIResponse<T>
      }

      return responseData as APIResponse<T>
    } else {
      // For non-JSON responses
      if (!response.ok) {
        throw new Error("An error occurred")
      }

      return {} as unknown as APIResponse<T>
    }
  } catch (error) {
    console.error("API request error:", error)
    
    // Check if error is due to token expiration
    if (error instanceof Error && error.message === "Token expired") {
      throw error
    }
    
    // Use mock responses only when explicitly enabled
    if (process.env.NEXT_PUBLIC_USE_MOCKS === "true") {
      return handleMockResponse<T>(endpoint, method, formData)
    }
    throw error
  }
}

// Helper function for making API requests
async function apiRequest<T>(endpoint: string, method = "GET", data?: any, token?: string): Promise<any> {
  const url = `${API_BASE_URL}${endpoint}`
  console.log(`[API REQUEST] ${method} ${url}`, { data, token: token ? 'present' : 'missing' })

  // Check stored token expiration before making request
  if (isTokenExpiredByStorage()) {
    console.warn("Token is expired based on stored expiration, removing from storage")
    removeToken()
    // Dispatch custom event to notify components of token expiration
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("tokenExpired"))
    }
    throw new Error("Token expired")
  }

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    "Accept": "application/json",
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  }

  const config: RequestInit = {
    method,
    headers,
    credentials: "include", // Include cookies in requests
  }

  if (data) {
    config.body = JSON.stringify(data)
  }

  try {
    const response = await fetch(url, config)

    // Handle authentication errors (401/403)
    if (response.status === 401 || response.status === 403) {
      console.warn("Authentication failed, removing token")
      removeToken()
      // Dispatch custom event to notify components of authentication failure
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("authenticationFailed", {
          detail: { status: response.status, endpoint }
        }))
      }
      
      const responseData = await response.json().catch(() => ({
        success: false,
        message: "Authentication failed",
        data: null
      }))
      
      return responseData as APIResponse<T>
    }

    // Handle non-JSON responses
    const contentType = response.headers.get("content-type")
    if (contentType && contentType.indexOf("application/json") !== -1) {
      const responseData = await response.json()

      if (!response.ok) {
        // Return the error response as-is, so the frontend can handle it
        return responseData as APIResponse<T>
      }

      return responseData as APIResponse<T>
    } else {
      // For non-JSON responses
      if (!response.ok) {
        throw new Error("An error occurred")
      }

      return {} as unknown as APIResponse<T>
    }
  } catch (error) {
    console.error("API request error:", error)
    
    // Check if error is due to token expiration
    if (error instanceof Error && error.message === "Token expired") {
      throw error
    }
    
    // Use mock responses only when explicitly enabled
    if (process.env.NEXT_PUBLIC_USE_MOCKS === "true") {
      console.log(`[FALLING BACK TO MOCKS] ${method} ${endpoint} - Mocks explicitly enabled`)
      return handleMockResponse<T>(endpoint, method, data)
    }
    console.log(`[NO MOCK FALLBACK] ${method} ${endpoint} - Mocks disabled, throwing error`)
    throw error
  }
}

// Mock responses for development/demo purposes
function handleMockResponse<T>(endpoint: string, method: string, data?: any): T {
  console.log(`[MOCKS API] ${method} ${endpoint}`, data)
  console.log("API Base URL:", API_BASE_URL)


  // Login mock response
  if (endpoint === "/login" && method === "POST") {
    // Define valid test credentials for development
    const validCredentials = [
      { email: "superadmin@zatix.com", password: "admin123", roles: ["super-admin", "eo-owner", "customer"] },
      { email: "eoowner@zatix.com", password: "eoowner123", roles: ["eo-owner", "customer"] },
      { email: "customer@zatix.com", password: "customer123", roles: ["customer"] },
      { email: "test@test.com", password: "test123", roles: ["customer"] }
    ]
    
    const credential = validCredentials.find(
      cred => cred.email === data?.email && cred.password === data?.password
    )
    
    if (credential) {
      // Create a mock Sanctum token (opaque string like Laravel Sanctum)
      const mockSanctumToken = `${Math.floor(Math.random() * 1000)}|${Math.random().toString(36).substring(2, 40)}`
      
      return {
        success: true,
        message: "Login successfully",
        data: {
          access_token: mockSanctumToken,
          token_type: "Bearer",
          expires_in: 480, // 8 hours in minutes
          user: {
            id: Math.floor(Math.random() * 1000) + 1,
            name: credential.email.split("@")[0].replace(/([a-z])([A-Z])/g, '$1 $2').replace(/^\w/, c => c.toUpperCase()),
            email: credential.email,
            email_verified_at: "2024-12-31T17:00:00.000000Z",
            roles: credential.roles,
            created_at: "2025-06-23T02:11:31.000000Z",
            updated_at: "2025-06-23T02:11:31.000000Z"
          },
        },
      } as unknown as T
    } else {
      return {
        success: false,
        message: "Invalid email or password",
        data: null,
      } as unknown as T
    }
  }

  // Register mock response
  if (endpoint === "/register" && method === "POST") {
    return {
      success: true,
      message: "Registration successful. Please verify your email.",
      data: {
        email: data?.email || "user@example.com",
        otp_code: "123456",
      },
    } as unknown as T
  }

  // Verify OTP mock response
  if (endpoint === "/verify-otp" && method === "POST") {
    return {
      success: true,
      message: "OTP verified successfully",
      data: {
        token: `1|${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`,
        user: {
          id: Math.floor(Math.random() * 1000) + 1,
          name: data?.email?.split("@")[0] || "Demo User",
          email: data?.email || "user@example.com",
          email_verified_at: "2024-12-31T17:00:00.000000Z",
          roles: ["customer"],
          created_at: "2025-06-23T02:11:31.000000Z",
          updated_at: "2025-06-23T02:11:31.000000Z"
        },
      },
    } as unknown as T
  }

  // Resend OTP mock response
  if (endpoint === "/resend-otp" && method === "POST") {
    return {
      success: true,
      message: "OTP resent successfully.",
    } as unknown as T
  }

  // Forgot password mock response
  if (endpoint === "/forgot-password" && method === "POST") {
    return {
      success: true,
      message: "Password reset instructions sent to your email.",
    } as unknown as T
  }

  // Laravel Sanctum /auth/me mock response
  if (endpoint === "/auth/me" && method === "GET") {
    // Simulate token validation - in real Laravel Sanctum, this would validate the token
    return {
      success: true,
      message: "User data retrieved successfully",
      data: {
        user: {
          id: Math.floor(Math.random() * 1000) + 1,
          name: "Demo User",
          email: "demo@zatix.com",
          email_verified_at: "2024-12-31T17:00:00.000000Z",
          roles: ["customer"],
          created_at: "2025-06-23T02:11:31.000000Z",
          updated_at: "2025-06-23T02:11:31.000000Z"
        }
      }
    } as unknown as T
  }

  // Logout mock response
  if (endpoint === "/logout" && method === "POST") {
    return {
      success: true,
      message: "Logged out successfully.",
    } as unknown as T
  }

  // Super Admin TNC list mock response
  if (endpoint === "/tnc" && method === "GET") {
    return [
      {
        id: 1,
        content: `
                    <p><strong>1. Introduction</strong><br>
                    Welcome to EventHub. These Terms and Conditions govern your use of our platform and services as an Event Organizer. By accessing or using our services, you agree to be bound by these Terms.</p>

                    <p><strong>2. Event Creation Process</strong><br>
                    Our platform requires event organizers to go through a verification process before gaining full access to create events. This process includes:</p>

                    <ul>
                        <li>Submitting basic information about your organization and event</li>
                        <li>Scheduling a pitching session with our team</li>
                        <li>Demonstrating your event concept during the pitching session</li>
                        <li>Receiving a demo account to test our platform</li>
                    </ul>
                `,
        type: "event",
        created_at: null,
        updated_at: null
      },
      {
        id: 2,
        content: `
                    <p><strong>1. Introduction</strong><br>
                    Welcome to ZaTix. These Terms and Conditions govern your use of our platform and services as an Event Organizer. By accessing or using our services, you agree to be bound by these Terms.</p>

                    <p><strong>2. Event Creation Process</strong><br>
                    Our platform requires event organizers to go through a verification process before gaining full access to create events. This process includes:</p>
                    <ul>
                        <li>Submitting basic information about your organization and event</li>
                        <li>Scheduling a pitching session with our team</li>
                        <li>Demonstrating your event concept during the pitching session</li>
                        <li>Receiving a demo account to test our platform</li>
                        <li>Upon satisfaction and approval, receiving full access to our platform</li>
                    </ul>

                    <p><strong>3. Account Usage</strong><br>
                    You are responsible for maintaining the confidentiality of your account information and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account.</p>

                    <p><strong>4. Content Guidelines</strong><br>
                    All events created on our platform must comply with our content guidelines. Events that promote illegal activities, hate speech, or violate any applicable laws are strictly prohibited.</p>

                    <p><strong>5. Fees and Payments</strong><br>
                    Depending on your subscription plan, fees may apply for using our platform. All fees are non-refundable unless otherwise specified in our refund policy.</p>

                    <p><strong>6. Free Account Limitations</strong><br>
                    Free accounts are limited to creating 1 event with a maximum of 10 participants. To create more events or increase participant limits, you will need to upgrade to a paid plan.</p>

                    <p><strong>7. Termination</strong><br>
                    We reserve the right to terminate or suspend your account at any time for violations of these Terms or for any other reason at our sole discretion.</p>

                    <p><strong>8. Limitation of Liability</strong><br>
                    To the maximum extent permitted by law, we shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues.</p>

                    <p><strong>9. Changes to Terms</strong><br>
                    We may modify these Terms at any time. Your continued use of our platform after such changes constitutes your acceptance of the new Terms.</p>

                    <p><strong>10. Contact Information</strong><br>
                    If you have any questions about these Terms, please contact us at <a href="mailto:support@zatix.com">support@zatix.com</a>.</p>
                    `,
        type: "general",
        created_at: null,
        updated_at: null
      }
    ] as unknown as T
  }

  // EO Owner TNC events mock response
  if (endpoint === "/tnc-events" && method === "GET") {
    return {
      success: true,
      message: "Terms and conditions data retrieved successfully",
      data: {
        "0": {
          id: 1,
          content: `
                    <p><strong>1. Introduction</strong><br>
                    Welcome to EventHub. These Terms and Conditions govern your use of our platform and services as an Event Organizer. By accessing or using our services, you agree to be bound by these Terms.</p>

                    <p><strong>2. Event Creation Process</strong><br>
                    Our platform requires event organizers to go through a verification process before gaining full access to create events. This process includes:</p>

                    <ul>
                        <li>Submitting basic information about your organization and event</li>
                        <li>Scheduling a pitching session with our team</li>
                        <li>Demonstrating your event concept during the pitching session</li>
                        <li>Receiving a demo account to test our platform</li>
                    </ul>
                `,
          type: "event",
          created_at: null,
          updated_at: null
        },
        already_accepted: false
      }
    } as unknown as T
  }

  // TNC acceptance mock response
  if (endpoint === "/tnc-events/accept" && method === "POST") {
    return {
      success: true,
      message: "TNC event successfully approved",
      data: []
    } as unknown as T
  }

  // Super Admin TNC update mock response
  if (endpoint.startsWith("/tnc/") && method === "PUT") {
    const id = parseInt(endpoint.split("/")[2])
    return {
      id: id,
      content: data?.content || "Updated TNC content",
      type: data?.type || "general",
      created_at: "2025-07-02T10:00:00.000000Z",
      updated_at: new Date().toISOString()
    } as unknown as T
  }

  // Super Admin TNC delete mock response
  if (endpoint.startsWith("/tnc/") && method === "DELETE") {
    return {
      success: true,
      message: "TNC deleted successfully"
    } as unknown as T
  }

  // Staff API mock responses - matches /staff endpoint structure
  if (endpoint === "/staff" && method === "GET") {
    return {
      success: true,
      message: "Staff retrieved successfully.",
      data: {
        current_page: 1,
        data: [
          {
            id: 5,
            name: "Finance",
            email: "finance@zatix.com",
            email_verified_at: "2024-12-31T17:00:00.000000Z",
            two_factor_secret: null,
            two_factor_recovery_codes: null,
            two_factor_confirmed_at: null,
            created_at: "2025-07-02T10:59:43.000000Z",
            updated_at: "2025-07-02T10:59:43.000000Z",
            roles: [
              {
                id: 4,
                name: "finance",
                guard_name: "api",
                created_at: "2025-07-02T10:59:43.000000Z",
                updated_at: "2025-07-02T10:59:43.000000Z",
                pivot: {
                  model_type: "App\\Models\\User",
                  model_id: 5,
                  role_id: 4
                }
              }
            ],
            pivot: {
              eo_id: 1,
              user_id: 5
            }
          },
          {
            id: 4,
            name: "Crew",
            email: "crew@zatix.com",
            email_verified_at: "2024-12-31T17:00:00.000000Z",
            two_factor_secret: null,
            two_factor_recovery_codes: null,
            two_factor_confirmed_at: null,
            created_at: "2025-07-02T10:59:43.000000Z",
            updated_at: "2025-07-02T10:59:43.000000Z",
            roles: [
              {
                id: 3,
                name: "crew",
                guard_name: "api",
                created_at: "2025-07-02T10:59:43.000000Z",
                updated_at: "2025-07-02T10:59:43.000000Z",
                pivot: {
                  model_type: "App\\Models\\User",
                  model_id: 4,
                  role_id: 3
                }
              }
            ],
            pivot: {
              eo_id: 1,
              user_id: 4
            }
          },
          {
            id: 6,
            name: "Cashier",
            email: "cashier@zatix.com",
            email_verified_at: "2024-12-31T17:00:00.000000Z",
            two_factor_secret: null,
            two_factor_recovery_codes: null,
            two_factor_confirmed_at: null,
            created_at: "2025-07-02T10:59:43.000000Z",
            updated_at: "2025-07-02T10:59:43.000000Z",
            roles: [
              {
                id: 5,
                name: "cashier",
                guard_name: "api",
                created_at: "2025-07-02T10:59:43.000000Z",
                updated_at: "2025-07-02T10:59:43.000000Z",
                pivot: {
                  model_type: "App\\Models\\User",
                  model_id: 6,
                  role_id: 5
                }
              }
            ],
            pivot: {
              eo_id: 1,
              user_id: 6
            }
          }
        ],
        first_page_url: "https://api.zatix.id/api/staff?page=1",
        from: 1,
        last_page: 1,
        last_page_url: "https://api.zatix.id/api/staff?page=1",
        links: [
          {
            url: null,
            label: "&laquo; Previous",
            active: false
          },
          {
            url: "https://api.zatix.id/api/staff?page=1",
            label: "1",
            active: true
          },
          {
            url: null,
            label: "Next &raquo;",
            active: false
          }
        ],
        next_page_url: null,
        path: "https://api.zatix.id/api/staff",
        per_page: 15,
        prev_page_url: null,
        to: 3,
        total: 3
      }
    } as unknown as T
  }

  // Event Staff API mock responses - NEW: Event-scoped staff management
  if (endpoint.includes("/events/") && endpoint.includes("/staffs") && method === "GET") {
    const eventId = endpoint.split("/")[2]
    return {
      success: true,
      message: "Staff for event retrieved successfully.",
      data: {
        current_page: 1,
        data: [
          {
            id: 4,
            created_by: 2,
            name: "Event PIC",
            email: "pic@zatix.com",
            email_verified_at: "2024-12-31T17:00:00.000000Z",
            two_factor_secret: null,
            two_factor_recovery_codes: null,
            two_factor_confirmed_at: null,
            created_at: "2025-08-27T16:04:48.000000Z",
            updated_at: "2025-08-27T16:05:13.000000Z",
            roles: [
              {
                id: 3,
                name: "crew",
                guard_name: "api",
                created_at: "2025-08-27T16:04:49.000000Z",
                updated_at: "2025-08-27T16:04:49.000000Z",
                pivot: {
                  model_type: "App\\Models\\User",
                  model_id: 4,
                  role_id: 3
                }
              },
              {
                id: 7,
                name: "event-pic",
                guard_name: "api",
                created_at: "2025-08-27T16:04:50.000000Z",
                updated_at: "2025-08-27T16:04:50.000000Z",
                pivot: {
                  model_type: "App\\Models\\User",
                  model_id: 4,
                  role_id: 7
                }
              }
            ],
            pivot: {
              event_id: parseInt(eventId),
              user_id: 4
            }
          },
          {
            id: 5,
            created_by: 4,
            name: "Crew",
            email: "crew@zatix.com",
            email_verified_at: "2024-12-31T17:00:00.000000Z",
            two_factor_secret: null,
            two_factor_recovery_codes: null,
            two_factor_confirmed_at: null,
            created_at: "2025-08-27T16:04:49.000000Z",
            updated_at: "2025-08-27T16:05:13.000000Z",
            roles: [
              {
                id: 3,
                name: "crew",
                guard_name: "api",
                created_at: "2025-08-27T16:04:49.000000Z",
                updated_at: "2025-08-27T16:04:49.000000Z",
                pivot: {
                  model_type: "App\\Models\\User",
                  model_id: 5,
                  role_id: 3
                }
              }
            ],
            pivot: {
              event_id: parseInt(eventId),
              user_id: 5
            }
          },
          {
            id: 6,
            created_by: 4,
            name: "Finance",
            email: "finance@zatix.com",
            email_verified_at: "2024-12-31T17:00:00.000000Z",
            two_factor_secret: null,
            two_factor_recovery_codes: null,
            two_factor_confirmed_at: null,
            created_at: "2025-08-27T16:04:49.000000Z",
            updated_at: "2025-08-27T16:05:13.000000Z",
            roles: [
              {
                id: 4,
                name: "finance",
                guard_name: "api",
                created_at: "2025-08-27T16:04:49.000000Z",
                updated_at: "2025-08-27T16:04:49.000000Z",
                pivot: {
                  model_type: "App\\Models\\User",
                  model_id: 6,
                  role_id: 4
                }
              }
            ],
            pivot: {
              event_id: parseInt(eventId),
              user_id: 6
            }
          },
          {
            id: 7,
            created_by: 4,
            name: "Cashier",
            email: "cashier@zatix.com",
            email_verified_at: "2024-12-31T17:00:00.000000Z",
            two_factor_secret: null,
            two_factor_recovery_codes: null,
            two_factor_confirmed_at: null,
            created_at: "2025-08-27T16:04:49.000000Z",
            updated_at: "2025-08-27T16:05:13.000000Z",
            roles: [
              {
                id: 5,
                name: "cashier",
                guard_name: "api",
                created_at: "2025-08-27T16:04:50.000000Z",
                updated_at: "2025-08-27T16:04:50.000000Z",
                pivot: {
                  model_type: "App\\Models\\User",
                  model_id: 7,
                  role_id: 5
                }
              }
            ],
            pivot: {
              event_id: parseInt(eventId),
              user_id: 7
            }
          }
        ],
        first_page_url: `http://zatix-backend.test/api/events/${eventId}/staffs?page=1`,
        from: 1,
        last_page: 1,
        last_page_url: `http://zatix-backend.test/api/events/${eventId}/staffs?page=1`,
        links: [
          {
            url: null,
            label: "&laquo; Previous",
            active: false
          },
          {
            url: `http://zatix-backend.test/api/events/${eventId}/staffs?page=1`,
            label: "1",
            active: true
          },
          {
            url: null,
            label: "Next &raquo;",
            active: false
          }
        ],
        next_page_url: null,
        path: `http://zatix-backend.test/api/events/${eventId}/staffs`,
        per_page: 15,
        prev_page_url: null,
        to: 4,
        total: 4
      }
    } as unknown as T
  }

  if (endpoint === "/staffs/create" && method === "POST") {
    return {
      success: true,
      message: "Staff member created and assigned to event successfully.",
      data: {
        name: data?.name || "New Staff",
        email: data?.email || "newstaff@zatix.com",
        role: data?.role || "crew",
        assigned_to_event: "Sample Event"
      }
    } as unknown as T
  }

  if (endpoint.includes("/events/") && endpoint.includes("/staffs/") && method === "DELETE") {
    return {
      success: true,
      message: "Staff successfully unassigned from the event.",
      data: []
    } as unknown as T
  }

  // Financial API mock responses
  if (endpoint.includes("/reports/events/") && method === "GET") {
    const eventId = endpoint.split("/")[3]
    return {
      success: true,
      message: "Event financial report retrieved successfully.",
      data: {
        event: {
          id: parseInt(eventId),
          name: "Workshop Fotografi: Teknik Dasar"
        },
        summary: {
          total_income: 900000,
          total_expenses: 150000,
          net_profit: 750000,
          tickets_sold: 18,
          ticket_sales: 900000,
          other_income: 0
        }
      }
    } as unknown as T
  }

  if (endpoint.includes("/reports/eos/") && method === "GET") {
    const eoId = endpoint.split("/")[3]
    return {
      success: true,
      message: "EO financial report retrieved successfully.",
      data: {
        event_organizer: {
          id: parseInt(eoId),
          name: "EO Owner Organizer"
        },
        summary: {
          total_income: 2450000,
          total_expenses: 480000,
          net_profit: 1970000,
          tickets_sold: 67,
          ticket_sales: 2450000,
          other_income: 0
        },
        event_breakdowns: [
          {
            id: 1,
            name: "Workshop Fotografi: Teknik Dasar",
            total_income: 900000,
            total_expenses: 150000,
            net_profit: 750000,
            tickets_sold: 18
          },
          {
            id: 2,
            name: "Seminar Digital Marketing",
            total_income: 800000,
            total_expenses: 180000,
            net_profit: 620000,
            tickets_sold: 24
          },
          {
            id: 3,
            name: "Music Concert Night",
            total_income: 750000,
            total_expenses: 150000,
            net_profit: 600000,
            tickets_sold: 25
          }
        ]
      }
    } as unknown as T
  }

  if (endpoint === "/reports/global" && method === "GET") {
    return {
      success: true,
      message: "Global financial report retrieved successfully.",
      data: {
        summary: {
          total_income: 8950000,
          total_expenses: 1650000,
          net_profit: 7300000,
          tickets_sold: 234,
          ticket_sales: 8950000,
          other_income: 0
        },
        eo_breakdowns: [
          {
            id: 1,
            name: "EO Owner Organizer",
            total_events: 6,
            subtotal_net_profit: 2970000,
            subtotal_tickets_sold: 67,
            subtotal_income: 2450000
          },
          {
            id: 2,
            name: "Creative Events Co",
            total_events: 8,
            subtotal_net_profit: 2180000,
            subtotal_tickets_sold: 89,
            subtotal_income: 3200000
          },
          {
            id: 3,
            name: "Premium Event Solutions",
            total_events: 4,
            subtotal_net_profit: 2150000,
            subtotal_tickets_sold: 78,
            subtotal_income: 3300000
          }
        ]
      }
    } as unknown as T
  }

  if (endpoint === "/transactions" && method === "GET") {
    return {
      success: true,
      message: "Transactions retrieved successfully.",
      data: {
        current_page: 1,
        data: [
          {
            id: 1,
            order_id: "9f77df4a-e02b-4fe9-b727-fddab3bec01b",
            user_id: 8,
            version_of_payment: 1,
            grand_discount: 0,
            grand_amount: 150000,
            type: "transfer",
            status: "success",
            created_at: "2025-08-30T15:46:02.000000Z",
            updated_at: "2025-08-30T15:50:15.000000Z",
            user: {
              id: 8,
              name: "John Doe",
              email: "john@example.com"
            },
            event: {
              id: 1,
              name: "Workshop Fotografi: Teknik Dasar"
            },
            ticket_details: [
              {
                id: 1,
                ticket_name: "Regular Ticket",
                quantity: 1,
                price: 150000,
                subtotal: 150000
              }
            ]
          },
          {
            id: 2,
            order_id: "8a4cdf5f-3dc7-44c2-81cf-9a216f4f31e0",
            user_id: 9,
            version_of_payment: 1,
            grand_discount: 25000,
            grand_amount: 225000,
            type: "credit_card",
            status: "pending",
            created_at: "2025-08-30T14:30:12.000000Z",
            updated_at: "2025-08-30T14:30:12.000000Z",
            user: {
              id: 9,
              name: "Jane Smith",
              email: "jane@example.com"
            },
            event: {
              id: 2,
              name: "Seminar Digital Marketing"
            },
            ticket_details: [
              {
                id: 2,
                ticket_name: "VIP Ticket",
                quantity: 1,
                price: 250000,
                subtotal: 250000
              }
            ]
          },
          {
            id: 3,
            order_id: "7b3caf9e-2dc6-33c1-70cf-8a105f3f20d9",
            user_id: 10,
            version_of_payment: 1,
            grand_discount: 0,
            grand_amount: 300000,
            type: "ewallet",
            status: "failed",
            created_at: "2025-08-30T13:15:45.000000Z",
            updated_at: "2025-08-30T13:20:30.000000Z",
            user: {
              id: 10,
              name: "Bob Wilson",
              email: "bob@example.com"
            },
            event: {
              id: 3,
              name: "Music Concert Night"
            },
            ticket_details: [
              {
                id: 3,
                ticket_name: "Premium Ticket",
                quantity: 2,
                price: 150000,
                subtotal: 300000
              }
            ]
          }
        ],
        first_page_url: "https://api.zatix.id/api/transactions?page=1",
        from: 1,
        last_page: 1,
        last_page_url: "https://api.zatix.id/api/transactions?page=1",
        next_page_url: null,
        path: "https://api.zatix.id/api/transactions",
        per_page: 15,
        prev_page_url: null,
        to: 3,
        total: 3
      }
    } as unknown as T
  }

  if (endpoint.includes("/transactions/") && endpoint.includes("/payment-details") && method === "GET") {
    return {
      success: true,
      message: "Payment details retrieved successfully.",
      data: {
        status_code: "200",
        status_message: "Success, transaction found",
        transaction_id: "8a4cdf5f-3dc7-44c2-81cf-9a216f4f31e0",
        order_id: "9f77caf9-1597-4fcb-9ef7-3bd61d36a2db",
        merchant_id: "G555603538",
        gross_amount: "150000.00",
        currency: "IDR",
        payment_type: "bank_transfer",
        transaction_time: "2025-08-30 21:49:12",
        transaction_status: "settlement",
        fraud_status: "accept",
        va_numbers: [
          {
            bank: "bca",
            va_number: "03538014923860627657259"
          }
        ],
        expiry_time: "2025-08-31 21:49:12"
      }
    } as unknown as T
  }

  if (endpoint === "/financial/metrics" && method === "GET") {
    return {
      success: true,
      message: "Financial metrics retrieved successfully.",
      data: {
        totalRevenue: 8950000,
        totalTransactions: 234,
        successfulTransactions: 187,
        pendingTransactions: 32,
        failedTransactions: 15,
        averageTransactionValue: 38248,
        topEvents: [
          {
            eventId: 1,
            eventName: "Workshop Fotografi: Teknik Dasar",
            revenue: 900000,
            ticketsSold: 18
          },
          {
            eventId: 2,
            eventName: "Seminar Digital Marketing",
            revenue: 800000,
            ticketsSold: 24
          },
          {
            eventId: 3,
            eventName: "Music Concert Night",
            revenue: 750000,
            ticketsSold: 25
          }
        ],
        revenueGrowth: 23.5,
        transactionGrowth: 18.2
      }
    } as unknown as T
  }

  if (endpoint === "/staff/create" && method === "POST") {
    return {
      success: true,
      message: "Staff member created successfully. An email has been sent to them to set up their password.",
      data: {
        name: data?.name || "New Staff",
        email: data?.email || "newstaff@zatix.com",
        role: data?.role || "staff"
      }
    } as unknown as T
  }

  if (endpoint.startsWith("/staff/") && method === "PUT") {
    const staffId = endpoint.split("/")[2]
    return {
      success: true,
      message: "Staff updated successfully.",
      data: {
        id: parseInt(staffId),
        name: data?.name || "Updated Staff",
        email: data?.email || "updated@zatix.com",
        email_verified_at: "2024-12-31T17:00:00.000000Z",
        two_factor_secret: null,
        two_factor_recovery_codes: null,
        two_factor_confirmed_at: null,
        created_at: "2025-07-02T10:59:43.000000Z",
        updated_at: new Date().toISOString(),
        roles: data?.roles || [],
        pivot: {
          eo_id: 1,
          user_id: parseInt(staffId)
        }
      }
    } as unknown as T
  }

  if (endpoint.includes("/users/") && endpoint.includes("/roles") && method === "POST") {
    const userId = endpoint.split("/")[2]
    return {
      id: userId,
      name: "User Name",
      email: "user@zatix.com",
      roles: data?.roleIds || [],
      assignedAt: new Date().toISOString()
    } as unknown as T
  }

  if (endpoint === "/permissions" && method === "GET") {
    return [
      "create_events",
      "edit_events", 
      "delete_events",
      "view_events",
      "manage_tickets",
      "view_analytics",
      "export_reports",
      "manage_content",
      "view_finance",
      "manage_payments",
      "manage_users",
      "view_users"
    ] as unknown as T
  }

  // Carousel API mock response
  if (endpoint === "/carousels" && method === "GET") {
    return {
      success: true,
      message: "Carousel data retrieved successfully",
      data: [
        {
          id: 1,
          image: "carousels/sample-1.jpg",
          title: "Diskon Spesial Musim Panas",
          caption: "Nikmati potongan harga hingga 50% untuk semua produk fashion.",
          link_url: "https://google.com",
          link_target: "_self",
          order: "1",
          is_active: 1,
          created_at: "2025-07-02T10:59:46.000000Z",
          updated_at: "2025-07-02T10:59:46.000000Z",
          image_url: "https://api.zatix.id/project/public/storage/carousels/sample-1.jpg"
        },
        {
          id: 2,
          image: "carousels/sample-2.jpg",
          title: "Koleksi Terbaru Telah Tiba",
          caption: "Jelajahi koleksi terbaru kami yang elegan dan modern.",
          link_url: "https://google.com",
          link_target: "_blank",
          order: "2",
          is_active: 1,
          created_at: "2025-07-02T10:59:49.000000Z",
          updated_at: "2025-07-02T10:59:49.000000Z",
          image_url: "https://api.zatix.id/project/public/storage/carousels/sample-2.jpg"
        },
        {
          id: 3,
          image: "carousels/sample-3.jpg",
          title: "Acara Komunitas Berikutnya",
          caption: "Segera hadir, jangan sampai ketinggalan!",
          link_url: null,
          link_target: "_self",
          order: "3",
          is_active: 1,
          created_at: "2025-07-02T10:59:52.000000Z",
          updated_at: "2025-07-02T10:59:52.000000Z",
          image_url: "https://api.zatix.id/project/public/storage/carousels/sample-3.jpg"
        }
      ]
    } as unknown as T
  }

  // EO Profile Creation mock response
  if (endpoint === "/event-organizers/create" && method === "POST") {
    // FormData access pattern
    const organizationType = (data instanceof FormData ? data.get('organizer_type') : data?.organization_type) || 'individual'
    const name = (data instanceof FormData ? data.get('name') : data?.name) || 'Demo Organization'
    const email = (data instanceof FormData ? data.get('email_eo') : data?.email_eo) || 'demo@example.com'
    
    return {
      success: true,
      message: "EO profile created successfully",
      data: {
        id: Math.floor(Math.random() * 1000) + 1,
        name: name,
        organizer_type: organizationType,
        logo: null,
        description: (data instanceof FormData ? data.get('description') : data?.description) || 'Demo organization description',
        email_eo: email,
        phone_no_eo: (data instanceof FormData ? data.get('phone_no_eo') : data?.phone_no_eo) || '+1234567890',
        address_eo: (data instanceof FormData ? data.get('address_eo') : data?.address_eo) || 'Demo address',
        eo_owner_id: Math.floor(Math.random() * 1000) + 1,
        updated_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        is_verified: false
      }
    } as unknown as T
  }

  // Document Upload - Removed mock response to force real API usage

  // Removed EO Profile mock response - always use real API

  // Event API mock responses removed - using real API endpoints

  // Facilities mock response
  if (endpoint === "/facilities" && method === "GET") {
    return {
      success: true,
      message: "Facilities retrieved successfully",
      data: [
        {
          id: 1,
          name: "Toilet",
          icon: "fa-solid fa-toilet",
          created_at: null,
          updated_at: null
        },
        {
          id: 2,
          name: "Konsumsi",
          icon: "fa-solid fa-utensils",
          created_at: null,
          updated_at: null
        },
        {
          id: 3,
          name: "Snack",
          icon: "fa-solid fa-cookie-bite",
          created_at: null,
          updated_at: null
        },
        {
          id: 4,
          name: "Parkir",
          icon: "fa-solid fa-car",
          created_at: null,
          updated_at: null
        },
        {
          id: 5,
          name: "WiFi",
          icon: "fa-solid fa-wifi",
          created_at: null,
          updated_at: null
        }
      ]
    } as unknown as T
  }

  // Ticket Limits API mock responses
  if (endpoint === "/ticket-limits/check" && method === "POST") {
    const { ticket_id, user_id, requested_quantity } = data || {}
    const isValid = requested_quantity <= 5 // Simple validation: max 5 tickets per person
    return {
      success: true,
      data: {
        ticket_id: ticket_id,
        requested_quantity: requested_quantity,
        available_quantity: isValid ? requested_quantity : 5,
        limit_type: "per_order",
        limit_value: 5,
        user_purchased: Math.floor(Math.random() * 3),
        is_valid: isValid,
        error_message: isValid ? undefined : "Exceeded maximum ticket limit per person"
      },
      message: isValid ? "Ticket limit validation passed" : "Ticket limit validation failed"
    } as unknown as T
  }

  if (endpoint === "/ticket-limits/bulk-check" && method === "POST") {
    const { user_id, items } = data || {}
    const validations = (items || []).map((item: any) => ({
      ticket_id: item.ticket_id,
      requested_quantity: item.quantity,
      available_quantity: Math.min(item.quantity, 5),
      limit_type: "per_order",
      limit_value: 5,
      user_purchased: Math.floor(Math.random() * 3),
      is_valid: item.quantity <= 5,
      error_message: item.quantity > 5 ? "Exceeded maximum ticket limit per person" : undefined
    }))
    const totalViolations = validations.filter((v: any) => !v.is_valid).length
    return {
      success: true,
      data: {
        valid: totalViolations === 0,
        validations: validations,
        total_violations: totalViolations
      },
      message: totalViolations === 0 ? "All ticket limits validated successfully" : "Some ticket limits violated"
    } as unknown as T
  }

  if (endpoint.startsWith("/ticket-limits/history/") && method === "GET") {
    const pathParts = endpoint.split("/")
    const userId = parseInt(pathParts[3])
    const ticketId = parseInt(pathParts[4])
    return {
      success: true,
      data: {
        user_id: userId,
        ticket_id: ticketId,
        total_purchased: Math.floor(Math.random() * 10) + 1,
        daily_purchased: Math.floor(Math.random() * 3) + 1,
        last_purchase_date: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        orders: [
          {
            order_id: 1001,
            quantity: 2,
            purchase_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            status: "success"
          },
          {
            order_id: 1002,
            quantity: 1,
            purchase_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            status: "success"
          }
        ]
      },
      message: "User purchase history retrieved successfully"
    } as unknown as T
  }

  if (endpoint.startsWith("/ticket-limits/settings/") && method === "GET") {
    const eventId = parseInt(endpoint.split("/")[3])
    return {
      success: true,
      data: {
        id: 1,
        event_id: eventId,
        enable_per_order_limits: true,
        enable_cumulative_limits: false,
        enable_daily_limits: false,
        default_per_order_limit: 5,
        default_cumulative_limit: 10,
        default_daily_limit: 3,
        grace_period_minutes: 15,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      message: "Event limit settings retrieved successfully"
    } as unknown as T
  }

  if (endpoint.startsWith("/ticket-limits/settings/") && method === "PUT") {
    const eventId = parseInt(endpoint.split("/")[3])
    return {
      success: true,
      data: {
        id: 1,
        event_id: eventId,
        ...data,
        updated_at: new Date().toISOString()
      },
      message: "Event limit settings updated successfully"
    } as unknown as T
  }

  if (endpoint.startsWith("/ticket-limits/rules/") && method === "GET") {
    const ticketId = parseInt(endpoint.split("/")[3])
    return {
      success: true,
      data: [
        {
          id: 1,
          ticket_id: ticketId,
          limit_type: "per_order",
          limit_value: 5,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 2,
          ticket_id: ticketId,
          limit_type: "cumulative",
          limit_value: 10,
          is_active: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ],
      message: "Ticket limit rules retrieved successfully"
    } as unknown as T
  }

  if (endpoint.startsWith("/ticket-limits/rules/") && method === "POST") {
    const ticketId = parseInt(endpoint.split("/")[3])
    const { rules } = data || {}
    return {
      success: true,
      data: (rules || []).map((rule: any, index: number) => ({
        id: index + 1,
        ticket_id: ticketId,
        ...rule,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })),
      message: "Ticket limit rules updated successfully"
    } as unknown as T
  }

  if (endpoint.startsWith("/ticket-limits/analytics/") && method === "GET") {
    const eventId = parseInt(endpoint.split("/")[3])
    return {
      success: true,
      data: {
        event_id: eventId,
        event_name: "Sample Event",
        total_tickets: 4,
        tickets_with_limits: 3,
        total_limit_violations: 7,
        most_limited_ticket: {
          name: "VIP Ticket",
          limit_value: 2,
          usage_percentage: 85.5
        },
        limit_analytics: [
          {
            ticket_id: 1,
            ticket_name: "Regular Ticket",
            limit_type: "per_order",
            limit_value: 5,
            current_usage: 67,
            usage_percentage: 67.0,
            violations_count: 3,
            top_violators: [
              {
                user_id: 1,
                user_name: "John Doe",
                attempted_quantity: 8,
                violation_date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
              }
            ]
          },
          {
            ticket_id: 2,
            ticket_name: "VIP Ticket",
            limit_type: "per_order",
            limit_value: 2,
            current_usage: 45,
            usage_percentage: 85.5,
            violations_count: 4,
            top_violators: [
              {
                user_id: 2,
                user_name: "Jane Smith",
                attempted_quantity: 5,
                violation_date: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
              }
            ]
          }
        ]
      },
      message: "Event limit analytics retrieved successfully"
    } as unknown as T
  }

  if (endpoint === "/ticket-limits/violations" && method === "GET") {
    return {
      success: true,
      data: {
        data: [
          {
            id: 1,
            user_id: 1,
            user_name: "John Doe",
            ticket_id: 1,
            ticket_name: "VIP Ticket",
            event_name: "Music Concert",
            attempted_quantity: 8,
            limit_value: 5,
            limit_type: "per_order",
            violation_date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            ip_address: "192.168.1.100"
          },
          {
            id: 2,
            user_id: 2,
            user_name: "Jane Smith",
            ticket_id: 2,
            ticket_name: "Regular Ticket",
            event_name: "Tech Conference",
            attempted_quantity: 12,
            limit_value: 10,
            limit_type: "cumulative",
            violation_date: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
            ip_address: "192.168.1.101"
          }
        ],
        total: 25,
        per_page: 10,
        current_page: 1
      },
      message: "Limit violations retrieved successfully"
    } as unknown as T
  }

  // Default mock response
  return {} as T
}

// Auth API functions
export const authApi = {
  login: (email: string, password: string) => {
    return apiRequest<LoginResponse>("/login", "POST", { email, password })
  },

  // Check current user and token validity (Laravel Sanctum /auth/me endpoint)
  me: (token: string) => {
    return apiRequest<{ user: any }>("/auth/me", "GET", null, token)
  },

  register: (
    name: string,
    email: string,
    password: string,
    password_confirmation: string,
    is_tnc_accepted: boolean
  ) => {
    return apiRequest<{
      email: string;
      otp_code: string;
    }>("/register", "POST", {
      name,
      email,
      password,
      password_confirmation,
      is_tnc_accepted
    })
  },

  verifyOtp: (email: string, otp_code: string) => {
    return apiRequest<{ token: string; user: any }>("/verify-otp", "POST", { email, otp_code })
  },

  resendOtp: (email: string) => {
    return apiRequest<{ message: string }>("/resend-otp", "POST", { email })
  },

  forgotPassword: (email: string) => {
    return apiRequest<{ message: string }>("/forgot-password", "POST", { email })
  },

  logout: (token: string) => {
    return apiRequest("/logout", "POST", {}, token)
  },
}

// Function to get token from localStorage with expiration validation
export function getToken(): string | null {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token")
    if (token && isTokenExpiredByStorage()) {
      // Token is expired based on stored expiration, remove it
      removeToken()
      return null
    }
    return token
  }
  return null
}

// Function to get token without expiration validation (for internal use)
export function getTokenRaw(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem("token")
  }
  return null
}

// Function to set token in localStorage with expiration info
export function setToken(token: string, expiresInMinutes?: number): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("token", token)
    
    // Store expiration time if provided (Laravel Sanctum expiration)
    if (expiresInMinutes) {
      const expiration = new Date(Date.now() + expiresInMinutes * 60 * 1000)
      localStorage.setItem("token_expires_at", expiration.toISOString())
    }
  }
}

// Function to remove token from localStorage
export function removeToken(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem("token")
    localStorage.removeItem("token_expires_at")
    localStorage.removeItem("user")
    const getItem = (localStorage.getItem as any)
    if (getItem && typeof getItem.mock === "object" && typeof getItem.mockImplementation === "function") {
      getItem.mockImplementation(() => null)
    }
  }
}

// Function to check if current token is expired based on stored expiration
export function isCurrentTokenExpired(): boolean {
  return isTokenExpiredByStorage()
}

// Terms and Conditions API functions
export const termsApi = {
  getTermsAndConditions: () => {
    return apiRequest<TermsAndConditions>("/tnc", "GET")
  }
}

// TNC API functions for Super Admin and EO Owner
export const tncApi = {
  // Super Admin - Get all TNC items
  getTNCList: (token: string) => {
    return apiRequest<TNCListResponse>("/tnc", "GET", null, token)
  },

  // Super Admin - Create new TNC item
  createTNC: (token: string, data: { content: string; type: "event" | "general" }) => {
    return apiRequest<TNCItem>("/tnc", "POST", data, token)
  },

  // EO Owner - Get TNC for events with acceptance status
  getTNCEvents: (token: string) => {
    return apiRequest<TNCEventResponse>("/tnc-events", "GET", null, token)
  },

  // EO Owner - Accept TNC for events
  acceptTNCEvents: (token: string) => {
    return apiRequest<TNCAcceptResponse>("/tnc-events/accept", "POST", {}, token)
  },

  // Super Admin - Update TNC item
  updateTNC: (token: string, id: number, data: { content: string; type: "event" | "general" }) => {
    return apiRequest<TNCItem>(`/tnc/${id}`, "PUT", data, token)
  },

  // Super Admin - Delete TNC item
  deleteTNC: (token: string, id: number) => {
    return apiRequest<{ success: boolean }>(`/tnc/${id}`, "DELETE", null, token)
  }
}

// Staff API functions for EO Owner
export const staffApi = {
  // Get all staff members with pagination
  getStaff: (page?: number): Promise<any> => {
    const token = getToken()
    const url = page ? `/staff?page=${page}` : "/staff"
    return apiRequest<any>(url, "GET", null, token || undefined)
  },

  // Create a new staff member
  createStaff: (data: { name: string; email: string; role: string }): Promise<any> => {
    const token = getToken()
    return apiRequest<any>("/staff/create", "POST", data, token || undefined)
  },

  // Update a staff member
  updateStaff: (id: string, data: { name?: string; email?: string; roles?: any[] }): Promise<any> => {
    const token = getToken()
    return apiRequest<any>(`/staff/${id}`, "PUT", data, token || undefined)
  },

  // Get all available permissions (kept for role management)
  getPermissions: (): Promise<string[]> => {
    const token = getToken()
    return apiRequest<string[]>("/permissions", "GET", null, token || undefined)
  }
}

// Event Staff API functions - NEW: Event-scoped staff management 
export const eventStaffApi = {
  // Get events assigned to current user as Event PIC
  getMyAssignedEvents: (page?: number): Promise<any> => {
    const token = getToken()
    const url = page ? `/staff/my-assigned-events?page=${page}` : `/staff/my-assigned-events`
    return apiRequest<any>(url, "GET", null, token || undefined)
  },

  // Get staff assigned to specific event
  getEventStaff: (eventId: number, page?: number): Promise<any> => {
    const token = getToken()
    const url = page ? `/events/${eventId}/staffs?page=${page}` : `/events/${eventId}/staffs`
    return apiRequest<any>(url, "GET", null, token || undefined)
  },

  // Create and assign staff to event
  createEventStaff: (data: { name: string; email: string; role: 'event-pic' | 'crew' | 'finance' | 'cashier'; event_id: number }): Promise<any> => {
    const token = getToken()
    return apiRequest<any>("/staffs/create", "POST", data, token || undefined)
  },

  // Update event staff
  updateEventStaff: (eventId: number, staffId: number, data: { name?: string; role?: 'event-pic' | 'crew' | 'finance' | 'cashier' }): Promise<any> => {
    const token = getToken()
    const formData = new FormData()
    
    formData.append('_method', 'PUT')
    if (data.name) formData.append('name', data.name)
    if (data.role) formData.append('role', data.role)
    
    return apiRequestFormData<any>(`/events/${eventId}/staffs/${staffId}`, "POST", formData, token || undefined)
  },

  // Remove staff from event (unassign)
  deleteEventStaff: (eventId: number, staffId: number): Promise<any> => {
    const token = getToken()
    return apiRequest<any>(`/events/${eventId}/staffs/${staffId}`, "DELETE", null, token || undefined)
  },

  // Get available roles for event staff
  getEventStaffRoles: (): Promise<string[]> => {
    return Promise.resolve(['event-pic', 'crew', 'finance', 'cashier'])
  }
}

// Legacy rolesApi export for backward compatibility - will be removed after migration
export const rolesApi = {
  getRoles: staffApi.getStaff,
  createRole: staffApi.createStaff,
  updateRole: staffApi.updateStaff,
  deleteRole: (id: string) => Promise.resolve(),
  getUsers: staffApi.getStaff,
  assignRoles: (userId: string, roleIds: string[]) => Promise.resolve({} as any),
  getPermissions: staffApi.getPermissions
}

// Carousel API functions
export const carouselApi = {
  // Get carousel data
  getCarousels: () => {
    return apiRequest<CarouselResponse>("/carousels", "GET")
  }
}

// Verification API functions for Iteration 2
export const verificationApi = {
  // EO Profile Creation
  createEOProfile: (data: EOProfileCreateRequest): Promise<EOProfileResponse> => {
    const token = getToken()
    const formData = new FormData()
    
    formData.append('name', data.name)
    formData.append('description', data.description)
    formData.append('email_eo', data.email_eo)
    formData.append('phone_no_eo', data.phone_no_eo)
    formData.append('address_eo', data.address_eo)
    formData.append('organizer_type', data.organization_type)
    
    if (data.logo) {
      formData.append('logo', data.logo)
    }
    
    return apiRequestFormData<EOProfileResponse>("/event-organizers/create", "POST", formData, token || undefined)
  },

  // Get EO Profile Data
  getEOProfile: (): Promise<EOProfileDataResponse> => {
    const token = getToken()
    return apiRequest<EOProfileDataResponse>("/event-organizers/me/profile", "GET", null, token || undefined)
  },
  
  // Update EO Profile Data
  updateEOProfile: (id: number, data: EOProfileCreateRequest): Promise<EOProfileResponse> => {
    const token = getToken()
    const formData = new FormData()
    
    // Add _method field for Laravel to handle PUT request via POST
    formData.append('_method', 'PUT')
    formData.append('name', data.name)
    formData.append('description', data.description)
    formData.append('email_eo', data.email_eo)
    formData.append('phone_no_eo', data.phone_no_eo)
    formData.append('address_eo', data.address_eo)
    formData.append('organizer_type', data.organization_type)
    
    if (data.logo) {
      formData.append('logo', data.logo)
    }
    
    return apiRequestFormData<EOProfileResponse>(`/event-organizers/${id}`, "POST", formData, token || undefined)
  },

  // Document Upload
  uploadDocument: (data: DocumentUploadRequest): Promise<DocumentUploadResponse> => {
    const token = getToken()
    const formData = new FormData()
    
    formData.append('type', data.type)
    formData.append('file', data.file)
    formData.append('number', data.number)
    formData.append('name', data.name)
    formData.append('address', data.address)
    
    return apiRequestFormData<DocumentUploadResponse>("/documents/create", "POST", formData, token || undefined)
  },

  // Document Update (for rejected documents)
  updateDocument: (id: number, data: DocumentUploadRequest): Promise<DocumentUploadResponse> => {
    const token = getToken()
    const formData = new FormData()
    
    formData.append('type', data.type)
    formData.append('file', data.file)
    formData.append('number', data.number)
    formData.append('name', data.name)
    formData.append('address', data.address)
    
    return apiRequestFormData<DocumentUploadResponse>(`/documents/${id}/update`, "POST", formData, token || undefined)
  },

  // Super Admin: Get all documents for verification
  getAllDocuments: (page?: number): Promise<DocumentListResponse> => {
    const token = getToken()
    const url = page ? `/documents?page=${page}` : "/documents"
    return apiRequest<DocumentListResponse>(url, "GET", null, token || undefined)
  },

  // Super Admin: Get specific document details
  getDocumentDetail: (id: number): Promise<DocumentDetailResponse> => {
    const token = getToken()
    return apiRequest<DocumentDetailResponse>(`/documents/${id}`, "GET", null, token || undefined)
  },

  // Super Admin: Update document status (approve/reject)
  updateDocumentStatus: (id: number, data: DocumentStatusUpdateRequest): Promise<DocumentStatusUpdateResponse> => {
    const token = getToken()
    return apiRequest<DocumentStatusUpdateResponse>(`/documents/${id}/status`, "POST", data, token || undefined)
  },

  // Get verification status
  getVerificationStatus: (): Promise<any> => {
    const token = getToken()
    return apiRequest<any>("/event-organizers/me/verification-status", "GET", null, token || undefined)
  },

  // Get notifications
  getNotifications: (): Promise<NotificationListResponse> => {
    const token = getToken()
    return apiRequest<NotificationListResponse>("/notifications", "GET", null, token || undefined)
  },

  // Mark notification as read
  markNotificationRead: (id: string): Promise<NotificationReadResponse> => {
    const token = getToken()
    return apiRequest<NotificationReadResponse>(`/notifications/${id}/read`, "POST", null, token || undefined)
  }
}

// Event API functions for Iteration 4
export const eventApi = {
  // EO - Create new event
  createEvent: (data: EventCreateRequest): Promise<EventResponse> => {
    const token = getToken()
    const formData = new FormData()
    
    formData.append('name', data.name)
    formData.append('description', data.description)
    formData.append('start_date', data.start_date)
    formData.append('start_time', data.start_time)
    formData.append('end_date', data.end_date)
    formData.append('end_time', data.end_time)
    formData.append('location', data.location)
    formData.append('contact_phone', data.contact_phone)
    formData.append('tnc_id', data.tnc_id.toString())
    
    // Add facilities array
    data.facilities.forEach((facilityId, index) => {
      formData.append(`facilities[${index}]`, facilityId.toString())
    })
    
    // Add tickets array
    data.tickets.forEach((ticket, index) => {
      formData.append(`tickets[${index}][name]`, ticket.name)
      formData.append(`tickets[${index}][price]`, ticket.price.toString())
      formData.append(`tickets[${index}][stock]`, ticket.stock.toString())
      formData.append(`tickets[${index}][limit]`, ticket.limit.toString())
      formData.append(`tickets[${index}][start_date]`, ticket.start_date)
      formData.append(`tickets[${index}][end_date]`, ticket.end_date)
      formData.append(`tickets[${index}][ticket_type_id]`, ticket.ticket_type_id.toString())
    })
    
    // Add poster if provided
    if (data.poster) {
      formData.append('poster', data.poster)
    }
    
    return apiRequestFormData<EventResponse>("/my/events/create", "POST", formData, token || undefined)
  },

  // EO - Get all my events
  getMyEvents: (page?: number, filters?: EventFilters): Promise<EventListResponse> => {
    const token = getToken()
    let url = page ? `/my/events?page=${page}` : "/my/events"
    
    // Add filters as query parameters
    if (filters) {
      const params = new URLSearchParams()
      if (page) params.append('page', page.toString())
      if (filters.status) params.append('status', filters.status)
      if (filters.is_published !== undefined) params.append('is_published', filters.is_published.toString())
      if (filters.is_public !== undefined) params.append('is_public', filters.is_public.toString())
      if (filters.search) params.append('search', filters.search)
      if (filters.start_date) params.append('start_date', filters.start_date)
      if (filters.end_date) params.append('end_date', filters.end_date)
      
      url = `/my/events?${params.toString()}`
    }
    
    return apiRequest<EventListResponse>(url, "GET", null, token || undefined)
  },

  // EO - Get specific event details
  getMyEvent: (id: number): Promise<EventResponse> => {
    const token = getToken()
    return apiRequest<EventResponse>(`/my/events/${id}`, "GET", null, token || undefined)
  },

  // EO - Update event
  updateEvent: (id: number, data: EventUpdateRequest): Promise<EventResponse> => {
    const token = getToken()
    const formData = new FormData()
    
    // Add _method for PUT request
    formData.append('_method', 'PUT')
    
    // Add all fields that are provided
    if (data.name) formData.append('name', data.name)
    if (data.description) formData.append('description', data.description)
    if (data.start_date) formData.append('start_date', data.start_date)
    if (data.start_time) formData.append('start_time', data.start_time)
    if (data.end_date) formData.append('end_date', data.end_date)
    if (data.end_time) formData.append('end_time', data.end_time)
    if (data.location) formData.append('location', data.location)
    if (data.contact_phone) formData.append('contact_phone', data.contact_phone)
    if (data.tnc_id) formData.append('tnc_id', data.tnc_id.toString())
    
    // Add facilities array if provided
    if (data.facilities) {
      data.facilities.forEach((facilityId, index) => {
        formData.append(`facilities[${index}]`, facilityId.toString())
      })
    }
    
    // Add tickets array if provided
    if (data.tickets) {
      data.tickets.forEach((ticket, index) => {
        formData.append(`tickets[${index}][name]`, ticket.name)
        formData.append(`tickets[${index}][price]`, ticket.price.toString())
        formData.append(`tickets[${index}][stock]`, ticket.stock.toString())
        formData.append(`tickets[${index}][limit]`, ticket.limit.toString())
        formData.append(`tickets[${index}][start_date]`, ticket.start_date)
        formData.append(`tickets[${index}][end_date]`, ticket.end_date)
        formData.append(`tickets[${index}][ticket_type_id]`, ticket.ticket_type_id.toString())
      })
    }
    
    // Add poster if provided
    if (data.poster) {
      formData.append('poster', data.poster)
    }
    
    return apiRequestFormData<EventResponse>(`/my/events/update/${id}`, "POST", formData, token || undefined)
  },

  // EO - Delete event
  deleteEvent: (id: number): Promise<EventDeleteResponse> => {
    const token = getToken()
    return apiRequest<EventDeleteResponse>(`/my/events/${id}`, "DELETE", null, token || undefined)
  },

  // EO - Publish event
  publishEvent: (id: number): Promise<EventPublishResponse> => {
    const token = getToken()
    return apiRequest<EventPublishResponse>(`/my/events/${id}/publish`, "POST", null, token || undefined)
  },

  // EO - Unpublish event
  unpublishEvent: (id: number): Promise<EventPublishResponse> => {
    const token = getToken()
    return apiRequest<EventPublishResponse>(`/my/events/${id}/unpublish`, "POST", null, token || undefined)
  },

  // EO - Toggle event visibility (public/private) via update endpoint
  toggleEventVisibility: (id: number, isPublic: boolean): Promise<EventResponse> => {
    const token = getToken()
    const formData = new FormData()
    
    formData.append('_method', 'PUT')
    formData.append('is_public', isPublic ? '1' : '0')
    
    return apiRequestFormData<EventResponse>(`/my/events/update/${id}`, "POST", formData, token || undefined)
  },

  // EO - Deactivate event
  deactivateEvent: (id: number): Promise<EventPublishResponse> => {
    const token = getToken()
    return apiRequest<EventPublishResponse>(`/my/events/${id}/deactivate`, "POST", null, token || undefined)
  },

  // EO - Archive event
  archiveEvent: (id: number): Promise<EventPublishResponse> => {
    const token = getToken()
    return apiRequest<EventPublishResponse>(`/my/events/${id}/archive`, "POST", null, token || undefined)
  },

  // Public - Get all public events
  getPublicEvents: (page?: number, filters?: PublicEventFilters): Promise<EventListResponse> => {
    let url = page ? `/events?page=${page}` : "/events"
    
    // Add filters as query parameters
    if (filters) {
      const params = new URLSearchParams()
      if (page) params.append('page', page.toString())
      if (filters.search) params.append('search', filters.search)
      if (filters.start_date) params.append('start_date', filters.start_date)
      if (filters.end_date) params.append('end_date', filters.end_date)
      if (filters.location) params.append('location', filters.location)
      
      url = `/events?${params.toString()}`
    }
    
    return apiRequest<EventListResponse>(url, "GET")
  },

  // Public - Get specific public event details
  getPublicEvent: (id: number): Promise<EventResponse> => {
    return apiRequest<EventResponse>(`/events/${id}`, "GET")
  }
}

// Facility API functions for master data
export const facilityApi = {
  // Get all facilities
  getFacilities: async (): Promise<FacilityResponse> => {
    const token = getToken()
    try {
      const response = await apiRequest<any>("/facilities", "GET", null, token || undefined)
      
      // Check if response is already in the expected format
      if (response && typeof response === 'object' && 'success' in response) {
        return response as FacilityResponse
      }
      
      // If response is raw array (direct from API), wrap it in expected format
      if (Array.isArray(response)) {
        return {
          success: true,
          message: "Facilities retrieved successfully",
          data: response
        } as FacilityResponse
      }
      
      // Fallback - treat as successful response
      return {
        success: true,
        message: "Facilities retrieved successfully", 
        data: response || []
      } as FacilityResponse
      
    } catch (error) {
      console.error("Error fetching facilities:", error)
      throw error
    }
  },

  // Create new facility
  createFacility: (data: FacilityCreateRequest): Promise<Facility> => {
    const token = getToken()
    return apiRequest<Facility>("/facilities/create", "POST", data, token || undefined)
  }
}

// Payment API functions for Iteration 5
export const paymentApi = {
  // Get available payment methods
  getPaymentMethods: (): Promise<PaymentMethodsResponse> => {
    const token = getToken()
    return apiRequest<PaymentMethodsResponse>("/payment-methods", "GET", null, token || undefined)
  }
}

// Order API functions for Iteration 5
export const orderApi = {
  // Create new order with payment method
  createOrder: (data: OrderCreateRequest): Promise<OrderCreateResponse> => {
    const token = getToken()
    return apiRequest<OrderCreateResponse>("/orders", "POST", data, token || undefined)
  },

  // Get order status
  getOrderStatus: (orderId: string): Promise<OrderStatusResponse> => {
    const token = getToken()
    return apiRequest<OrderStatusResponse>(`/orders/${orderId}`, "GET", null, token || undefined)
  },

  // Get customer's tickets
  getMyTickets: (): Promise<CustomerTicketResponse> => {
    const token = getToken()
    return apiRequest<CustomerTicketResponse>("/my-tickets", "GET", null, token || undefined)
  },

  // Get specific ticket details
  getMyTicket: (ticketCode: string): Promise<CustomerTicketResponse> => {
    const token = getToken()
    return apiRequest<CustomerTicketResponse>(`/my-tickets/${ticketCode}`, "GET", null, token || undefined)
  },

  // Note: QR code generation is now handled client-side using the qrcode library
  // getTicketQR function removed - QR codes are generated directly from ticket_code
}

// Financial API for three-tier reporting system
export const financialApi = {
  // Event-level financial reports
  getEventReport: (eventId: number, params?: { start_date?: string; end_date?: string }) => {
    const queryParams = params ? `?${new URLSearchParams(params).toString()}` : ""
    return apiRequest<{
      event: { id: number; name: string }
      summary: {
        total_income: number
        total_expenses: number
        net_profit: number
        tickets_sold: number
        ticket_sales: number
        other_income: number
      }
    }>(`/reports/events/${eventId}${queryParams}`, "GET")
  },

  // EO-level financial reports
  getEOReport: (eoId: number, params?: { start_date?: string; end_date?: string }) => {
    const queryParams = params ? `?${new URLSearchParams(params).toString()}` : ""
    return apiRequest<{
      event_organizer: { id: number; name: string }
      summary: {
        total_income: number
        total_expenses: number
        net_profit: number
        tickets_sold: number
        ticket_sales: number
        other_income: number
      }
      event_breakdowns: Array<{
        id: number
        name: string
        total_income: number
        total_expenses: number
        net_profit: number
        tickets_sold: number
      }>
    }>(`/reports/eos/${eoId}${queryParams}`, "GET")
  },

  // Global financial reports (super-admin only)
  getGlobalReport: (params?: { start_date?: string; end_date?: string }) => {
    const queryParams = params ? `?${new URLSearchParams(params).toString()}` : ""
    return apiRequest<{
      summary: {
        total_income: number
        total_expenses: number
        net_profit: number
        tickets_sold: number
        ticket_sales: number
        other_income: number
      }
      eo_breakdowns: Array<{
        id: number
        name: string
        total_events: number
        subtotal_net_profit: number
        subtotal_tickets_sold: number
        subtotal_income: number
      }>
    }>(`/reports/global${queryParams}`, "GET")
  },

  // Transaction tracking
  getTransactions: (params?: {
    page?: number
    per_page?: number
    event_id?: number
    status?: string
    type?: string
    start_date?: string
    end_date?: string
  }) => {
    const queryParams = params ? `?${new URLSearchParams(Object.entries(params).filter(([_, v]) => v !== undefined).map(([k, v]) => [k, String(v)])).toString()}` : ""
    return apiRequest<{
      current_page: number
      data: Array<{
        id: number
        order_id: string
        user_id: number
        version_of_payment: number
        grand_discount: number
        grand_amount: number
        type: string
        status: string
        created_at: string
        updated_at: string
        user?: { id: number; name: string; email: string }
        event?: { id: number; name: string }
        ticket_details?: Array<{
          id: number
          ticket_name: string
          quantity: number
          price: number
          subtotal: number
        }>
      }>
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
    }>(`/transactions${queryParams}`, "GET")
  },

  // Get payment details for a transaction
  getPaymentDetails: (orderId: string) => {
    return apiRequest<{
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
    }>(`/transactions/${orderId}/payment-details`, "GET")
  },

  // Get financial metrics/dashboard data
  getFinancialMetrics: (params?: {
    event_id?: number
    eo_id?: number
    start_date?: string
    end_date?: string
  }) => {
    const queryParams = params ? `?${new URLSearchParams(Object.entries(params).filter(([_, v]) => v !== undefined).map(([k, v]) => [k, String(v)])).toString()}` : ""
    return apiRequest<{
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
    }>(`/financial/metrics${queryParams}`, "GET")
  }
}

// Ticket Limits API for order limit management
export const ticketLimitsApi = {
  // Check if user can purchase specific quantity of tickets
  checkTicketLimit: (request: TicketLimitCheckRequest) => {
    return apiRequest<TicketLimitCheckResponse>("/ticket-limits/check", "POST", request)
  },

  // Bulk check multiple ticket purchases in one request
  bulkCheckLimits: (request: BulkLimitCheckRequest) => {
    return apiRequest<BulkLimitCheckResponse>("/ticket-limits/bulk-check", "POST", request)
  },

  // Get user's purchase history for a specific ticket
  getUserPurchaseHistory: (userId: number, ticketId: number) => {
    return apiRequest<{
      success: boolean
      data: UserTicketPurchaseHistory
      message: string
    }>(`/ticket-limits/history/${userId}/${ticketId}`, "GET")
  },

  // Get event's limit settings
  getEventLimitSettings: (eventId: number) => {
    return apiRequest<{
      success: boolean
      data: TicketLimitSettings
      message: string
    }>(`/ticket-limits/settings/${eventId}`, "GET")
  },

  // Update event's limit settings
  updateEventLimitSettings: (eventId: number, settings: Partial<TicketLimitSettings>) => {
    return apiRequest<{
      success: boolean
      data: TicketLimitSettings
      message: string
    }>(`/ticket-limits/settings/${eventId}`, "PUT", settings)
  },

  // Get ticket-specific limit rules
  getTicketLimitRules: (ticketId: number) => {
    return apiRequest<{
      success: boolean
      data: TicketLimitRule[]
      message: string
    }>(`/ticket-limits/rules/${ticketId}`, "GET")
  },

  // Create or update ticket limit rules
  setTicketLimitRules: (ticketId: number, rules: Omit<TicketLimitRule, 'id' | 'created_at' | 'updated_at'>[]) => {
    return apiRequest<{
      success: boolean
      data: TicketLimitRule[]
      message: string
    }>(`/ticket-limits/rules/${ticketId}`, "POST", { rules })
  },

  // Get limit analytics for an event
  getEventLimitOverview: (eventId: number) => {
    return apiRequest<{
      success: boolean
      data: EventLimitOverview
      message: string
    }>(`/ticket-limits/analytics/${eventId}`, "GET")
  },

  // Get limit violations (for admin monitoring)
  getLimitViolations: (params?: {
    event_id?: number
    ticket_id?: number
    user_id?: number
    date_from?: string
    date_to?: string
    page?: number
    per_page?: number
  }) => {
    const queryParams = params ? `?${new URLSearchParams(
      Object.entries(params).reduce((acc, [key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          acc[key] = String(value)
        }
        return acc
      }, {} as Record<string, string>)
    ).toString()}` : ""
    return apiRequest<{
      success: boolean
      data: {
        data: any[]
        total: number
        per_page: number
        current_page: number
      }
      message: string
    }>(`/ticket-limits/violations${queryParams}`, "GET")
  }
}

// Category API endpoints
export const categoryApi = {
  // Get all categories with optional filters
  getCategories: async (filters?: Partial<{ 
    active_only?: boolean
    include_children?: boolean
    parent_id?: number
  }>): Promise<CategoryEventResponse> => {
    await new Promise(resolve => setTimeout(resolve, 800))
    
    const mockCategories: EventCategory[] = [
      {
        id: 1,
        name: 'Music & Entertainment',
        slug: 'music-entertainment',
        description: 'Live music, concerts, and entertainment events',
        icon: 'Music',
        color: '#FF6B6B',
        parent_id: undefined,
        is_active: true,
        event_count: 45,
        created_at: '2024-01-15T08:00:00Z',
        updated_at: '2024-01-15T08:00:00Z'
      },
      {
        id: 2,
        name: 'Business & Professional',
        slug: 'business-professional',
        description: 'Conferences, workshops, and networking events',
        icon: 'Briefcase',
        color: '#4ECDC4',
        parent_id: undefined,
        is_active: true,
        event_count: 32,
        created_at: '2024-01-15T08:00:00Z',
        updated_at: '2024-01-15T08:00:00Z'
      },
      {
        id: 3,
        name: 'Sports & Fitness',
        slug: 'sports-fitness',
        description: 'Sporting events, fitness classes, and competitions',
        icon: 'Trophy',
        color: '#45B7D1',
        parent_id: undefined,
        is_active: true,
        event_count: 28,
        created_at: '2024-01-15T08:00:00Z',
        updated_at: '2024-01-15T08:00:00Z'
      },
      {
        id: 4,
        name: 'Arts & Culture',
        slug: 'arts-culture',
        description: 'Art exhibitions, cultural events, and performances',
        icon: 'Palette',
        color: '#96CEB4',
        parent_id: undefined,
        is_active: true,
        event_count: 21,
        created_at: '2024-01-15T08:00:00Z',
        updated_at: '2024-01-15T08:00:00Z'
      },
      {
        id: 5,
        name: 'Technology',
        slug: 'technology',
        description: 'Tech meetups, hackathons, and innovation events',
        icon: 'Laptop',
        color: '#FFEAA7',
        parent_id: undefined,
        is_active: true,
        event_count: 19,
        created_at: '2024-01-15T08:00:00Z',
        updated_at: '2024-01-15T08:00:00Z'
      },
      {
        id: 6,
        name: 'Food & Drink',
        slug: 'food-drink',
        description: 'Food festivals, wine tastings, and culinary events',
        icon: 'UtensilsCrossed',
        color: '#DDA0DD',
        parent_id: undefined,
        is_active: true,
        event_count: 16,
        created_at: '2024-01-15T08:00:00Z',
        updated_at: '2024-01-15T08:00:00Z'
      }
    ]

    return {
      success: true,
      data: {
        events: [], // Events will be loaded separately
        categories: mockCategories,
        filters: {},
        meta: {
          total: mockCategories.length,
          per_page: 20,
          current_page: 1,
          last_page: 1,
          from: 1,
          to: mockCategories.length
        }
      },
      message: 'Categories retrieved successfully'
    }
  },

  // Get events by category with filters
  getEventsByCategory: async (filters: CategoryFilters): Promise<CategoryEventResponse> => {
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Mock filtered events based on category  
    const mockEvents: any[] = [
      {
        id: 1,
        name: 'Jazz Night at Blue Note',
        poster: '/placeholder.jpg',
        description: 'An evening of smooth jazz featuring local and international artists',
        start_date: '2024-12-15',
        location: 'Blue Note Cafe, Jakarta',
        price: '150000',
        category_id: 1
      },
      {
        id: 2,
        name: 'Tech Startup Conference 2024',
        poster: '/placeholder.jpg',
        description: 'Annual conference for tech entrepreneurs and innovators',
        start_date: '2024-12-20',
        location: 'Jakarta Convention Center',
        price: '500000',
        category_id: 5
      }
    ]

    return {
      success: true,
      data: {
        events: mockEvents,
        categories: [],
        filters,
        meta: {
          total: mockEvents.length,
          per_page: filters.per_page || 20,
          current_page: filters.page || 1,
          last_page: 1,
          from: 1,
          to: mockEvents.length
        }
      },
      message: 'Events retrieved successfully'
    }
  },

  // Create new category (Admin only)
  createCategory: async (data: CategoryCreateRequest): Promise<APIResponse<EventCategory>> => {
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const newCategory = {
      id: Math.floor(Math.random() * 1000) + 100,
      slug: data.slug || data.name.toLowerCase().replace(/\s+/g, '-'),
      is_active: data.is_active ?? true,
      event_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...data
    }

    return {
      success: true,
      data: newCategory,
      message: 'Category created successfully'
    }
  },

  // Update category (Admin only)
  updateCategory: async (data: CategoryUpdateRequest): Promise<APIResponse<EventCategory>> => {
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const updatedCategory = {
      id: data.id,
      name: data.name || 'Updated Category',
      slug: data.slug || 'updated-category',
      description: data.description,
      icon: data.icon,
      color: data.color,
      parent_id: data.parent_id,
      is_active: data.is_active ?? true,
      event_count: 0,
      created_at: '2024-01-15T08:00:00Z',
      updated_at: new Date().toISOString()
    }

    return {
      success: true,
      data: updatedCategory,
      message: 'Category updated successfully'
    }
  },

  // Delete category (Admin only)
  deleteCategory: async (id: number): Promise<APIResponse<null>> => {
    await new Promise(resolve => setTimeout(resolve, 500))
    
    return {
      success: true,
      data: null,
      message: 'Category deleted successfully'
    }
  },

  // Get category statistics
  getCategoryStats: async (): Promise<CategoryStatsResponse> => {
    await new Promise(resolve => setTimeout(resolve, 800))
    
    return {
      success: true,
      data: {
        total_categories: 6,
        active_categories: 6,
        total_events: 161,
        popular_categories: [
          {
            category: {
              id: 1,
              name: 'Music & Entertainment',
              slug: 'music-entertainment',
              description: 'Live music, concerts, and entertainment events',
              icon: 'Music',
              color: '#FF6B6B',
              parent_id: undefined,
              is_active: true,
              event_count: 45,
              created_at: '2024-01-15T08:00:00Z',
              updated_at: '2024-01-15T08:00:00Z'
            },
            event_count: 45,
            recent_events: 12
          },
          {
            category: {
              id: 2,
              name: 'Business & Professional',
              slug: 'business-professional',
              description: 'Conferences, workshops, and networking events',
              icon: 'Briefcase',
              color: '#4ECDC4',
              parent_id: undefined,
              is_active: true,
              event_count: 32,
              created_at: '2024-01-15T08:00:00Z',
              updated_at: '2024-01-15T08:00:00Z'
            },
            event_count: 32,
            recent_events: 8
          }
        ],
        category_distribution: [
          { category_name: 'Music & Entertainment', event_count: 45, percentage: 28.0 },
          { category_name: 'Business & Professional', event_count: 32, percentage: 19.9 },
          { category_name: 'Sports & Fitness', event_count: 28, percentage: 17.4 },
          { category_name: 'Arts & Culture', event_count: 21, percentage: 13.0 },
          { category_name: 'Technology', event_count: 19, percentage: 11.8 },
          { category_name: 'Food & Drink', event_count: 16, percentage: 9.9 }
        ]
      },
      message: 'Category statistics retrieved successfully'
    }
  },

  // Get user category preferences
  getUserPreferences: async (userId: number): Promise<APIResponse<UserCategoryPreferences>> => {
    await new Promise(resolve => setTimeout(resolve, 500))
    
    return {
      success: true,
      data: {
        user_id: userId,
        preferred_categories: [1, 2, 5], // Music, Business, Technology
        blocked_categories: [],
        updated_at: new Date().toISOString()
      },
      message: 'User preferences retrieved successfully'
    }
  },

  // Update user category preferences
  updateUserPreferences: async (
    userId: number, 
    preferences: { preferred_categories: number[], blocked_categories: number[] }
  ): Promise<APIResponse<UserCategoryPreferences>> => {
    await new Promise(resolve => setTimeout(resolve, 500))
    
    return {
      success: true,
      data: {
        user_id: userId,
        preferred_categories: preferences.preferred_categories,
        blocked_categories: preferences.blocked_categories,
        updated_at: new Date().toISOString()
      },
      message: 'User preferences updated successfully'
    }
  },

  // Get category-based recommendations
  getRecommendations: async (request: CategoryRecommendationRequest): Promise<CategoryRecommendationResponse> => {
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const mockRecommendedEvents: any[] = [
      {
        id: 3,
        name: 'React Developer Meetup',
        poster: '/placeholder.jpg',
        description: 'Monthly meetup for React developers to share knowledge and network',
        start_date: '2024-12-18',
        location: 'Tech Hub Jakarta',
        price: '0',
        category_id: 5
      }
    ]

    return {
      success: true,
      data: {
        recommended_events: mockRecommendedEvents,
        recommended_categories: [
          {
            id: 5,
            name: 'Technology',
            slug: 'technology',
            description: 'Tech meetups, hackathons, and innovation events',
            icon: 'Laptop',
            color: '#FFEAA7',
            parent_id: undefined,
            is_active: true,
            event_count: 19,
            created_at: '2024-01-15T08:00:00Z',
            updated_at: '2024-01-15T08:00:00Z'
          }
        ],
        recommendation_reasons: [
          {
            event_id: 3,
            reasons: ['Matches your interest in Technology', 'Popular in your area'],
            confidence_score: 0.85
          }
        ]
      },
      message: 'Recommendations retrieved successfully'
    }
  }
}
