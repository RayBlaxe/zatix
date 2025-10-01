"use client"

import type React from "react"

import { useState, useEffect, Suspense } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Header } from "@/components/header"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Mail, CheckCircle } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"

function ForgotPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { forgotPassword } = useAuth()
  const [email, setEmail] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Pre-fill email if provided in query params
    const emailParam = searchParams.get("email")
    if (emailParam) {
      setEmail(decodeURIComponent(emailParam))
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setIsLoading(true)

    try {
      await forgotPassword(email)
      setSuccess("Password reset instructions have been sent to your email. Please check your inbox and click the reset link.")
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError("Failed to send reset email. Please try again.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center py-12">
        <div className="w-full max-w-md px-4">
          <Card>
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold">Reset password</CardTitle>
              <CardDescription>Enter your email to receive a password reset link</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                {success && (
                  <Alert className="border-green-200 bg-green-50">
                    <Mail className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-600">
                      {success}
                    </AlertDescription>
                  </Alert>
                )}
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                <Button type="submit" className="w-full" disabled={isLoading || success !== null}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" /> Sending...
                    </>
                  ) : success ? (
                    <>
                      <CheckCircle className="mr-2 size-4" /> Email Sent
                    </>
                  ) : (
                    "Send Reset Link"
                  )}
                </Button>
                {success && (
                  <div className="text-center text-sm text-gray-600">
                    <p>Didn't receive the email? Check your spam folder or</p>
                    <Button 
                      type="button" 
                      variant="link" 
                      className="p-0 h-auto text-primary"
                      onClick={() => {
                        setSuccess(null)
                        setError(null)
                      }}
                    >
                      try again
                    </Button>
                  </div>
                )}
                <div className="text-center text-sm">
                  <Link href="/login" className="text-primary hover:underline">
                    Back to login
                  </Link>
                </div>
              </CardFooter>
            </form>
          </Card>
        </div>
      </main>
    </div>
  )
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <ForgotPasswordForm />
    </Suspense>
  )
}
