"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Calendar, 
  Download, 
  Filter,
  BarChart3,
  PieChart,
  Activity,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"
import { financialApi } from "@/lib/api"
import { cn } from "@/lib/utils"

interface ThreeTierFinancialDashboardProps {
  eventId?: number // If provided, shows event-specific dashboard
  eoId?: number    // If provided, shows EO-specific dashboard
}

export function ThreeTierFinancialDashboard({ eventId, eoId }: ThreeTierFinancialDashboardProps) {
  const { user, hasRole } = useAuth()
  const { toast } = useToast()
  
  // Development flag - set to true to use mock data when backend is not ready
  const USE_MOCK_DATA = true // Always use mock data since backend endpoints don't exist yet
  
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reportData, setReportData] = useState<any>(null)
  const [transactions, setTransactions] = useState<any[]>([])
  const [metrics, setMetrics] = useState<any>(null)
  const [dateRange, setDateRange] = useState({
    start_date: "",
    end_date: ""
  })
  const [transactionFilter, setTransactionFilter] = useState({
    status: "all",
    type: "all",
    page: 1
  })

  // Determine dashboard level based on props and user role
  const getDashboardLevel = () => {
    // If specific event or EO is provided, use that level
    if (eventId) return "event"
    if (eoId) return "eo"
    
    // Otherwise, determine based on user role
    if (hasRole("super-admin")) return "global" // Super admin sees global by default
    if (hasRole("finance")) return "global" // Finance sees global by default
    if (hasRole("eo-owner")) return "eo" // EO owner sees their own EO data
    
    // Default to EO level for other roles
    return "eo"
  }
  
  const dashboardLevel = getDashboardLevel()

  // Check if user has permission to access financial data
  const canAccessFinancialData = () => {
    if (!user || !user.roles || !Array.isArray(user.roles)) {
      console.warn("Financial Dashboard: User or roles not available", { user, roles: user?.roles })
      return false
    }
    
    // Allow access for these roles
    const allowedRoles = ["super-admin", "finance", "eo-owner"]
    const hasAccess = allowedRoles.some(role => hasRole(role as any))
    
    console.log("Financial Dashboard Access Check:", {
      userRoles: user.roles,
      allowedRoles,
      hasAccess,
      dashboardLevel
    })
    
    return hasAccess
  }

  useEffect(() => {
    // Only load data if user has permission
    if (canAccessFinancialData()) {
      loadFinancialData()
    } else {
      setLoading(false)
    }
  }, [eventId, eoId, dateRange, dashboardLevel])

  useEffect(() => {
    // Only load transactions if user has permission
    if (canAccessFinancialData()) {
      loadTransactions()
    }
  }, [transactionFilter, eventId])

  // Mock data generator for development/fallback
  const generateMockData = (level: string) => {
    const baseMetrics = {
      totalRevenue: 2450000,
      totalTransactions: 67,
      successfulTransactions: 61,
      pendingTransactions: 4,
      failedTransactions: 2,
      averageTransactionValue: 36567,
      revenueGrowth: 15.5,
      transactionGrowth: 8.2,
      topEvents: [
        { eventId: 1, eventName: "Workshop Fotografi", revenue: 900000, ticketsSold: 18 },
        { eventId: 2, eventName: "Seminar Digital Marketing", revenue: 800000, ticketsSold: 24 },
        { eventId: 3, eventName: "Music Concert Night", revenue: 750000, ticketsSold: 25 }
      ]
    }

    const baseReport = {
      summary: {
        total_income: 2450000,
        total_expenses: 480000,
        net_profit: 1970000,
        tickets_sold: 67,
        ticket_sales: 2450000,
        other_income: 0
      }
    }

    switch (level) {
      case "global":
        return {
          report: {
            ...baseReport,
            eo_breakdowns: [
              { id: 1, name: "EventCorp Indonesia", total_events: 15, subtotal_net_profit: 1500000, subtotal_tickets_sold: 120, subtotal_income: 2000000 },
              { id: 2, name: "Jakarta Music Festival", total_events: 8, subtotal_net_profit: 1200000, subtotal_tickets_sold: 85, subtotal_income: 1600000 },
              { id: 3, name: "Bali Creative Events", total_events: 12, subtotal_net_profit: 800000, subtotal_tickets_sold: 95, subtotal_income: 1100000 }
            ]
          },
          metrics: baseMetrics
        }
      case "eo":
        return {
          report: {
            ...baseReport,
            event_organizer: { id: eoId || parseInt(user?.id || "1"), name: user?.eoDetails?.name || "Your Organization" },
            event_breakdowns: [
              { id: 1, name: "Workshop Fotografi: Teknik Dasar", total_income: 900000, total_expenses: 150000, net_profit: 750000, tickets_sold: 18 },
              { id: 2, name: "Seminar Digital Marketing", total_income: 800000, total_expenses: 180000, net_profit: 620000, tickets_sold: 24 },
              { id: 3, name: "Music Concert Night", total_income: 750000, total_expenses: 150000, net_profit: 600000, tickets_sold: 25 }
            ]
          },
          metrics: baseMetrics
        }
      case "event":
        return {
          report: {
            event: { id: eventId || 1, name: "Sample Event" },
            summary: baseReport.summary
          },
          metrics: baseMetrics
        }
      default:
        return { report: baseReport, metrics: baseMetrics }
    }
  }

  const loadFinancialData = async () => {
    // Check permissions before making API calls
    if (!canAccessFinancialData()) {
      setError("You don't have permission to access financial data")
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null) // Clear any previous errors
      
      // Skip API calls and use mock data directly since backend endpoints are not properly configured
      console.log("Using mock data - backend financial endpoints are not configured for authentication")
      const mockData = generateMockData(dashboardLevel)
      setReportData(mockData.report)
      setMetrics(mockData.metrics)
      
      toast({
        title: "Demo Financial Dashboard",
        description: "Showing demo data. Backend financial API is not configured yet.",
        variant: "default",
      })

      // Uncomment below when backend financial endpoints are properly configured
      /*
      let reportResponse
      let metricsResponse

      const params = dateRange.start_date && dateRange.end_date ? dateRange : undefined

      switch (dashboardLevel) {
        case "event":
          if (eventId) {
            try {
              reportResponse = await financialApi.getEventReport(eventId, params)
              metricsResponse = await financialApi.getFinancialMetrics({ event_id: eventId, ...params })
            } catch (error: any) {
              console.error("Error loading event financial data:", error)
              setError("Event financial data is not available. This feature may not be implemented yet.")
            }
          }
          break
        case "eo":
          // For EO level, use provided eoId or default to user's primary EO (could be user ID or 1)
          const currentEoId = eoId || parseInt(user?.id || "1")
          
          // Only allow EO owners to access their own data, or super-admin/finance to access any EO
          if (hasRole("eo-owner") && !hasRole("super-admin") && !hasRole("finance")) {
            // EO owners can only see their own data
            try {
              reportResponse = await financialApi.getEOReport(currentEoId, params)
              metricsResponse = await financialApi.getFinancialMetrics({ eo_id: currentEoId, ...params })
            } catch (error: any) {
              console.error("Error loading EO financial data:", error)
              setError("EO financial data is not available. Please contact support if you believe this is an error.")
            }
          } else if (hasRole("super-admin") || hasRole("finance")) {
            // Super admin and finance can access any EO data
            try {
              reportResponse = await financialApi.getEOReport(currentEoId, params)
              metricsResponse = await financialApi.getFinancialMetrics({ eo_id: currentEoId, ...params })
            } catch (error: any) {
              console.error("Error loading EO financial data:", error)
              setError("EO financial data is not available. This feature may not be implemented yet.")
            }
          }
          break
        case "global":
          // Only super-admin and finance can access global reports
          if (hasRole("super-admin") || hasRole("finance")) {
            try {
              reportResponse = await financialApi.getGlobalReport(params)
              metricsResponse = await financialApi.getFinancialMetrics(params)
            } catch (error: any) {
              console.error("Error loading global financial data:", error)
              setError("Global financial data is not available. This feature may not be implemented yet.")
            }
          } else {
            setError("You don't have permission to access global financial reports")
            setLoading(false)
            return
          }
          break
      }

      if (reportResponse && reportResponse.success) {
        setReportData(reportResponse.data)
      }
      if (metricsResponse && metricsResponse.success) {
        setMetrics(metricsResponse.data)
      }
      */

    } catch (error: any) {
      console.error("Error loading financial data:", error)
      
      // Use mock data as fallback for any error
      const mockData = generateMockData(dashboardLevel)
      setReportData(mockData.report)
      setMetrics(mockData.metrics)
      
      toast({
        title: "Using Demo Data",
        description: "Financial API authentication not configured. Showing demo data.",
        variant: "default",
      })
    } finally {
      setLoading(false)
    }
  }

  const loadTransactions = async () => {
    // Check permissions before making API calls
    if (!canAccessFinancialData()) {
      return
    }

    // Skip API calls and use mock transaction data directly
    // since backend financial/transaction endpoints are not properly configured
    const mockTransactions = [
      { id: 1, event_name: "Workshop Fotografi", amount: 50000, status: "success", created_at: "2025-08-01T10:00:00Z", user_name: "John Doe" },
      { id: 2, event_name: "Seminar Digital Marketing", amount: 75000, status: "success", created_at: "2025-08-02T14:30:00Z", user_name: "Jane Smith" },
      { id: 3, event_name: "Music Concert Night", amount: 120000, status: "pending", created_at: "2025-08-03T16:45:00Z", user_name: "Bob Wilson" },
      { id: 4, event_name: "Workshop Fotografi", amount: 50000, status: "failed", created_at: "2025-08-04T09:15:00Z", user_name: "Alice Brown" },
      { id: 5, event_name: "Business Conference", amount: 200000, status: "success", created_at: "2025-08-05T11:20:00Z", user_name: "Mike Johnson" },
      { id: 6, event_name: "Art Exhibition", amount: 85000, status: "success", created_at: "2025-08-06T13:00:00Z", user_name: "Sarah Davis" },
      { id: 7, event_name: "Tech Meetup", amount: 35000, status: "pending", created_at: "2025-08-07T18:30:00Z", user_name: "Chris Lee" }
    ]
    
    // Filter based on transaction filter settings
    let filteredTransactions = mockTransactions
    
    if (transactionFilter.status !== "all") {
      filteredTransactions = filteredTransactions.filter(t => t.status === transactionFilter.status)
    }
    
    // Simple pagination simulation
    const startIndex = (transactionFilter.page - 1) * 10
    const endIndex = startIndex + 10
    filteredTransactions = filteredTransactions.slice(startIndex, endIndex)
    
    setTransactions(filteredTransactions)

    // Uncomment below when backend transaction endpoints are properly configured
    /*
    try {
      const params: any = {
        page: transactionFilter.page,
        per_page: 10
      }

      if (eventId) params.event_id = eventId
      if (transactionFilter.status !== "all") params.status = transactionFilter.status
      if (transactionFilter.type !== "all") params.type = transactionFilter.type

      const response = await financialApi.getTransactions(params)
      
      // Check if response has the expected structure
      if (response && response.data && response.data.data) {
        setTransactions(response.data.data)
      } else {
        console.warn("Unexpected transaction response structure:", response)
        setTransactions([])
      }
    } catch (error: any) {
      console.error("Failed to load transactions:", error)
      setTransactions([])
    }
    */
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(amount)
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "success":
        return "default"
      case "pending":
        return "secondary"
      case "failed":
        return "destructive"
      default:
        return "outline"
    }
  }

  const getGrowthIcon = (growth: number) => {
    return growth >= 0 ? (
      <ArrowUpRight className="h-4 w-4 text-green-500" />
    ) : (
      <ArrowDownRight className="h-4 w-4 text-red-500" />
    )
  }

  const exportReport = () => {
    // Export functionality
    toast({
      title: "Export Started",
      description: "Financial report export will be available for download shortly",
    })
  }

  // Check if user has access to financial data
  if (!canAccessFinancialData()) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-xl text-red-600">Access Denied</CardTitle>
            <CardDescription>
              You don't have permission to access financial data. 
              {user?.roles && user.roles.length > 0 
                ? ` Your current roles: ${user.roles.join(', ')}`
                : " Please ensure you are logged in with the correct account."
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-muted-foreground mb-2">
              Required roles: Super Admin, Finance, or EO Owner
            </p>
            {user?.roles && user.roles.length > 0 && (
              <p className="text-xs text-gray-500">
                Debug: Current roles - {user.roles.join(', ')}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-300 rounded w-1/3"></div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-300 rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-300 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            {dashboardLevel === "event" ? "Event Financial Dashboard" :
             dashboardLevel === "eo" ? "EO Financial Dashboard" :
             "Global Financial Dashboard"}
          </h2>
          <p className="text-muted-foreground">
            {reportData?.event?.name || reportData?.event_organizer?.name || "Platform-wide financial overview"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={exportReport}>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Demo Data Banner */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader className="pb-3">
          <CardTitle className="text-blue-800 flex items-center gap-2 text-lg">
            <BarChart3 className="h-5 w-5" />
            Demo Financial Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-blue-700 text-sm mb-2">
            This dashboard is currently showing demo data. The backend financial API endpoints are not yet configured for authentication.
          </p>
          <div className="text-xs text-blue-600">
            <strong>Current Access Level:</strong> {dashboardLevel === "global" ? "Global (All Organizations)" : dashboardLevel === "eo" ? "Organization Level" : "Event Level"} •
            <strong> User Role:</strong> {user?.roles?.join(", ") || "Unknown"}
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800 flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Error Loading Financial Data
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-700">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Date Range Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Report Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="start_date">Start Date</Label>
              <Input
                id="start_date"
                type="date"
                value={dateRange.start_date}
                onChange={(e) => setDateRange(prev => ({ ...prev, start_date: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="end_date">End Date</Label>
              <Input
                id="end_date"
                type="date"
                value={dateRange.end_date}
                onChange={(e) => setDateRange(prev => ({ ...prev, end_date: e.target.value }))}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={loadFinancialData} className="w-full">
                Apply Filter
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(reportData?.summary?.total_income || 0)}
            </div>
            {metrics?.revenueGrowth !== undefined && (
              <div className="flex items-center text-xs text-muted-foreground">
                {getGrowthIcon(metrics.revenueGrowth)}
                <span className={cn("ml-1", metrics.revenueGrowth >= 0 ? "text-green-500" : "text-red-500")}>
                  {Math.abs(metrics.revenueGrowth)}% from last period
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(reportData?.summary?.net_profit || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Expenses: {formatCurrency(reportData?.summary?.total_expenses || 0)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tickets Sold</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reportData?.summary?.tickets_sold || 0}
            </div>
            {metrics?.transactionGrowth !== undefined && (
              <div className="flex items-center text-xs text-muted-foreground">
                {getGrowthIcon(metrics.transactionGrowth)}
                <span className={cn("ml-1", metrics.transactionGrowth >= 0 ? "text-green-500" : "text-red-500")}>
                  {Math.abs(metrics.transactionGrowth)}% from last period
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Transaction</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(metrics?.averageTransactionValue || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Total: {metrics?.totalTransactions || 0} transactions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          {(dashboardLevel === "eo" || dashboardLevel === "global") && (
            <TabsTrigger value="breakdown">Breakdown</TabsTrigger>
          )}
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Transaction Status Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Transaction Status</CardTitle>
                <CardDescription>Distribution of transaction statuses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm">Successful</span>
                    </div>
                    <div className="text-sm font-medium">
                      {metrics?.successfulTransactions || 0} ({((metrics?.successfulTransactions || 0) / (metrics?.totalTransactions || 1) * 100).toFixed(1)}%)
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <span className="text-sm">Pending</span>
                    </div>
                    <div className="text-sm font-medium">
                      {metrics?.pendingTransactions || 0} ({((metrics?.pendingTransactions || 0) / (metrics?.totalTransactions || 1) * 100).toFixed(1)}%)
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span className="text-sm">Failed</span>
                    </div>
                    <div className="text-sm font-medium">
                      {metrics?.failedTransactions || 0} ({((metrics?.failedTransactions || 0) / (metrics?.totalTransactions || 1) * 100).toFixed(1)}%)
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Top Events */}
            {metrics?.topEvents && (
              <Card>
                <CardHeader>
                  <CardTitle>Top Performing Events</CardTitle>
                  <CardDescription>Events with highest revenue</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {metrics.topEvents.slice(0, 5).map((event: any, index: number) => (
                      <div key={event.eventId} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-xs font-medium">
                            {index + 1}
                          </div>
                          <span className="text-sm font-medium">{event.eventName}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">{formatCurrency(event.revenue)}</div>
                          <div className="text-xs text-muted-foreground">{event.ticketsSold} tickets</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent Transactions</CardTitle>
                  <CardDescription>Latest payment transactions</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Select 
                    value={transactionFilter.status} 
                    onValueChange={(value) => setTransactionFilter(prev => ({ ...prev, status: value }))}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="success">Success</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select 
                    value={transactionFilter.type} 
                    onValueChange={(value) => setTransactionFilter(prev => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="transfer">Bank Transfer</SelectItem>
                      <SelectItem value="credit_card">Credit Card</SelectItem>
                      <SelectItem value="ewallet">E-Wallet</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {transactions.map((transaction: any) => (
                  <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col">
                        <span className="font-medium">{transaction.user?.name}</span>
                        <span className="text-sm text-muted-foreground">{transaction.order_id}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{transaction.event?.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(transaction.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="font-medium">{formatCurrency(transaction.grand_amount)}</div>
                        <div className="text-xs text-muted-foreground capitalize">{transaction.type}</div>
                      </div>
                      <Badge variant={getStatusBadgeVariant(transaction.status)}>
                        {transaction.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {(dashboardLevel === "eo" || dashboardLevel === "global") && (
          <TabsContent value="breakdown">
            <Card>
              <CardHeader>
                <CardTitle>
                  {dashboardLevel === "eo" ? "Event Breakdown" : "EO Breakdown"}
                </CardTitle>
                <CardDescription>
                  {dashboardLevel === "eo" ? "Performance breakdown by event" : "Performance breakdown by event organizer"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(reportData?.event_breakdowns || reportData?.eo_breakdowns)?.map((item: any) => (
                    <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{item.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {dashboardLevel === "eo" ? 
                            `${item.tickets_sold} tickets sold` : 
                            `${item.total_events} events • ${item.subtotal_tickets_sold} tickets`
                          }
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">
                          {formatCurrency(item.net_profit || item.subtotal_net_profit)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Revenue: {formatCurrency(item.total_income || item.subtotal_income)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        <TabsContent value="analytics">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Revenue Analytics
                </CardTitle>
                <CardDescription>Revenue trends and patterns</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Revenue charts coming soon</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Payment Method Distribution
                </CardTitle>
                <CardDescription>Payment methods used by customers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <PieChart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Payment distribution charts coming soon</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
