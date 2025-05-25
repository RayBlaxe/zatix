import { APIResponse } from "@/types/api"
import { LoginResponse } from "@/types/auth/login"
import { RegisterResponse } from "@/types/auth/register"

// Base API URL - use environment variable or fallback for development
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://192.168.1.69:8000/api/"

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
    if (process.env.NODE_ENV !== "production") {
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
    return {
      token: "mock_token_12345",
      user: {
        id: "user_123",
        name: data?.email?.split("@")[0] || "Demo User",
        email: data?.email || "user@example.com",
        role: "customer",
      },
    } as unknown as T
  }

  // Register mock response
  if (endpoint === "/register" && method === "POST") {
    return {
      message: "Registration successful. Please verify your email.",
    } as unknown as T
  }

  // Verify OTP mock response
  if (endpoint === "/verify-otp" && method === "POST") {
    return {
      token: "mock_token_12345",
      user: {
        id: "user_123",
        name: data?.email?.split("@")[0] || "Demo User",
        email: data?.email || "user@example.com",
        role: "customer",
      },
    } as unknown as T
  }

  // Resend OTP mock response
  if (endpoint === "/resend-otp" && method === "POST") {
    return {
      message: "OTP resent successfully.",
    } as unknown as T
  }

  // Forgot password mock response
  if (endpoint === "/forgot-password" && method === "POST") {
    return {
      message: "Password reset instructions sent to your email.",
    } as unknown as T
  }

  // Logout mock response
  if (endpoint === "/logout" && method === "POST") {
    return {
      message: "Logged out successfully.",
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
