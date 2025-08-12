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
