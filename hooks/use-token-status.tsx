"use client"

import { useState, useEffect } from "react"
import { getTokenRaw, getStoredTokenExpiration, getTokenTimeRemaining, isTokenExpiredByStorage } from "@/lib/api"

export interface TokenStatus {
  isValid: boolean
  expiresAt: Date | null
  timeRemaining: number // in milliseconds
  timeRemainingText: string
  isExpiringSoon: boolean // true if expires within 10 minutes
}

export function useTokenStatus(): TokenStatus {
  const [tokenStatus, setTokenStatus] = useState<TokenStatus>({
    isValid: false,
    expiresAt: null,
    timeRemaining: 0,
    timeRemainingText: "",
    isExpiringSoon: false,
  })

  useEffect(() => {
    const updateTokenStatus = () => {
      const token = getTokenRaw()
      
      if (!token) {
        setTokenStatus({
          isValid: false,
          expiresAt: null,
          timeRemaining: 0,
          timeRemainingText: "No token",
          isExpiringSoon: false,
        })
        return
      }

      const isValid = !isTokenExpiredByStorage()
      const expiresAt = getStoredTokenExpiration()
      const timeRemaining = getTokenTimeRemaining()
      const isExpiringSoon = timeRemaining > 0 && timeRemaining <= 10 * 60 * 1000 // 10 minutes

      let timeRemainingText = ""
      if (timeRemaining > 0) {
        const minutes = Math.floor(timeRemaining / (1000 * 60))
        const hours = Math.floor(minutes / 60)
        const days = Math.floor(hours / 24)

        if (days > 0) {
          timeRemainingText = `${days}d ${hours % 24}h`
        } else if (hours > 0) {
          timeRemainingText = `${hours}h ${minutes % 60}m`
        } else {
          timeRemainingText = `${minutes}m`
        }
      } else {
        timeRemainingText = "Expired"
      }

      setTokenStatus({
        isValid,
        expiresAt,
        timeRemaining,
        timeRemainingText,
        isExpiringSoon,
      })
    }

    // Update immediately
    updateTokenStatus()

    // Update every minute
    const interval = setInterval(updateTokenStatus, 60000)

    return () => clearInterval(interval)
  }, [])

  return tokenStatus
}