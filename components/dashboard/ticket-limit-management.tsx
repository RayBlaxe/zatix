"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Settings, 
  Shield, 
  AlertTriangle, 
  Users, 
  BarChart3,
  Eye,
  Save,
  Plus,
  Trash2,
  TrendingUp,
  Clock,
  CheckCircle
} from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"
import { ticketLimitsApi } from "@/lib/api"
import { cn } from "@/lib/utils"

interface TicketLimitManagementProps {
  eventId: number
  tickets: Array<{
    id: number
    name: string
    price: string
    stock: number
    limit: number
  }>
}

export function TicketLimitManagement({ eventId, tickets }: TicketLimitManagementProps) {
  const { hasRole } = useAuth()
  const { toast } = useToast()
  
  const [loading, setLoading] = useState(true)
  const [limitSettings, setLimitSettings] = useState<any>(null)
  const [ticketRules, setTicketRules] = useState<Record<number, any[]>>({})
  const [analytics, setAnalytics] = useState<any>(null)
  const [violations, setViolations] = useState<any[]>([])
  const [selectedTicket, setSelectedTicket] = useState<number | null>(null)

  useEffect(() => {
    loadLimitData()
  }, [eventId])

  const loadLimitData = async () => {
    try {
      setLoading(true)
      
      // Load event limit settings
      const settingsResponse = await ticketLimitsApi.getEventLimitSettings(eventId)
      if (settingsResponse.success) {
        setLimitSettings(settingsResponse.data)
      }

      // Load analytics
      const analyticsResponse = await ticketLimitsApi.getEventLimitOverview(eventId)
      if (analyticsResponse.success) {
        setAnalytics(analyticsResponse.data)
      }

      // Load ticket rules for each ticket
      const rulesPromises = tickets.map(async (ticket) => {
        const rulesResponse = await ticketLimitsApi.getTicketLimitRules(ticket.id)
        return { ticketId: ticket.id, rules: rulesResponse.success ? rulesResponse.data : [] }
      })
      
      const allRules = await Promise.all(rulesPromises)
      const rulesMap = allRules.reduce((acc, { ticketId, rules }) => {
        acc[ticketId] = rules
        return acc
      }, {} as Record<number, any[]>)
      setTicketRules(rulesMap)

      // Load violations
      const violationsResponse = await ticketLimitsApi.getLimitViolations({ event_id: eventId })
      if (violationsResponse.success) {
        setViolations(violationsResponse.data.data)
      }

    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load ticket limit data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const updateEventSettings = async (updates: Partial<any>) => {
    try {
      const response = await ticketLimitsApi.updateEventLimitSettings(eventId, updates)
      if (response.success) {
        setLimitSettings(response.data)
        toast({
          title: "Settings Updated",
          description: "Event limit settings have been updated successfully",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update settings",
        variant: "destructive",
      })
    }
  }

  const updateTicketRules = async (ticketId: number, rules: any[]) => {
    try {
      const response = await ticketLimitsApi.setTicketLimitRules(ticketId, rules)
      if (response.success) {
        setTicketRules(prev => ({ ...prev, [ticketId]: response.data }))
        toast({
          title: "Rules Updated",
          description: "Ticket limit rules have been updated successfully",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update ticket rules",
        variant: "destructive",
      })
    }
  }

  const getViolationBadgeVariant = (count: number) => {
    if (count === 0) return "default"
    if (count < 5) return "secondary" 
    return "destructive"
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("id-ID")
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-1/3 mb-4"></div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-300 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Ticket Limit Management</h2>
          <p className="text-muted-foreground">Configure and monitor ticket purchase limits</p>
        </div>
        <Button onClick={loadLimitData} variant="outline">
          <Eye className="h-4 w-4 mr-2" />
          Refresh Data
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tickets</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.total_tickets || 0}</div>
            <p className="text-xs text-muted-foreground">
              {analytics?.tickets_with_limits || 0} with limits
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Limit Violations</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {analytics?.total_limit_violations || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Across all tickets
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Most Limited</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-bold">
              {analytics?.most_limited_ticket?.name || "None"}
            </div>
            <p className="text-xs text-muted-foreground">
              {analytics?.most_limited_ticket?.usage_percentage}% usage
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Settings Status</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm">Active</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Limits enforced
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="settings" className="space-y-4">
        <TabsList>
          <TabsTrigger value="settings">Global Settings</TabsTrigger>
          <TabsTrigger value="tickets">Ticket Rules</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="violations">Violations</TabsTrigger>
        </TabsList>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Event Limit Settings</CardTitle>
              <CardDescription>
                Configure global limit enforcement for this event
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {limitSettings && (
                <>
                  {/* Enable/Disable Toggles */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">Per-Order Limits</Label>
                        <p className="text-sm text-muted-foreground">
                          Limit how many tickets can be purchased in a single order
                        </p>
                      </div>
                      <Switch
                        checked={limitSettings.enable_per_order_limits}
                        onCheckedChange={(checked) => 
                          updateEventSettings({ enable_per_order_limits: checked })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">Cumulative Limits</Label>
                        <p className="text-sm text-muted-foreground">
                          Limit total tickets a user can purchase across all orders
                        </p>
                      </div>
                      <Switch
                        checked={limitSettings.enable_cumulative_limits}
                        onCheckedChange={(checked) => 
                          updateEventSettings({ enable_cumulative_limits: checked })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">Daily Limits</Label>
                        <p className="text-sm text-muted-foreground">
                          Limit tickets a user can purchase per day
                        </p>
                      </div>
                      <Switch
                        checked={limitSettings.enable_daily_limits}
                        onCheckedChange={(checked) => 
                          updateEventSettings({ enable_daily_limits: checked })
                        }
                      />
                    </div>
                  </div>

                  {/* Default Limits */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="per_order_limit">Default Per-Order Limit</Label>
                      <Input
                        id="per_order_limit"
                        type="number"
                        min="1"
                        value={limitSettings.default_per_order_limit}
                        onChange={(e) => 
                          updateEventSettings({ 
                            default_per_order_limit: parseInt(e.target.value) || 1 
                          })
                        }
                        disabled={!limitSettings.enable_per_order_limits}
                      />
                    </div>

                    <div>
                      <Label htmlFor="cumulative_limit">Default Cumulative Limit</Label>
                      <Input
                        id="cumulative_limit"
                        type="number"
                        min="1"
                        value={limitSettings.default_cumulative_limit}
                        onChange={(e) => 
                          updateEventSettings({ 
                            default_cumulative_limit: parseInt(e.target.value) || 1 
                          })
                        }
                        disabled={!limitSettings.enable_cumulative_limits}
                      />
                    </div>

                    <div>
                      <Label htmlFor="daily_limit">Default Daily Limit</Label>
                      <Input
                        id="daily_limit"
                        type="number"
                        min="1"
                        value={limitSettings.default_daily_limit}
                        onChange={(e) => 
                          updateEventSettings({ 
                            default_daily_limit: parseInt(e.target.value) || 1 
                          })
                        }
                        disabled={!limitSettings.enable_daily_limits}
                      />
                    </div>
                  </div>

                  {/* Grace Period */}
                  <div>
                    <Label htmlFor="grace_period">Grace Period (minutes)</Label>
                    <Input
                      id="grace_period"
                      type="number"
                      min="0"
                      value={limitSettings.grace_period_minutes}
                      onChange={(e) => 
                        updateEventSettings({ 
                          grace_period_minutes: parseInt(e.target.value) || 0 
                        })
                      }
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      Time buffer before limits are enforced for repeat purchases
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tickets">
          <Card>
            <CardHeader>
              <CardTitle>Individual Ticket Rules</CardTitle>
              <CardDescription>
                Configure specific limits for each ticket type
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tickets.map((ticket) => (
                  <div key={ticket.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="font-medium">{ticket.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          Price: {new Intl.NumberFormat('id-ID', {
                            style: 'currency',
                            currency: 'IDR'
                          }).format(parseFloat(ticket.price))} • Stock: {ticket.stock}
                        </p>
                      </div>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedTicket(ticket.id)}
                          >
                            <Settings className="h-4 w-4 mr-2" />
                            Configure
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Configure Limits for {ticket.name}</DialogTitle>
                            <DialogDescription>
                              Set specific purchase limits for this ticket type
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            {/* Rules configuration would go here */}
                            <p className="text-sm text-muted-foreground">
                              Advanced rule configuration interface coming soon...
                            </p>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                    
                    {/* Current Rules Display */}
                    <div className="flex flex-wrap gap-2">
                      {(ticketRules[ticket.id] || []).map((rule: any, index: number) => (
                        <Badge 
                          key={index} 
                          variant={rule.is_active ? "default" : "secondary"}
                        >
                          {rule.limit_type}: {rule.limit_value}
                          {!rule.is_active && " (inactive)"}
                        </Badge>
                      ))}
                      {(!ticketRules[ticket.id] || ticketRules[ticket.id].length === 0) && (
                        <Badge variant="outline">No specific rules</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Limit Usage Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics?.limit_analytics?.map((item: any) => (
                    <div key={item.ticket_id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{item.ticket_name}</span>
                        <span className="text-sm text-muted-foreground">
                          {item.usage_percentage}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full" 
                          style={{ width: `${Math.min(item.usage_percentage, 100)}%` }}
                        ></div>
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Limit: {item.limit_value}</span>
                        <span>Violations: {item.violations_count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Top Violators
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics?.limit_analytics?.flatMap((item: any) => 
                    item.top_violators.map((violator: any) => (
                      <div key={`${item.ticket_id}-${violator.user_id}`} className="flex items-center justify-between p-2 border rounded">
                        <div>
                          <div className="font-medium text-sm">{violator.user_name}</div>
                          <div className="text-xs text-muted-foreground">{item.ticket_name}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">
                            Tried: {violator.attempted_quantity}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {formatDateTime(violator.violation_date)}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="violations">
          <Card>
            <CardHeader>
              <CardTitle>Recent Violations</CardTitle>
              <CardDescription>
                Monitor attempts to exceed ticket limits
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {violations.map((violation: any) => (
                  <div key={violation.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{violation.user_name}</span>
                        <Badge variant={getViolationBadgeVariant(1)}>
                          Violation
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <p>{violation.event_name} • {violation.ticket_name}</p>
                        <p>Attempted: {violation.attempted_quantity}, Limit: {violation.limit_value}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        {violation.limit_type}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatDateTime(violation.violation_date)}
                      </div>
                    </div>
                  </div>
                ))}
                {violations.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No violations detected</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
