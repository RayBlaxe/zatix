"use client"

import { TNCManagement } from "@/components/dashboard/tnc-management"

export default function TNCPage() {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Terms and Conditions</h1>
        <p className="text-muted-foreground">
          Manage terms and conditions for event organizers and general platform usage.
        </p>
      </div>

      <TNCManagement />
    </div>
  )
}