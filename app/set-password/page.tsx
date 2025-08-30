"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, CheckCircle, AlertCircle, Shield, Loader2 } from "lucide-react"
import { authApi } from "@/lib/api"
import Image from "next/image"
import Link from "next/link"

export default function SetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [password, setPassword] = useState("")
  const [passwordConfirmation, setPasswordConfirmation] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  
  const token = searchParams.get("token")
  const email = searchParams.get("email")
  const decodedEmail = email ? decodeURIComponent(email) : ""

  useEffect(() => {
    if (!token || !email) {
      setError("Invalid or missing password setup link. Please contact your administrator.")
    }
  }, [token, email])

  const getPasswordStrength = (password: string) => {
    if (password.length < 6) return { strength: "weak", color: "text-red-500" }
    if (password.length < 8) return { strength: "fair", color: "text-yellow-500" }
    if (password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password)) {
      return { strength: "strong", color: "text-green-500" }
    }
    return { strength: "good", color: "text-blue-500" }
  }

  const passwordStrength = getPasswordStrength(password)
  const passwordsMatch = password === passwordConfirmation && passwordConfirmation.length > 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!token || !email) {
      setError("Invalid or missing password setup link.")
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.")
      return
    }

    if (password !== passwordConfirmation) {
      setError("Passwords do not match.")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      // Use the correct /reset-password endpoint
      const response = await authApi.resetPassword(token, decodedEmail, password, passwordConfirmation)
      
      if (response.success) {
        setSuccess("Password set successfully! Redirecting to login...")
        setTimeout(() => {
          router.push("/login?email=" + encodeURIComponent(decodedEmail) + "&message=password_set")
        }, 2000)
      } else {
        setError(response.message || "Failed to set password. Please try again.")
      }
    } catch (error) {
      console.error("Set password error:", error)
      setError("An error occurred while setting your password. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  if (!token || !email) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              <Image
                src="/zatix-logo.png"
                alt="ZaTix Logo"
                width={60}
                height={60}
                className="mx-auto"
              />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">Invalid Link</CardTitle>
            <CardDescription>
              This password setup link is invalid or has expired.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Please contact your administrator for a new password setup link.
              </AlertDescription>
            </Alert>
            <div className="mt-6">
              <Link href="/login">
                <Button className="w-full">
                  Go to Login
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <Image
              src="/zatix-logo.png"
              alt="ZaTix Logo"
              width={60}
              height={60}
              className="mx-auto"
            />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900 flex items-center justify-center gap-2">
            <Shield className="h-6 w-6 text-blue-600" />
            Set Your Password
          </CardTitle>
          <CardDescription>
            Create a secure password for <strong>{decodedEmail}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent>
          {success && (
            <Alert className="mb-4 border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-600">
                {success}
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert className="mb-4 border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-600">
                {error}
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="password">New Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your new password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {password && (
                <p className={`text-sm mt-1 ${passwordStrength.color}`}>
                  Password strength: {passwordStrength.strength}
                </p>
              )}
              <p className="text-sm text-gray-500 mt-1">
                Password must be at least 6 characters long
              </p>
            </div>

            <div>
              <Label htmlFor="password_confirmation">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="password_confirmation"
                  type={showPasswordConfirmation ? "text" : "password"}
                  placeholder="Confirm your new password"
                  value={passwordConfirmation}
                  onChange={(e) => setPasswordConfirmation(e.target.value)}
                  required
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPasswordConfirmation(!showPasswordConfirmation)}
                >
                  {showPasswordConfirmation ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {passwordConfirmation && (
                <p className={`text-sm mt-1 ${passwordsMatch ? 'text-green-500' : 'text-red-500'}`}>
                  {passwordsMatch ? '✓ Passwords match' : '✗ Passwords do not match'}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || !passwordsMatch || password.length < 6}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Setting Password...
                </>
              ) : (
                "Set Password"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center space-y-2">
            <Link 
              href="/login" 
              className="text-sm text-blue-600 hover:text-blue-500 block"
            >
              Already have a password? Sign in
            </Link>
            <Link 
              href={`/forgot-password?email=${encodeURIComponent(decodedEmail)}`}
              className="text-sm text-gray-600 hover:text-gray-500 block"
            >
              Having trouble? Use forgot password instead
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
