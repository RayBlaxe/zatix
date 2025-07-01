"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"
import { getTokenTimeRemaining, getTokenRaw } from "@/lib/api"

export function TokenExpirationHandler() {
  const { logout, isAuthenticated } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated) return

    const handleTokenExpirationWarning = (event: CustomEvent) => {
      const { expiresAt } = event.detail
      const timeRemaining = Math.floor((new Date(expiresAt).getTime() - new Date().getTime()) / 1000 / 60)
      
      toast({
        title: "Session Expiring Soon",
        description: `Your session will expire in ${timeRemaining} minutes. Please save your work.`,
        variant: "destructive",
        duration: 10000,
      })
    }

    const handleTokenExpired = () => {
      toast({
        title: "Session Expired",
        description: "Your session has expired. Please log in again.",
        variant: "destructive",
        duration: 5000,
      })
      
      setTimeout(() => {
        router.push("/login")
      }, 2000)
    }

    const handleAuthenticationFailed = (event: CustomEvent) => {
      const { status, endpoint } = event.detail
      
      toast({
        title: "Authentication Failed",
        description: `Your session is no longer valid. Please log in again.`,
        variant: "destructive",
        duration: 5000,
      })
      
      setTimeout(() => {
        router.push("/login")
      }, 2000)
    }

    // Add event listeners
    window.addEventListener("tokenExpirationWarning", handleTokenExpirationWarning as EventListener)
    window.addEventListener("tokenExpired", handleTokenExpired)
    window.addEventListener("authenticationFailed", handleAuthenticationFailed as EventListener)

    return () => {
      window.removeEventListener("tokenExpirationWarning", handleTokenExpirationWarning as EventListener)
      window.removeEventListener("tokenExpired", handleTokenExpired)
      window.removeEventListener("authenticationFailed", handleAuthenticationFailed as EventListener)
    }
  }, [isAuthenticated, toast, router, logout])

  return null // This component doesn't render anything
}