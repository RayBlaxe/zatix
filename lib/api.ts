import { APIResponse } from "@/types/api"
import { LoginResponse } from "@/types/auth/login"
import { RegisterResponse } from "@/types/auth/register"
import { TermsAndConditions } from "@/types/terms"

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

  // Terms and conditions mock response
  if (endpoint === "/tnc" && method === "GET") {
    return {
      success: true,
      message: "Terms and conditions retrieved successfully",
      data: {
        id: "tnc_1",
        title: "Event Organizer Terms and Conditions",
        content: `<h3>1. Introduction</h3>
<p>Welcome to ZaTix. These Terms and Conditions govern your use of our platform and services as an Event Organizer. By accessing or using our services, you agree to be bound by these Terms.</p>

<h3>2. Event Creation Process</h3>
<p>Our platform requires event organizers to go through a verification process before gaining full access to create events. This process includes:</p>
<ul>
<li>Submitting basic information about your organization and event</li>
<li>Scheduling a pitching session with our team</li>
<li>Demonstrating your event concept during the pitching session</li>
<li>Receiving a demo account to test our platform</li>
<li>Upon satisfaction and approval, receiving full access to our platform</li>
</ul>

<h3>3. Account Usage</h3>
<p>You are responsible for maintaining the confidentiality of your account information and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account.</p>

<h3>4. Content Guidelines</h3>
<p>All events created on our platform must comply with our content guidelines. Events that promote illegal activities, hate speech, or violate any applicable laws are strictly prohibited.</p>

<h3>5. Fees and Payments</h3>
<p>Depending on your subscription plan, fees may apply for using our platform. All fees are non-refundable unless otherwise specified in our refund policy.</p>

<h3>6. Free Account Limitations</h3>
<p>Free accounts are limited to creating 1 event with a maximum of 10 participants. To create more events or increase participant limits, you will need to upgrade to a paid plan.</p>

<h3>7. Termination</h3>
<p>We reserve the right to terminate or suspend your account at any time for violations of these Terms or for any other reason at our sole discretion.</p>

<h3>8. Limitation of Liability</h3>
<p>To the maximum extent permitted by law, we shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues.</p>

<h3>9. Changes to Terms</h3>
<p>We may modify these Terms at any time. Your continued use of our platform after such changes constitutes your acceptance of the new Terms.</p>

<h3>10. Contact Information</h3>
<p>If you have any questions about these Terms, please contact us at support@zatix.com.</p>`,
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z"
      }
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
