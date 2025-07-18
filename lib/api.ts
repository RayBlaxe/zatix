import { APIResponse } from "@/types/api"
import { LoginResponse } from "@/types/auth/login"
import { RegisterResponse } from "@/types/auth/register"
import { TermsAndConditions, TNCListResponse, TNCEventResponse, TNCAcceptResponse, TNCItem } from "@/types/terms"
import { Role, UserRole } from "@/app/dashboard/roles/types"
import { CarouselResponse } from "@/types/carousel"

// Base API URL - use environment variable or fallback for development
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.zatix.id/api"

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

// Helper function for making API requests
async function apiRequest<T>(endpoint: string, method = "GET", data?: any, token?: string): Promise<any> {
  const url = `${API_BASE_URL}${endpoint}`

  // Check stored token expiration before making request
  if (token && isTokenExpiredByStorage()) {
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
      return handleMockResponse<T>(endpoint, method, data)
    }
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
