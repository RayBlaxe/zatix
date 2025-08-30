"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Overview } from "./components/overview"
import { RecentSales } from "./components/recent-sales"
import { TicketSales } from "./components/ticket-sales"
import { RevenueMetrics } from "./components/revenue-metrics"
import { FinancialReports } from "./components/financial-reports"
import { CashFlow } from "./components/cash-flow"
import { BudgetAnalysis } from "./components/budget-analysis"
import { TaxSummary } from "./components/tax-summary"
import { ExportButton } from "./components/export-button"
import { SuperAdminFinance } from "./components/super-admin-finance"
import { useAuth } from "@/hooks/use-auth"

"use client"

import { ThreeTierFinancialDashboard } from "@/components/dashboard/three-tier-financial-dashboard"

export default function FinancePage() {
  return <ThreeTierFinancialDashboard />
}
