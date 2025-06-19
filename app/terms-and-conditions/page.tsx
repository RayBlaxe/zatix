"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Header } from "@/components/header"
import { useAuth } from "@/hooks/use-auth"
import { termsApi } from "@/lib/api"
import { TermsAndConditions } from "@/types/terms"

export default function TermsAndConditions() {
  const router = useRouter()
  const { user } = useAuth()
  const [accepted, setAccepted] = useState(false)
  const [termsData, setTermsData] = useState<TermsAndConditions | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTerms = async () => {
      try {
        setLoading(true)
        const response = await termsApi.getTermsAndConditions()
        if (response.success) {
          setTermsData(response.data)
        } else {
          setError(response.message || "Failed to load terms and conditions")
        }
      } catch (err) {
        setError("Failed to load terms and conditions")
        console.error("Error fetching terms:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchTerms()
  }, [])

  const handleAccept = () => {
    if (accepted) {
      router.push("/eo-registration")
    }
  }

  // Redirect if user is already an event organizer
  if (user?.role === "event_organizer") {
    router.push("/dashboard")
    return null
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <div className="container py-6">
          <div className="mx-auto max-w-3xl">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">
                  {loading ? "Loading..." : termsData?.title || "Event Organizer Terms and Conditions"}
                </CardTitle>
                <CardDescription>Please read and accept our terms and conditions before proceeding.</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center h-[400px]">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
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
                      dangerouslySetInnerHTML={{ __html: termsData?.content || "" }}
                    />
                  </ScrollArea>
                )}

                <div className="mt-4 flex items-center space-x-2">
                  <Checkbox id="terms" checked={accepted} onCheckedChange={(checked) => setAccepted(!!checked)} />
                  <label
                    htmlFor="terms"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    I have read and agree to the terms and conditions
                  </label>
                </div>
              </CardContent>
              <CardFooter>
                <div className="flex w-full justify-between">
                  <Button variant="outline" onClick={() => router.push("/")}>
                    Cancel
                  </Button>
                  <Button onClick={handleAccept} disabled={!accepted || loading}>
                    Accept and Continue
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
