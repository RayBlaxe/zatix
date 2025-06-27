"use client"

import type React from "react"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { Loader2 } from "lucide-react"
import { UserRole } from "@/types/auth"

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRoles?: UserRole[]
  requireAllRoles?: boolean
}

export function ProtectedRoute({ 
  children, 
  requiredRoles = [], 
  requireAllRoles = false 
}: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading, hasRole } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login")
      return
    }

    if (!isLoading && isAuthenticated && user && requiredRoles.length > 0) {
      // Ensure user has roles array
      if (!user.roles || !Array.isArray(user.roles)) {
        console.error("User roles are undefined or invalid, redirecting to home");
        router.push("/");
        return;
      }

      const hasRequiredAccess = requireAllRoles
        ? requiredRoles.every(role => hasRole(role))
        : requiredRoles.some(role => hasRole(role))

      if (!hasRequiredAccess) {
        // Redirect to home page if user doesn't have required roles
        router.push("/")
      }
    }
  }, [isAuthenticated, isLoading, router, requiredRoles, requireAllRoles, hasRole, user])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="size-4 animate-spin" />
          <span>Loading...</span>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  // Check role-based access
  if (requiredRoles.length > 0) {
    // Ensure user and roles exist
    if (!user || !user.roles || !Array.isArray(user.roles)) {
      return (
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Authentication Error</h1>
            <p className="text-gray-600 mb-4">User authentication data is invalid. Please log in again.</p>
            <button 
              onClick={() => router.push("/login")}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Go to Login
            </button>
          </div>
        </div>
      )
    }

    const hasRequiredAccess = requireAllRoles
      ? requiredRoles.every(role => hasRole(role))
      : requiredRoles.some(role => hasRole(role))

    if (!hasRequiredAccess) {
      return (
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
            <p className="text-gray-600 mb-4">You don't have permission to access this page.</p>
            <button 
              onClick={() => router.push("/")}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Go Home
            </button>
          </div>
        </div>
      )
    }
  }

  return <>{children}</>
}
