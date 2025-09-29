"use client";

import type React from "react";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { authApi, validateTokenWithAPI } from "@/lib/api";
import { RegisterResponse } from "@/types/auth/register";
import { AuthUser, UserRole, AuthContextType } from "@/types/auth";

function getTokenExpiration(): Date | null {
  if (typeof window !== "undefined") {
    const expirationStr = localStorage.getItem("token_expires_at");
    if (expirationStr) {
      return new Date(expirationStr);
    }
  }
  return null;
}

function isTokenExpired(): boolean {
  const expiration = getTokenExpiration();
  if (!expiration) return false;
  return new Date() >= expiration;
}

function getStoredToken(): string | null {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token && isTokenExpired()) {
      removeStoredToken();
      return null;
    }
    return token;
  }
  return null;
}

function getRawToken(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem("token");
  }
  return null;
}

function storeToken(token: string, expiresInMinutes?: number): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("token", token);
    if (expiresInMinutes) {
      const expiration = new Date(Date.now() + expiresInMinutes * 60 * 1000);
      localStorage.setItem("token_expires_at", expiration.toISOString());
    }
  }
}

function removeStoredToken(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem("token");
    localStorage.removeItem("token_expires_at");
  }
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingVerificationEmail, setPendingVerificationEmailState] = useState<string | null>(null);
  const [tokenExpiration, setTokenExpiration] = useState<Date | null>(null);

  // Helper function to set pending verification email and persist it
  const setPendingVerificationEmail = (email: string | null) => {
    setPendingVerificationEmailState(email);
    if (typeof window !== "undefined") {
      if (email) {
        localStorage.setItem("pendingVerificationEmail", email);
      } else {
        localStorage.removeItem("pendingVerificationEmail");
      }
    }
  };

  // Logout function (defined early to avoid circular dependency)
  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = getRawToken();
      if (token) {
        await authApi.logout(token);
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Clear user state and tokens regardless of API call success
      setUser(null);
      setTokenExpiration(null);
      removeStoredToken();
      localStorage.removeItem("user");
      setPendingVerificationEmail(null); // Clear pending verification email
      setIsLoading(false);
    }
  }, []);

  // Check token expiration and logout if expired
  const checkTokenExpiration = useCallback(() => {
    if (isTokenExpired()) {
      console.warn("Token expired, logging out user");
      logout();
      return true;
    }
    return false;
  }, [logout]);

  // Initialize user from localStorage on app start
  useEffect(() => {
    const initializeAuth = () => {
      const token = getStoredToken();
      const savedUser = localStorage.getItem("user");
      const savedPendingEmail = localStorage.getItem("pendingVerificationEmail");
      
      // Initialize pending verification email from localStorage
      if (savedPendingEmail) {
        setPendingVerificationEmailState(savedPendingEmail);
      }
      
      if (token && savedUser) {
        try {
          const parsedUser = JSON.parse(savedUser);
          // Ensure roles array exists with fallback
          if (!parsedUser.roles || !Array.isArray(parsedUser.roles)) {
            parsedUser.roles = ["customer"];
          }
          if (!parsedUser.currentRole) {
            parsedUser.currentRole = "customer";
          }
          setUser(parsedUser);
          
          // Set token expiration info
          const expiration = getTokenExpiration();
          setTokenExpiration(expiration);
          
        } catch (error) {
          console.error("Failed to parse saved user:", error);
          removeStoredToken();
          localStorage.removeItem("user");
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  // Set up periodic token validation with API (Laravel Sanctum)
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(async () => {
      const token = getRawToken();
      if (token) {
        try {
          const validation = await validateTokenWithAPI(token);
          if (!validation.valid) {
            console.warn("Token validation failed, logging out user");
            logout();
          }
        } catch (error) {
          console.error("Token validation error:", error);
          // Fall back to stored expiration check
          checkTokenExpiration();
        }
      }
    }, 5 * 60 * 1000); // Check every 5 minutes (less frequent for API calls)

    return () => clearInterval(interval);
  }, [user, checkTokenExpiration, logout]);

  // Set up session timeout warning (5 minutes before expiration)
  useEffect(() => {
    if (!user || !tokenExpiration) return;

    const timeRemaining = tokenExpiration.getTime() - new Date().getTime();
    const warningTime = Math.max(0, timeRemaining - (5 * 60 * 1000)); // 5 minutes before expiration

    if (warningTime > 0) {
      const timeout = setTimeout(() => {
        // Dispatch warning event
        window.dispatchEvent(new CustomEvent("tokenExpirationWarning", {
          detail: { expiresAt: tokenExpiration }
        }));
      }, warningTime);

      return () => clearTimeout(timeout);
    }
  }, [user, tokenExpiration]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await authApi.login(email, password);
      console.log("Login API response:", response);

      if (!response || response.success === false) {
        throw new Error(response?.message ?? "Login failed");
      }

      const { data } = response;

      if (!data || !data.access_token || !data.user) {
        throw new Error(response?.message ?? "Invalid response from server. Please try again.");
      }

      // Store token with expiration info from Laravel Sanctum response
      storeToken(data.access_token, data.expires_in);

      // Map roles from string array to UserRole array
      const userRoles = (data.user.roles as string[]).filter(role => 
        ["customer", "eo-owner", "super-admin", "event-pic", "crew", "finance", "cashier"].includes(role)
      ) as UserRole[];

      // Default to primary role if available, otherwise customer
      const defaultRole: UserRole = userRoles.includes("event-pic") 
        ? "event-pic"
        : userRoles.includes("eo-owner")
        ? "eo-owner"
        : userRoles.includes("super-admin")
        ? "super-admin"
        : userRoles.includes("crew")
        ? "crew"
        : userRoles.includes("finance")
        ? "finance"
        : userRoles.includes("cashier")
        ? "cashier"
        : "customer";

      const newUser: AuthUser = {
        id: data.user.id.toString(),
        name: data.user.name,
        email: data.user.email,
        roles: userRoles.length > 0 ? userRoles : ["customer"],
        currentRole: defaultRole,
        email_verified_at: data.user.email_verified_at,
        created_at: data.user.created_at,
        updated_at: data.user.updated_at,
        eoDetails: undefined,
      };

      setUser(newUser);
      localStorage.setItem("user", JSON.stringify(newUser));
      
      // Set token expiration info
      const expiration = getTokenExpiration();
      setTokenExpiration(expiration);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  const register = async (
    name: string,
    email: string,
    password: string,
    password_confirmation: string,
    is_tnc_accepted: boolean
  ) => {

    setIsLoading(true);
    try {
      const response: RegisterResponse = await authApi.register(
        name,
        email,
        password,
        password_confirmation,
        is_tnc_accepted
      );

      if (response.success === false) {
        throw new Error(response.message ?? "Registration failed");
      }

      // Store the email for OTP verification
      setPendingVerificationEmail(response.data.email);
      // Optionally, handle OTP code if you want to show it (for dev)
      // const otpCode = response.data.otp_code;

    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
   
  };

  const verifyOtp = async (email: string, otp_code: string) => {
    setIsLoading(true);
    try {
      const response = await authApi.verifyOtp(email, otp_code);
      const { token, user } = response.data;

      storeToken(token);

      // Map roles from string array to UserRole array
      const userRoles = (user.roles as string[]).filter(role => 
        ["customer", "eo-owner", "super-admin", "event-pic", "crew", "finance", "cashier"].includes(role)
      ) as UserRole[];

      // Default to primary role if available, otherwise customer
      const defaultRole: UserRole = userRoles.includes("event-pic") 
        ? "event-pic"
        : userRoles.includes("eo-owner")
        ? "eo-owner"
        : userRoles.includes("super-admin")
        ? "super-admin"
        : userRoles.includes("crew")
        ? "crew"
        : userRoles.includes("finance")
        ? "finance"
        : userRoles.includes("cashier")
        ? "cashier"
        : "customer";

      const newUser: AuthUser = {
        id: user.id?.toString() || Math.random().toString(36).substring(2, 9),
        name: user.name,
        email: user.email,
        roles: userRoles.length > 0 ? userRoles : ["customer"],
        currentRole: defaultRole,
        email_verified_at: user.email_verified_at,
        created_at: user.created_at,
        updated_at: user.updated_at,
        eoDetails: user.eoDetails,
      };

      setUser(newUser);
      localStorage.setItem("user", JSON.stringify(newUser));
      
      // Set token expiration info
      const expiration = getTokenExpiration();
      setTokenExpiration(expiration);

      // Clear pending verification email after successful verification
      setPendingVerificationEmail(null);
    } finally {
      setIsLoading(false);
    }
  };

  const resendOtp = async (email: string) => {
    // Bypass OTP resend
    return;
  };

  const forgotPassword = async (email: string) => {
    // Bypass forgot password
    setPendingVerificationEmail(email);
  };

  const switchRole = (role: UserRole) => {
    if (user && user.roles.includes(role)) {
      const updatedUser = { ...user, currentRole: role };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
    }
  };

  const updateEODetails = (eoDetails: AuthUser["eoDetails"]) => {
    if (user) {
      const updatedUser = {
        ...user,
        eoDetails,
      };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
    }
  };

  const hasRole = (role: UserRole): boolean => {
    return user?.roles?.includes(role) ?? false;
  };

  const canAccessDashboard = (): boolean => {
    if (!user || !user.roles) return false;
    return hasRole("eo-owner") || hasRole("super-admin");
  };


  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        verifyOtp,
        resendOtp,
        forgotPassword,
        logout,
        isAuthenticated: !!user,
        switchRole,
        updateEODetails,
        pendingVerificationEmail,
        setPendingVerificationEmail,
        hasRole,
        canAccessDashboard,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
