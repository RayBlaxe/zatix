import { APIResponse } from "@/types/api"
import { LoginResponse } from "@/types/auth/login"
import { RegisterResponse } from "@/types/auth/register"
import { TermsAndConditions, TNCListResponse, TNCEventResponse, TNCAcceptResponse } from "@/types/terms"
import { Role, UserRole } from "@/app/dashboard/roles/types"

// Base API URL - use environment variable or fallback for development
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.zatix.id/api"

// Helper function for making API requests
async function apiRequest<T>(endpoint: string, method = "GET", data?: any, token?: string): Promise<any> {
  const url = `${API_BASE_URL}${endpoint}`


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
      { email: "superadmin@zatix.com", password: "admin123", roles: ["superadmin", "eo-owner", "customer"] },
      { email: "eoowner@zatix.com", password: "eoowner123", roles: ["eo-owner", "customer"] },
      { email: "customer@zatix.com", password: "customer123", roles: ["customer"] },
      { email: "test@test.com", password: "test123", roles: ["customer"] }
    ]
    
    const credential = validCredentials.find(
      cred => cred.email === data?.email && cred.password === data?.password
    )
    
    if (credential) {
      return {
        success: true,
        message: "Login successfully",
        data: {
          access_token: `1|${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`,
          token_type: "Bearer",
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

  // Roles API mock responses
  if (endpoint === "/roles" && method === "GET") {
    return [
      {
        id: "1",
        name: "Event Manager",
        permissions: ["create_events", "edit_events", "view_analytics", "manage_tickets"],
        usersCount: 5,
        createdAt: "2024-01-15T10:30:00Z"
      },
      {
        id: "2", 
        name: "Marketing Coordinator",
        permissions: ["view_events", "manage_content", "view_analytics"],
        usersCount: 3,
        createdAt: "2024-01-20T14:20:00Z"
      },
      {
        id: "3",
        name: "Finance Manager", 
        permissions: ["view_finance", "export_reports", "manage_payments"],
        usersCount: 2,
        createdAt: "2024-01-25T09:15:00Z"
      }
    ] as unknown as T
  }

  if (endpoint === "/roles" && method === "POST") {
    return {
      id: `role_${Date.now()}`,
      name: data?.name || "New Role",
      permissions: data?.permissions || [],
      usersCount: 0,
      createdAt: new Date().toISOString()
    } as unknown as T
  }

  if (endpoint.startsWith("/roles/") && method === "PUT") {
    const roleId = endpoint.split("/")[2]
    return {
      id: roleId,
      name: data?.name || "Updated Role",
      permissions: data?.permissions || [],
      usersCount: 1,
      createdAt: "2024-01-15T10:30:00Z"
    } as unknown as T
  }

  if (endpoint.startsWith("/roles/") && method === "DELETE") {
    return { success: true } as unknown as T
  }

  if (endpoint === "/users/roles" && method === "GET") {
    return [
      {
        id: "user1",
        name: "John Doe",
        email: "john@zatix.com",
        roles: ["Event Manager", "Marketing Coordinator"],
        assignedAt: "2024-01-15T10:30:00Z"
      },
      {
        id: "user2",
        name: "Jane Smith", 
        email: "jane@zatix.com",
        roles: ["Finance Manager"],
        assignedAt: "2024-01-20T14:20:00Z"
      },
      {
        id: "user3",
        name: "Mike Johnson",
        email: "mike@zatix.com", 
        roles: ["Marketing Coordinator"],
        assignedAt: "2024-01-25T09:15:00Z"
      }
    ] as unknown as T
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

  // Default mock response
  return {} as T
}

// Auth API functions
export const authApi = {
  login: (email: string, password: string) => {
    return apiRequest<LoginResponse>("/login", "POST", { email, password })
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

// Function to get token from localStorage
export function getToken(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem("token")
  }
  return null
}

// Function to set token in localStorage
export function setToken(token: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("token", token)
  }
}

// Function to remove token from localStorage
export function removeToken(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem("token")
  }
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

  // EO Owner - Get TNC for events with acceptance status
  getTNCEvents: (token: string) => {
    return apiRequest<TNCEventResponse>("/tnc-events", "GET", null, token)
  },

  // EO Owner - Accept TNC for events
  acceptTNCEvents: (token: string) => {
    return apiRequest<TNCAcceptResponse>("/tnc-events/accept", "POST", {}, token)
  }
}

// Roles API functions for EO Owner
export const rolesApi = {
  // Get all roles
  getRoles: (): Promise<Role[]> => {
    const token = getToken()
    return apiRequest<Role[]>("/roles", "GET", null, token)
  },

  // Create a new role
  createRole: (data: { name: string; permissions: string[] }): Promise<Role> => {
    const token = getToken()
    return apiRequest<Role>("/roles", "POST", data, token)
  },

  // Update a role
  updateRole: (id: string, data: { name: string; permissions: string[] }): Promise<Role> => {
    const token = getToken()
    return apiRequest<Role>(`/roles/${id}`, "PUT", data, token)
  },

  // Delete a role
  deleteRole: (id: string): Promise<void> => {
    const token = getToken()
    return apiRequest<void>(`/roles/${id}`, "DELETE", null, token)
  },

  // Get all users with their roles
  getUsers: (): Promise<UserRole[]> => {
    const token = getToken()
    return apiRequest<UserRole[]>("/users/roles", "GET", null, token)
  },

  // Assign roles to a user
  assignRoles: (userId: string, roleIds: string[]): Promise<UserRole> => {
    const token = getToken()
    return apiRequest<UserRole>(`/users/${userId}/roles`, "POST", { roleIds }, token)
  },

  // Get all available permissions
  getPermissions: (): Promise<string[]> => {
    const token = getToken()
    return apiRequest<string[]>("/permissions", "GET", null, token)
  }
}
