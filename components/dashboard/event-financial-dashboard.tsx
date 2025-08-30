"use client"

import { ThreeTierFinancialDashboard } from "@/components/dashboard/three-tier-financial-dashboard"

interface EventFinancialProps {
  eventId: number
}

export function EventFinancialDashboard({ eventId }: EventFinancialProps) {
  return <ThreeTierFinancialDashboard eventId={eventId} />
}
