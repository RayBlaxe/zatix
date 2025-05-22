"use client";

import type React from "react";

import { createContext, useContext, useEffect, useState } from "react";
import { authApi, getToken, removeToken, setToken } from "@/lib/api";

export type UserRole = "customer" | "event_organizer" | "admin";

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
    password_confirmation: string
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

// Mock admin user
const mockAdminUser: User = {
  id: "1",
  name: "Admin User",
  email: "admin@example.com",
  role: "admin",
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(mockAdminUser);
  const [isLoading, setIsLoading] = useState(false);
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState<string | null>(null);

  const login = async (email: string, password: string) => {
    // Bypass login - always succeed
    setUser(mockAdminUser);
  };
  
  const register = async (
    name: string,
    email: string,
    password: string,
    password_confirmation: string
  ) => {
    // Bypass registration - always succeed
    setUser(mockAdminUser);
  };

  const verifyOtp = async (email: string, otp_code: string) => {
    // Bypass OTP verification - always succeed
    setUser(mockAdminUser);
    setPendingVerificationEmail(null);
  };

  const resendOtp = async (email: string) => {
    // Bypass OTP resend
    return;
  };

  const forgotPassword = async (email: string) => {
    // Bypass forgot password
    setPendingVerificationEmail(email);
  };

  const updateUserRole = (role: UserRole) => {
    if (user) {
      const updatedUser = { ...user, role };
      setUser(updatedUser);
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
    }
  };

  const logout = async () => {
    // Bypass logout - keep user logged in
    return;
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
        isAuthenticated: true, // Always authenticated
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
