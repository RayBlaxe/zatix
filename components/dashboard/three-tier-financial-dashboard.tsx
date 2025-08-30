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
  
  const [loading, setLoading] = useState(true)
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
  const dashboardLevel = eventId ? "event" : eoId ? "eo" : hasRole("super-admin") ? "global" : "eo"

  useEffect(() => {
    loadFinancialData()
  }, [eventId, eoId, dateRange, dashboardLevel])

  useEffect(() => {
    loadTransactions()
  }, [transactionFilter, eventId])

  const loadFinancialData = async () => {
    try {
      setLoading(true)
      let reportResponse
      let metricsResponse

      const params = dateRange.start_date && dateRange.end_date ? dateRange : undefined

      switch (dashboardLevel) {
        case "event":
          if (eventId) {
            reportResponse = await financialApi.getEventReport(eventId, params)
            metricsResponse = await financialApi.getFinancialMetrics({ event_id: eventId, ...params })
          }
          break
        case "eo":
          const currentEoId = eoId || user?.eoDetails?.id || 1
          reportResponse = await financialApi.getEOReport(currentEoId, params)
          metricsResponse = await financialApi.getFinancialMetrics({ eo_id: currentEoId, ...params })
          break
        case "global":
          reportResponse = await financialApi.getGlobalReport(params)
          metricsResponse = await financialApi.getFinancialMetrics(params)
          break
      }

      if (reportResponse) {
        setReportData(reportResponse.data)
      }
      if (metricsResponse) {
        setMetrics(metricsResponse.data)
      }

    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load financial data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const loadTransactions = async () => {
    try {
      const params: any = {
        page: transactionFilter.page,
        per_page: 10
      }

      if (eventId) params.event_id = eventId
      if (transactionFilter.status !== "all") params.status = transactionFilter.status
      if (transactionFilter.type !== "all") params.type = transactionFilter.type

      const response = await financialApi.getTransactions(params)
      setTransactions(response.data.data)
    } catch (error) {
      console.error("Failed to load transactions:", error)
    }
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
