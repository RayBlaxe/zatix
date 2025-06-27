"use client";

import type React from "react";

import { createContext, useContext, useEffect, useState } from "react";
import { authApi, getToken, removeToken, setToken } from "@/lib/api";
import { RegisterResponse } from "@/types/auth/register";
import { AuthUser, UserRole, AuthContextType } from "@/types/auth";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState<string | null>(null);

  // Initialize user from localStorage on app start
  useEffect(() => {
    const initializeAuth = () => {
      const token = getToken();
      const savedUser = localStorage.getItem("user");
      
      if (token && savedUser) {
        try {
          const parsedUser = JSON.parse(savedUser);
          setUser(parsedUser);
        } catch (error) {
          console.error("Failed to parse saved user:", error);
          removeToken();
          localStorage.removeItem("user");
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

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

      setToken(data.access_token);

      // Map roles from string array to UserRole array
      const userRoles = (data.user.roles as string[]).filter(role => 
        ["customer", "eo-owner", "superadmin"].includes(role)
      ) as UserRole[];

      // Default to customer if user has customer role, otherwise pick first available role
      const defaultRole: UserRole = userRoles.includes("customer") 
        ? "customer" 
        : userRoles.length > 0 
          ? userRoles[0] 
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
    // display console log for the sent value
   
  };

  const verifyOtp = async (email: string, otp_code: string) => {
    setIsLoading(true);
    try {
      const response = await authApi.verifyOtp(email, otp_code);
      const { token, user } = response.data;

      setToken(token);

      // Map roles from string array to UserRole array
      const userRoles = (user.roles as string[]).filter(role => 
        ["customer", "eo-owner", "superadmin"].includes(role)
      ) as UserRole[];

      // Default to customer role
      const defaultRole: UserRole = "customer";

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
    return user?.roles.includes(role) ?? false;
  };

  const canAccessDashboard = (): boolean => {
    return hasRole("eo-owner") || hasRole("superadmin");
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      const token = getToken();
      if (token) {
        await authApi.logout(token);
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Clear user state and tokens regardless of API call success
      setUser(null);
      removeToken();
      localStorage.removeItem("user");
      setIsLoading(false);
    }
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
        isAuthenticated: !!user && !!getToken(),
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
