"use client";

import type React from "react";

import { createContext, useContext, useEffect, useState } from "react";
import { authApi, getToken, removeToken, setToken } from "@/lib/api";
import { RegisterResponse } from "@/types/auth/register";

export type UserRole = "customer" | "event_organizer";

type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  eoDetails?: {
    name: string;
    logo?: string;
    description: string;
    email: string;
    phone: string;
    address: string;
  };
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    name: string,
    email: string,
    password: string,
    password_confirmation: string,
    is_tnc_accepted: boolean
  ) => Promise<void>;
  verifyOtp: (email: string, otp_code: string) => Promise<void>;
  resendOtp: (email: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  updateUserRole: (role: UserRole) => void;
  updateEODetails: (eoDetails: User["eoDetails"]) => void;
  pendingVerificationEmail: string | null;
  setPendingVerificationEmail: (email: string | null) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState<
    string | null
  >(null);

  useEffect(() => {
    // Check if user is logged in from localStorage
    try {
      const token = getToken();
      const storedUser = localStorage.getItem("user");

      if (token && storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to parse stored user:", error);
      // Clear potentially corrupted data
      localStorage.removeItem("user");
      removeToken();
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await authApi.login(email, password);
      // Debug: log the response
      console.log("Login API response:", response);

      if (!response || response.success === false) {
        throw new Error(response?.message ?? "Login failed");
      }

      const { data } = response;

      if (!data || !data.access_token || !data.user) {
        // Always show backend message if available
        throw new Error(response?.message ?? "Invalid response from server. Please try again.");
      }

      setToken(data.access_token);

      const newUser = {
        id: data.user.id.toString(),
        name: data.user.name,
        email: data.user.email,
        role: "customer" as UserRole,
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
      // The response structure is { success, message, data: { token, user } }
      const response = await authApi.verifyOtp(email, otp_code);
      const { token, user } = response.data;

      // Save token
      setToken(token);
      // Create user object from response
      const newUser = {
        id: user.id || Math.random().toString(36).substring(2, 9),
        name: user.name,
        email: user.email,
        role: (user.role as UserRole) || "customer",
        eoDetails: user.eoDetails,
      };

      setUser(newUser);
      localStorage.setItem("user", JSON.stringify(newUser));

      // Clear pending verification
      setPendingVerificationEmail(null);
    } finally {
      setIsLoading(false);
    }
  };

  const resendOtp = async (email: string) => {
    setIsLoading(true);
    try {
      await authApi.resendOtp(email);
    } finally {
      setIsLoading(false);
    }
  };

  const forgotPassword = async (email: string) => {
    setIsLoading(true);
    try {
      await authApi.forgotPassword(email);

      // Set pending verification email for password reset flow
      setPendingVerificationEmail(email);
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserRole = (role: UserRole) => {
    if (user) {
      const updatedUser = { ...user, role };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
    }
  };

  const updateEODetails = (eoDetails: User["eoDetails"]) => {
    if (user) {
      const updatedUser = {
        ...user,
        eoDetails,
        role: "event_organizer" as UserRole,
      };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
    }
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
        isAuthenticated: !!user,
        updateUserRole,
        updateEODetails,
        pendingVerificationEmail,
        setPendingVerificationEmail,
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
