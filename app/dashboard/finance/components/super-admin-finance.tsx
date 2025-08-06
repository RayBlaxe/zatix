"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DollarSign, TrendingUp, Users, Calendar, Download, Eye } from "lucide-react"
import { useState } from "react"

// Mock data for event organizers
const eventOrganizers = [
  {
    id: 1,
    name: "EventCorp Indonesia",
    email: "admin@eventcorp.id",
    totalEvents: 15,
    totalTicketsSold: 12450,
    totalRevenue: 156750000,
    commission: 15675000,
    lastEventDate: "2025-07-28",
    status: "active",
    eventsThisMonth: 3,
    revenueGrowth: 25.5
  },
  {
    id: 2,
    name: "Jakarta Music Festival",
    email: "info@jakartamusic.com",
    totalEvents: 8,
    totalTicketsSold: 18500,
    totalRevenue: 275000000,
    commission: 27500000,
    lastEventDate: "2025-07-30",
    status: "active",
    eventsThisMonth: 2,
    revenueGrowth: 18.2
  },
  {
    id: 3,
    name: "Bali Creative Events",
    email: "hello@balicreative.co.id",
    totalEvents: 22,
    totalTicketsSold: 9850,
    totalRevenue: 89250000,
    commission: 8925000,
    lastEventDate: "2025-07-25",
    status: "active",
    eventsThisMonth: 4,
    revenueGrowth: -5.3
  },
  {
    id: 4,
    name: "Tech Conference Asia",
    email: "organizer@techasia.events",
    totalEvents: 6,
    totalTicketsSold: 3200,
    totalRevenue: 128000000,
    commission: 12800000,
    lastEventDate: "2025-07-20",
    status: "active",
    eventsThisMonth: 1,
    revenueGrowth: 42.1
  },
  {
    id: 5,
    name: "Surabaya Arts Collective",
    email: "contact@sbyarts.org",
    totalEvents: 19,
    totalTicketsSold: 7650,
    totalRevenue: 45900000,
    commission: 4590000,
    lastEventDate: "2025-07-22",
    status: "active",
    eventsThisMonth: 2,
    revenueGrowth: 12.7
  },
  {
    id: 6,
    name: "Bandung Food Festival",
    email: "admin@bandungfood.id",
    totalEvents: 12,
    totalTicketsSold: 15200,
    totalRevenue: 76000000,
    commission: 7600000,
    lastEventDate: "2025-07-15",
    status: "active",
    eventsThisMonth: 1,
    revenueGrowth: 8.9
  },
  {
    id: 7,
    name: "Medan Sports Arena",
    email: "info@medansports.com",
    totalEvents: 9,
    totalTicketsSold: 11300,
    totalRevenue: 162400000,
    commission: 16240000,
    lastEventDate: "2025-07-18",
    status: "active",
    eventsThisMonth: 2,
    revenueGrowth: 35.6
  },
  {
    id: 8,
    name: "Yogya Cultural Center",
    email: "culture@yogya.events",
    totalEvents: 25,
    totalTicketsSold: 8900,
    totalRevenue: 53400000,
    commission: 5340000,
    lastEventDate: "2025-07-12",
    status: "active",
    eventsThisMonth: 3,
    revenueGrowth: 6.4
  },
  {
    id: 9,
    name: "Semarang Business Expo",
    email: "expo@semarangbiz.co.id",
    totalEvents: 7,
    totalTicketsSold: 4200,
    totalRevenue: 84000000,
    commission: 8400000,
    lastEventDate: "2025-07-10",
    status: "active",
    eventsThisMonth: 1,
    revenueGrowth: 15.8
  },
  {
    id: 10,
    name: "Makassar Entertainment",
    email: "events@makassar-ent.id",
    totalEvents: 14,
    totalTicketsSold: 6750,
    totalRevenue: 40500000,
    commission: 4050000,
    lastEventDate: "2025-07-08",
    status: "inactive",
    eventsThisMonth: 0,
    revenueGrowth: -12.1
  }
]

// Calculate totals
const totalRevenue = eventOrganizers.reduce((sum, org) => sum + org.totalRevenue, 0)
const totalCommission = eventOrganizers.reduce((sum, org) => sum + org.commission, 0)
const totalTicketsSold = eventOrganizers.reduce((sum, org) => sum + org.totalTicketsSold, 0)
const totalEvents = eventOrganizers.reduce((sum, org) => sum + org.totalEvents, 0)
const activeOrganizers = eventOrganizers.filter(org => org.status === "active").length

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount)
}

