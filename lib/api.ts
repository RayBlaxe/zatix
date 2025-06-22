import { APIResponse } from "@/types/api"
import { LoginResponse } from "@/types/auth/login"
import { RegisterResponse } from "@/types/auth/register"
import { TermsAndConditions, TNCListResponse, TNCEventResponse, TNCAcceptResponse } from "@/types/terms"

// Base API URL - use environment variable or fallback for development
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://zatix.zamanweb.com/api/"

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
    // For demo/development purposes, simulate successful responses
    // This helps when the actual API is not available
    if (process.env.NODE_ENV !== "production" && process.env.NEXT_PUBLIC_USE_MOCKS !== "false") {
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
      { email: "admin@zatix.com", password: "admin123", role: "admin" },
      { email: "organizer@zatix.com", password: "organizer123", role: "organizer" },
      { email: "user@zatix.com", password: "user123", role: "customer" },
      { email: "test@test.com", password: "test123", role: "customer" }
    ]
    
    const credential = validCredentials.find(
      cred => cred.email === data?.email && cred.password === data?.password
    )
    
    if (credential) {
      return {
        success: true,
        message: "Login successful",
        data: {
          access_token: "mock_token_12345",
          user: {
            id: "user_123",
            name: credential.email.split("@")[0],
            email: credential.email,
            role: credential.role,
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
        token: "mock_token_12345",
        user: {
          id: "user_123",
          name: data?.email?.split("@")[0] || "Demo User",
          email: data?.email || "user@example.com",
          role: "customer",
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
