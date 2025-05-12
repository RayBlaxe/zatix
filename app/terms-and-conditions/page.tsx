"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Header } from "@/components/header"
import { useAuth } from "@/hooks/use-auth"

export default function TermsAndConditions() {
  const router = useRouter()
  const { user } = useAuth()
  const [accepted, setAccepted] = useState(false)

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
                <CardTitle className="text-2xl">Event Organizer Terms and Conditions</CardTitle>
                <CardDescription>Please read and accept our terms and conditions before proceeding.</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px] rounded-md border p-4">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">1. Introduction</h3>
                    <p>
                      Welcome to ZaTix. These Terms and Conditions govern your use of our platform and services as an
                      Event Organizer. By accessing or using our services, you agree to be bound by these Terms.
                    </p>

                    <h3 className="text-lg font-medium">2. Event Creation Process</h3>
                    <p>
                      Our platform requires event organizers to go through a verification process before gaining full
                      access to create events. This process includes:
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Submitting basic information about your organization and event</li>
                      <li>Scheduling a pitching session with our team</li>
                      <li>Demonstrating your event concept during the pitching session</li>
                      <li>Receiving a demo account to test our platform</li>
                      <li>Upon satisfaction and approval, receiving full access to our platform</li>
                    </ul>

                    <h3 className="text-lg font-medium">3. Account Usage</h3>
                    <p>
                      You are responsible for maintaining the confidentiality of your account information and for all
                      activities that occur under your account. You agree to notify us immediately of any unauthorized
                      use of your account.
                    </p>

                    <h3 className="text-lg font-medium">4. Content Guidelines</h3>
                    <p>
                      All events created on our platform must comply with our content guidelines. Events that promote
                      illegal activities, hate speech, or violate any applicable laws are strictly prohibited.
                    </p>

                    <h3 className="text-lg font-medium">5. Fees and Payments</h3>
                    <p>
                      Depending on your subscription plan, fees may apply for using our platform. All fees are
                      non-refundable unless otherwise specified in our refund policy.
                    </p>

                    <h3 className="text-lg font-medium">6. Free Account Limitations</h3>
                    <p>
                      Free accounts are limited to creating 1 event with a maximum of 10 participants. To create more
                      events or increase participant limits, you will need to upgrade to a paid plan.
                    </p>

                    <h3 className="text-lg font-medium">7. Termination</h3>
                    <p>
                      We reserve the right to terminate or suspend your account at any time for violations of these
                      Terms or for any other reason at our sole discretion.
                    </p>

                    <h3 className="text-lg font-medium">8. Limitation of Liability</h3>
                    <p>
                      To the maximum extent permitted by law, we shall not be liable for any indirect, incidental,
                      special, consequential, or punitive damages, or any loss of profits or revenues.
                    </p>

                    <h3 className="text-lg font-medium">9. Changes to Terms</h3>
                    <p>
                      We may modify these Terms at any time. Your continued use of our platform after such changes
                      constitutes your acceptance of the new Terms.
                    </p>

                    <h3 className="text-lg font-medium">10. Contact Information</h3>
                    <p>If you have any questions about these Terms, please contact us at support@zatix.com.</p>
                  </div>
                </ScrollArea>

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
                  <Button onClick={handleAccept} disabled={!accepted}>
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
