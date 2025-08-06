import { Header } from "@/components/header"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, Phone, MapPin, Clock } from "lucide-react"

export default function ContactPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        <div className="container px-4 sm:px-6 py-8 sm:py-12">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: '#002547' }}>
                Contact Us
              </h1>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                Have questions about ZaTix? We're here to help! Reach out to us through any of the following channels.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2" style={{ color: '#002547' }}>
                    <Mail className="h-5 w-5" />
                    Email Support
                  </CardTitle>
                  <CardDescription>
                    Send us an email and we'll get back to you within 24 hours.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-lg font-medium">support@zatix.com</p>
                  <p className="text-sm text-gray-600 mt-2">
                    For general inquiries, technical support, and account assistance.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2" style={{ color: '#002547' }}>
                    <Phone className="h-5 w-5" />
                    Phone Support
                  </CardTitle>
                  <CardDescription>
                    Call us during business hours for immediate assistance.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-lg font-medium">+62 21 1234 5678</p>
                  <p className="text-sm text-gray-600 mt-2">
                    Available Monday - Friday, 9:00 AM - 6:00 PM (WIB)
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2" style={{ color: '#002547' }}>
                    <MapPin className="h-5 w-5" />
                    Office Address
                  </CardTitle>
                  <CardDescription>
                    Visit us at our headquarters in Jakarta.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-sm">
                    <p className="font-medium">ZaTix Indonesia</p>
                    <p>Jl. Sudirman No. 123</p>
                    <p>Jakarta Pusat 10110</p>
                    <p>DKI Jakarta, Indonesia</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2" style={{ color: '#002547' }}>
                    <Clock className="h-5 w-5" />
                    Business Hours
                  </CardTitle>
                  <CardDescription>
                    Our team is available during these hours.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span>Monday - Friday</span>
                      <span>9:00 AM - 6:00 PM</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Saturday</span>
                      <span>10:00 AM - 4:00 PM</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Sunday</span>
                      <span>Closed</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="bg-gray-50 rounded-xl p-6 sm:p-8">
              <h2 className="text-2xl font-semibold mb-4" style={{ color: '#002547' }}>
                Frequently Asked Questions
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">How do I purchase tickets?</h3>
                  <p className="text-gray-600 text-sm">
                    Simply browse our events, select the one you're interested in, choose your tickets, and complete the payment process.
                  </p>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Can I cancel or refund my tickets?</h3>
                  <p className="text-gray-600 text-sm">
                    Refund policies vary by event organizer. Please check the specific event's terms and conditions before purchasing.
                  </p>
                </div>
                <div>
                  <h3 className="font-medium mb-2">How do I create an event?</h3>
                  <p className="text-gray-600 text-sm">
                    Click on "Create New Event" from our homepage and follow the step-by-step wizard to set up your event.
                  </p>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Is my payment information secure?</h3>
                  <p className="text-gray-600 text-sm">
                    Yes, we use industry-standard encryption and work with trusted payment processors to ensure your information is safe.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t text-center">
              <p className="text-gray-600 mb-4">
                Need immediate assistance? Our support team is here to help!
              </p>
              <Link href="/">
                <Button variant="outline">
                  Back to Home
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row px-4 sm:px-6">
          <p className="text-center text-xs sm:text-sm leading-loose text-muted-foreground md:text-left">
            © 2025 ZaTix. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