const formatNumber = (num: number) => {
  return new Intl.NumberFormat('id-ID').format(num)
}

export function SuperAdminFinance() {
  const [selectedTab, setSelectedTab] = useState("overview")

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Super Admin Finance Dashboard</h2>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 lg:w-[600px]">
          <TabsTrigger value="overview">Platform Overview</TabsTrigger>
          <TabsTrigger value="organizers">Event Organizers</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Platform Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
                <p className="text-xs text-muted-foreground">
                  +18.2% from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Commission</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(totalCommission)}</div>
                <p className="text-xs text-muted-foreground">
                  Platform revenue (10%)
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Organizers</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{activeOrganizers}</div>
                <p className="text-xs text-muted-foreground">
                  Out of {eventOrganizers.length} total
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Events</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalEvents}</div>
                <p className="text-xs text-muted-foreground">
                  All-time events hosted
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tickets Sold</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNumber(totalTicketsSold)}</div>
                <p className="text-xs text-muted-foreground">
                  Total platform sales
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Top Performing Organizers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {eventOrganizers
                    .sort((a, b) => b.totalRevenue - a.totalRevenue)
                    .slice(0, 5)
                    .map((organizer) => (
                      <div key={organizer.id} className="flex items-center space-x-4">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback>
                            {organizer.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-1">
                          <p className="text-sm font-medium leading-none">{organizer.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatCurrency(organizer.totalRevenue)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">{organizer.totalEvents} events</p>
                          <p className="text-xs text-muted-foreground">{formatNumber(organizer.totalTicketsSold)} tickets</p>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {eventOrganizers
                    .sort((a, b) => new Date(b.lastEventDate).getTime() - new Date(a.lastEventDate).getTime())
                    .slice(0, 5)
                    .map((organizer) => (
                      <div key={organizer.id} className="flex items-center space-x-4">
                        <div className="flex-1 space-y-1">
                          <p className="text-sm font-medium leading-none">{organizer.name}</p>
                          <p className="text-xs text-muted-foreground">
                            Last event: {new Date(organizer.lastEventDate).toLocaleDateString('id-ID')}
                          </p>
                        </div>
                        <Badge variant={organizer.status === "active" ? "default" : "secondary"}>
                          {organizer.status}
                        </Badge>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="organizers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Event Organizers Financial Overview</CardTitle>
              <p className="text-sm text-muted-foreground">
                Complete financial breakdown of all event organizers on the platform
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {eventOrganizers.map((organizer) => (
                  <div key={organizer.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>
                            {organizer.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold">{organizer.name}</h3>
                          <p className="text-sm text-muted-foreground">{organizer.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={organizer.status === "active" ? "default" : "secondary"}>
                          {organizer.status}
                        </Badge>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          Details
                        </Button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Total Events</p>
                        <p className="font-semibold">{organizer.totalEvents}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Events This Month</p>
                        <p className="font-semibold">{organizer.eventsThisMonth}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Tickets Sold</p>
                        <p className="font-semibold">{formatNumber(organizer.totalTicketsSold)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Total Revenue</p>
                        <p className="font-semibold">{formatCurrency(organizer.totalRevenue)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Our Commission</p>
                        <p className="font-semibold">{formatCurrency(organizer.commission)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Growth</p>
                        <p className={`font-semibold ${organizer.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {organizer.revenueGrowth >= 0 ? '+' : ''}{organizer.revenueGrowth}%
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-xs text-muted-foreground">
                      Last event: {new Date(organizer.lastEventDate).toLocaleDateString('id-ID', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold">{formatCurrency(totalCommission)}</p>
                    <p className="text-sm text-muted-foreground">Total Platform Commission</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Platform Revenue (10%)</span>
                      <span className="font-medium">{formatCurrency(totalCommission)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Organizer Revenue (90%)</span>
                      <span className="font-medium">{formatCurrency(totalRevenue - totalCommission)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <p className="text-lg font-bold">{(totalRevenue / totalEvents).toFixed(0)}</p>
                      <p className="text-xs text-muted-foreground">Avg Revenue/Event</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold">{(totalTicketsSold / totalEvents).toFixed(0)}</p>
                      <p className="text-xs text-muted-foreground">Avg Tickets/Event</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <p className="text-lg font-bold">{formatCurrency(totalRevenue / totalTicketsSold)}</p>
                      <p className="text-xs text-muted-foreground">Avg Ticket Price</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold">{(totalEvents / eventOrganizers.length).toFixed(1)}</p>
                      <p className="text-xs text-muted-foreground">Avg Events/Organizer</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
