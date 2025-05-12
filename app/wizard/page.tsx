"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { format } from "date-fns"
import { ArrowRight, CalendarIcon, Check, ChevronLeft, ExternalLink } from "lucide-react"
import { Header } from "@/components/header"
import { cn } from "@/lib/utils"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function WizardForm() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [date, setDate] = useState<Date>()
  const [adminApproved, setAdminApproved] = useState<boolean | null>(null)
  const [demoCompleted, setDemoCompleted] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    eoName: "",
    eoEmail: "",
    eoDescription: "",
    eventName: "",
    eventDescription: "",
    audienceTarget: "",
  })

  const totalSteps = 5

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const nextStep = () => {
    if (step < totalSteps) {
      // Simulate admin approval in step 2
      if (step === 2) {
        // For demo purposes, we'll simulate an approval after 2 seconds
        setTimeout(() => {
          setAdminApproved(true)
          setStep(step + 1)
        }, 2000)
        return
      }
      setStep(step + 1)
    }
  }

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (step === totalSteps) {
      console.log("Form submitted:", formData)
      router.push("/dashboard")
    } else {
      nextStep()
    }
  }

  const simulatePitching = () => {
    // For demo purposes, we'll simulate a pitching session
    setStep(4)
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <div className="container py-6">
          <div className="mx-auto max-w-2xl">
            <div className="mb-8">
              <h1 className="text-3xl font-bold tracking-tight mb-2">Event Organizer Application</h1>
              <p className="text-muted-foreground">
                Complete this application to start creating events on our platform.
              </p>

              <div className="mt-6 flex items-center justify-between">
                <Button variant="ghost" onClick={prevStep} disabled={step === 1}>
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <div className="text-sm text-muted-foreground">
                  Step {step} of {totalSteps}
                </div>
              </div>
              <div className="mt-4 overflow-hidden rounded-full bg-muted">
                <div className="h-2 bg-primary transition-all" style={{ width: `${(step / totalSteps) * 100}%` }} />
              </div>
            </div>

            <Card>
              <form onSubmit={handleSubmit}>
                {step === 1 && (
                  <>
                    <CardHeader>
                      <CardTitle>Event Organizer Details</CardTitle>
                      <CardDescription>Tell us about yourself and your event.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="eoName">Event Organizer Name</Label>
                        <Input
                          id="eoName"
                          placeholder="Enter your name or organization name"
                          value={formData.eoName}
                          onChange={(e) => handleChange("eoName", e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="eoEmail">Email</Label>
                        <Input
                          id="eoEmail"
                          type="email"
                          placeholder="Enter your email address"
                          value={formData.eoEmail}
                          onChange={(e) => handleChange("eoEmail", e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="eoDescription">Organization Description</Label>
                        <Textarea
                          id="eoDescription"
                          placeholder="Tell us about your organization"
                          value={formData.eoDescription}
                          onChange={(e) => handleChange("eoDescription", e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="eventName">Event Name</Label>
                        <Input
                          id="eventName"
                          placeholder="Enter your event name"
                          value={formData.eventName}
                          onChange={(e) => handleChange("eventName", e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="eventDescription">Event Description</Label>
                        <Textarea
                          id="eventDescription"
                          placeholder="Describe your event"
                          value={formData.eventDescription}
                          onChange={(e) => handleChange("eventDescription", e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="audienceTarget">Target Audience</Label>
                        <Textarea
                          id="audienceTarget"
                          placeholder="Describe your target audience"
                          value={formData.audienceTarget}
                          onChange={(e) => handleChange("audienceTarget", e.target.value)}
                          required
                        />
                      </div>
                    </CardContent>
                  </>
                )}

                {step === 2 && (
                  <>
                    <CardHeader>
                      <CardTitle>Schedule a Pitching Session</CardTitle>
                      <CardDescription>
                        Select a date for your pitching session to get a demo account access.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label>Select a Date</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !date && "text-muted-foreground",
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {date ? format(date, "PPP") : <span>Pick a date</span>}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={date}
                              onSelect={setDate}
                              initialFocus
                              disabled={(date) => {
                                // Disable past dates and weekends
                                const today = new Date()
                                today.setHours(0, 0, 0, 0)
                                const day = date.getDay()
                                return date < today || day === 0 || day === 6
                              }}
                            />
                          </PopoverContent>
                        </Popover>
                        <p className="text-xs text-muted-foreground mt-2">
                          Pitching sessions are available Monday to Friday, from 9 AM to 5 PM.
                        </p>
                      </div>

                      <Alert className="mt-4">
                        <AlertTitle>What happens next?</AlertTitle>
                        <AlertDescription>
                          After selecting a date, our admin team will review your request and confirm your pitching
                          session. You will receive an email confirmation with further details.
                        </AlertDescription>
                      </Alert>
                    </CardContent>
                  </>
                )}

                {step === 3 && (
                  <>
                    <CardHeader>
                      <CardTitle>Pitching Session Confirmed</CardTitle>
                      <CardDescription>
                        Your pitching session has been approved. Please join the Google Meet link at the scheduled time.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="rounded-lg border p-4">
                        <h3 className="font-medium mb-2">Pitching Session Details</h3>
                        <div className="space-y-2">
                          <div className="grid grid-cols-2">
                            <span className="text-muted-foreground">Date:</span>
                            <span>{date ? format(date, "PPP") : "Not specified"}</span>
                          </div>
                          <div className="grid grid-cols-2">
                            <span className="text-muted-foreground">Time:</span>
                            <span>10:00 AM - 11:00 AM</span>
                          </div>
                          <div className="grid grid-cols-2">
                            <span className="text-muted-foreground">Platform:</span>
                            <span>Google Meet</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4">
                        <Button className="w-full" onClick={simulatePitching}>
                          <ExternalLink className="mr-2 h-4 w-4" />
                          Join Google Meet
                        </Button>
                        <p className="text-xs text-muted-foreground text-center mt-2">
                          For demo purposes, clicking this button will simulate completing the pitching session.
                        </p>
                      </div>
                    </CardContent>
                  </>
                )}

                {step === 4 && (
                  <>
                    <CardHeader>
                      <CardTitle>Demo Account Feedback</CardTitle>
                      <CardDescription>
                        Thank you for completing your pitching session. We have provided you with a demo account. Please
                        let us know about your experience.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Alert className="bg-green-50 border-green-200 text-green-800">
                        <Check className="h-4 w-4" />
                        <AlertTitle>Demo Account Activated</AlertTitle>
                        <AlertDescription>
                          Your demo account has been activated. You can now explore our platform features.
                        </AlertDescription>
                      </Alert>

                      <div className="space-y-2 mt-4">
                        <Label>Have you completed testing the demo account?</Label>
                        <RadioGroup value={demoCompleted || ""} onValueChange={setDemoCompleted}>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="yes" id="yes" />
                            <Label htmlFor="yes">Yes, I have completed testing</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="no" id="no" />
                            <Label htmlFor="no">No, I need more time</Label>
                          </div>
                        </RadioGroup>
                      </div>

                      {demoCompleted === "yes" && (
                        <div className="space-y-2 mt-4">
                          <Label>Are you satisfied with the platform features?</Label>
                          <RadioGroup defaultValue="satisfied">
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="very-satisfied" id="very-satisfied" />
                              <Label htmlFor="very-satisfied">Very satisfied</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="satisfied" id="satisfied" />
                              <Label htmlFor="satisfied">Satisfied</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="neutral" id="neutral" />
                              <Label htmlFor="neutral">Neutral</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="dissatisfied" id="dissatisfied" />
                              <Label htmlFor="dissatisfied">Dissatisfied</Label>
                            </div>
                          </RadioGroup>
                        </div>
                      )}
                    </CardContent>
                  </>
                )}

                {step === 5 && (
                  <>
                    <CardHeader>
                      <CardTitle>Account Upgraded</CardTitle>
                      <CardDescription>Congratulations! Your account has been upgraded to full access.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="rounded-lg bg-green-50 border border-green-200 p-6 text-center">
                        <div className="mx-auto w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
                          <Check className="h-6 w-6 text-green-600" />
                        </div>
                        <h3 className="text-xl font-medium text-green-800 mb-2">Account Successfully Upgraded</h3>
                        <p className="text-green-700 mb-4">
                          You now have full access to create and manage events on our platform.
                        </p>
                        <div className="space-y-2 text-sm text-left bg-white rounded-md p-4 border border-green-100">
                          <div className="grid grid-cols-2">
                            <span className="text-muted-foreground">Account Type:</span>
                            <span className="font-medium">Full Access</span>
                          </div>
                          <div className="grid grid-cols-2">
                            <span className="text-muted-foreground">Event Organizer:</span>
                            <span>{formData.eoName}</span>
                          </div>
                          <div className="grid grid-cols-2">
                            <span className="text-muted-foreground">Email:</span>
                            <span>{formData.eoEmail}</span>
                          </div>
                          <div className="grid grid-cols-2">
                            <span className="text-muted-foreground">Activation Date:</span>
                            <span>{new Date().toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </>
                )}

                <CardFooter className="flex justify-between">
                  {step < totalSteps ? (
                    <Button
                      type="submit"
                      disabled={
                        (step === 1 && (!formData.eoName || !formData.eoEmail || !formData.eventName)) ||
                        (step === 2 && !date) ||
                        (step === 4 && !demoCompleted)
                      }
                    >
                      {step === 2 ? "Submit Date" : "Next"}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  ) : (
                    <Button type="submit" className="bg-green-600 hover:bg-green-700">
                      Go to Dashboard
                      <Check className="ml-2 h-4 w-4" />
                    </Button>
                  )}
                </CardFooter>
              </form>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
