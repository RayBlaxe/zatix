"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, ArrowLeft, CheckCircle } from "lucide-react"
import { Header } from "@/components/header"
import { useAuth } from "@/hooks/use-auth"
import { termsApi, tncApi, getToken } from "@/lib/api"
import type { TermsAndConditions, TNCEventResponse } from "@/types/terms"

export default function TermsAndConditions() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const [accepted, setAccepted] = useState(false)
  const [termsData, setTermsData] = useState<TermsAndConditions | null>(null)
  const [tncEventData, setTncEventData] = useState<TNCEventResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [accepting, setAccepting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Check if this is for event creation
  const isForEvent = searchParams.get("for") === "event"

  useEffect(() => {
    const fetchTerms = async () => {
      try {
        setLoading(true)
        
        if (isForEvent) {
          // For event creation, use TNC events API
          const token = getToken()
          if (!token) {
            setError("Authentication required. Please login first.")
            router.push("/login")
            return
          }
          
          const response = await tncApi.getTNCEvents(token)
          setTncEventData(response)
          setAccepted(response.data.already_accepted)
        } else {
          // For EO registration, use general terms API
          const response = await termsApi.getTermsAndConditions()
          if (response.success) {
            setTermsData(response.data)
          } else {
            setError(response.message || "Failed to load terms and conditions")
          }
        }
      } catch (err) {
        setError("Failed to load terms and conditions")
        console.error("Error fetching terms:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchTerms()
  }, [isForEvent, router])

  const handleAccept = async () => {
    if (!accepted) return
    
    if (isForEvent) {
      // Handle event TNC acceptance
      setAccepting(true)
      setError(null)
      
      try {
        const token = getToken()
        if (!token) {
          throw new Error("Authentication required")
        }
        
        await tncApi.acceptTNCEvents(token)
        
        // Redirect to event creation after successful acceptance
        router.push("/dashboard/events/create")
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to accept terms and conditions")
      } finally {
        setAccepting(false)
      }
    } else {
      // Handle EO registration TNC acceptance
      router.push("/eo-registration")
    }
  }

  // Redirect if user is already an event organizer and not for event creation
  if (user?.role === "event_organizer" && !isForEvent) {
    router.push("/dashboard")
    return null
  }

  const getTermsContent = () => {
    if (isForEvent && tncEventData?.data) {
      const firstTNC = Object.values(tncEventData.data).find(item => item.id !== undefined)
      return firstTNC?.content || ""
    }
    return termsData?.content || ""
  }

  const getTermsTitle = () => {
    if (isForEvent) {
      return "Event Organizer Terms and Conditions"
    }
    return termsData?.title || "Event Organizer Terms and Conditions"
  }

  const handleBackToDashboard = () => {
    if (isForEvent) {
      router.push("/dashboard")
    } else {
      router.push("/")
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <div className="container py-6">
          <div className="mx-auto max-w-3xl">
            {isForEvent && (
              <Button 
                variant="ghost" 
                onClick={handleBackToDashboard}
                className="mb-4"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
            )}
            
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  {loading ? "Loading..." : getTermsTitle()}
                  {isForEvent && tncEventData?.data.already_accepted && (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  )}
                </CardTitle>
                <CardDescription>
                  {isForEvent 
                    ? "Please read and accept the terms and conditions before creating an event."
                    : "Please read and accept our terms and conditions before proceeding."
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                {error && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {isForEvent && tncEventData?.data.already_accepted && (
                  <Alert className="mb-4">
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      You have already accepted these terms and conditions. You can proceed to create events.
                    </AlertDescription>
                  </Alert>
                )}

                {loading ? (
                  <div className="flex items-center justify-center h-[400px]">
                    <div className="text-center">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                      <p>Loading terms and conditions...</p>
                    </div>
                  </div>
                ) : error ? (
                  <div className="flex items-center justify-center h-[400px]">
                    <div className="text-center text-red-600">
                      <p className="mb-2">Error loading terms and conditions</p>
                      <p className="text-sm">{error}</p>
                      <Button 
                        variant="outline" 
                        onClick={() => window.location.reload()} 
                        className="mt-4"
                      >
                        Retry
                      </Button>
                    </div>
                  </div>
                ) : (
                  <ScrollArea className="h-[400px] rounded-md border p-4">
                    <div 
                      className="space-y-4 prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: getTermsContent() }}
                    />
                  </ScrollArea>
                )}

                <div className="mt-4 flex items-center space-x-2">
                  <Checkbox 
                    id="terms" 
                    checked={accepted} 
                    onCheckedChange={(checked) => setAccepted(!!checked)}
                    disabled={isForEvent && tncEventData?.data.already_accepted}
                  />
                  <label
                    htmlFor="terms"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {isForEvent 
                      ? "I have read and accept the terms and conditions for event organizers"
                      : "I have read and agree to the terms and conditions"
                    }
                  </label>
                </div>
              </CardContent>
              <CardFooter>
                <div className="flex w-full justify-between">
                  <Button variant="outline" onClick={handleBackToDashboard}>
                    Cancel
                  </Button>
                  
                  {isForEvent && tncEventData?.data.already_accepted ? (
                    <Button onClick={() => router.push("/dashboard/events/create")}>
                      Continue to Create Event
                    </Button>
                  ) : (
                    <Button 
                      onClick={handleAccept} 
                      disabled={!accepted || loading || accepting}
                    >
                      {accepting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Accepting...
                        </>
                      ) : isForEvent ? (
                        "Accept & Continue to Create Event"
                      ) : (
                        "Accept and Continue"
                      )}
                    </Button>
                  )}
                </div>
              </CardFooter>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
