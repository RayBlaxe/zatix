"use client"

import type React from "react"

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  // Bypass all authentication checks
  return <>{children}</>
}
