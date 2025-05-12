"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Header } from "@/components/header"
import { useAuth } from "@/hooks/use-auth"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"

export default function VerifyOTPPage() {
  const router = useRouter()
  const { verifyOtp, resendOtp, pendingVerificationEmail, setPendingVerificationEmail } = useAuth()
  const [otp_code, setOtp] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [resendDisabled, setResendDisabled] = useState(false)
  const [countdown, setCountdown] = useState(0)

  // Redirect if no pending verification
  useEffect(() => {
    if (!pendingVerificationEmail) {
      router.push("/")
    }
  }, [pendingVerificationEmail, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!pendingVerificationEmail) return

    setError(null)
    setIsLoading(true)

    try {
      await verifyOtp(pendingVerificationEmail, otp_code)
      router.push("/dashboard")
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError("Invalid OTP. Please try again.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendOtp = async () => {
    if (!pendingVerificationEmail || resendDisabled) return

    setError(null)
    setIsLoading(true)
    setResendDisabled(true)
    setCountdown(60)

    try {
      await resendOtp(pendingVerificationEmail)
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError("Failed to resend OTP. Please try again.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Countdown timer for resend button
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    } else {
      setResendDisabled(false)
    }
  }, [countdown])

  // If no pending verification, show loading
  if (!pendingVerificationEmail) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="size-8 animate-spin" />
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center py-12">
        <div className="w-full max-w-md px-4">
          <Card>
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold">Verify Your Email</CardTitle>
              <CardDescription>
                We've sent a verification code to {pendingVerificationEmail}. Please enter it below.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <div className="space-y-2">
                  <Label htmlFor="otp_code">Verification Code</Label>
                  <Input
                    id="otp_code"
                    placeholder="Enter verification code"
                    value={otp_code}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                  />
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="me-2 size-4 animate-spin" /> Verifying
                    </>
                  ) : (
                    "Verify"
                  )}
                </Button>
                <div className="text-center text-sm">
                  Didn't receive the code?{" "}
                  <Button
                    variant="link"
                    className="p-0 h-auto text-primary"
                    onClick={handleResendOtp}
                    disabled={resendDisabled}
                  >
                    {resendDisabled ? `Resend in ${countdown}s` : "Resend"}
                  </Button>
                </div>
                <div className="text-center text-sm">
                  <Button
                    variant="link"
                    className="p-0 h-auto text-muted-foreground"
                    onClick={() => {
                      setPendingVerificationEmail(null)
                      router.push("/login")
                    }}
                  >
                    Back to login
                  </Button>
                </div>
              </CardFooter>
            </form>
          </Card>
        </div>
      </main>
    </div>
  )
}
