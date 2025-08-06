import { Header } from "@/components/header"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function TermsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        <div className="container px-4 sm:px-6 py-8 sm:py-12">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: '#002547' }}>
                Terms of Service
              </h1>
              <p className="text-gray-600 text-lg">
                Last updated: August 6, 2025
              </p>
            </div>

            <div className="prose prose-lg max-w-none">
              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4" style={{ color: '#002547' }}>
                  1. Acceptance of Terms
                </h2>
                <p className="text-gray-700 mb-4">
                  By accessing and using ZaTix ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. 
                  If you do not agree to abide by the above, please do not use this service.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4" style={{ color: '#002547' }}>
                  2. Use License
                </h2>
                <p className="text-gray-700 mb-4">
                  Permission is granted to temporarily download one copy of ZaTix materials for personal, non-commercial transitory viewing only. 
                  This is the grant of a license, not a transfer of title, and under this license you may not:
                </p>
                <ul className="list-disc list-inside text-gray-700 mb-4 ml-4">
                  <li>modify or copy the materials</li>
                  <li>use the materials for any commercial purpose or for any public display</li>
                  <li>attempt to reverse engineer any software contained on the website</li>
                  <li>remove any copyright or other proprietary notations from the materials</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4" style={{ color: '#002547' }}>
                  3. Event Tickets and Purchases
                </h2>
                <p className="text-gray-700 mb-4">
                  When purchasing tickets through ZaTix, you agree that:
                </p>
                <ul className="list-disc list-inside text-gray-700 mb-4 ml-4">
                  <li>All ticket sales are final unless otherwise specified by the event organizer</li>
                  <li>You are responsible for providing accurate information during purchase</li>
                  <li>Tickets are non-transferable unless permitted by the event organizer</li>
                  <li>ZaTix acts as a platform and is not responsible for event cancellations or changes</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4" style={{ color: '#002547' }}>
                  4. User Accounts
                </h2>
                <p className="text-gray-700 mb-4">
                  Users are responsible for maintaining the confidentiality of their account information and password. 
                  You agree to accept responsibility for all activities that occur under your account.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4" style={{ color: '#002547' }}>
                  5. Disclaimer
                </h2>
                <p className="text-gray-700 mb-4">
                  The materials on ZaTix are provided on an 'as is' basis. ZaTix makes no warranties, expressed or implied, 
                  and hereby disclaims and negates all other warranties including without limitation, implied warranties or 
                  conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4" style={{ color: '#002547' }}>
                  6. Contact Information
                </h2>
                <p className="text-gray-700 mb-4">
                  If you have any questions about these Terms of Service, please contact us at support@zatix.com
                </p>
              </section>
            </div>

            <div className="mt-8 pt-8 border-t">
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
