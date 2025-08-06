"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3, CalendarDays, DollarSign, Users, CheckCircle, Shield, FileText, TrendingUp, Clock, AlertTriangle, Eye } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

export default function DashboardPage() {
  const { hasRole } = useAuth()

  // Super Admin Dashboard
  if (hasRole("super-admin")) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Super Admin Dashboard</h1>
          <p className="text-muted-foreground">Platform overview and administrative controls.</p>
        </div>

        {/* Key Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Platform Revenue</CardTitle>
              <DollarSign className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Rp 111.2M</div>
              <p className="text-xs text-muted-foreground">+18.2% from last month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active Organizers</CardTitle>
              <Users className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">9</div>
              <p className="text-xs text-muted-foreground">Out of 10 total</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Events</CardTitle>
              <CalendarDays className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">137</div>
              <p className="text-xs text-muted-foreground">19 events this month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pending Verifications</CardTitle>
              <AlertTriangle className="size-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">7</div>
              <p className="text-xs text-muted-foreground">Requires attention</p>
            </CardContent>
          </Card>
        </div>

        {/* Admin Sections */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Finance Summary */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="size-5" />
                  Finance Overview
                </CardTitle>
                <CardDescription>Platform financial summary and commission tracking</CardDescription>
              </div>
              <Link href="/dashboard/finance">
                <Button variant="outline" size="sm">
                  <Eye className="size-4 mr-2" />
                  View Details
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Total Commission</p>
                  <p className="text-2xl font-bold">Rp 11.1M</p>
                  <p className="text-xs text-muted-foreground">10% platform fee</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Monthly Growth</p>
                  <p className="text-2xl font-bold text-green-600">+18.2%</p>
                  <p className="text-xs text-muted-foreground">vs last month</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Top Performer:</span>
                  <span className="font-medium">Jakarta Music Festival</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Their Revenue:</span>
                  <span className="font-medium">Rp 27.5M</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Document Verification Summary */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="size-5" />
                  Document Verification
                </CardTitle>
                <CardDescription>Event organizer verification status and pending reviews</CardDescription>
              </div>
              <Link href="/dashboard/admin/verification">
                <Button variant="outline" size="sm">
                  <Eye className="size-4 mr-2" />
                  Review Queue
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-green-600">3</p>
                  <p className="text-xs text-muted-foreground">Verified</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-yellow-600">7</p>
                  <p className="text-xs text-muted-foreground">Pending</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-red-600">0</p>
                  <p className="text-xs text-muted-foreground">Rejected</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Urgent Reviews</span>
                  <Badge variant="destructive">3</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Avg Review Time</span>
                  <span className="text-sm font-medium">2.5 days</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {/* Terms & Conditions Summary */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="size-5" />
                  Terms & Conditions
                </CardTitle>
                <CardDescription>Platform policies and legal document management</CardDescription>
              </div>
              <Link href="/dashboard/tnc">
                <Button variant="outline" size="sm">
                  <Eye className="size-4 mr-2" />
                  Manage T&C
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Current Version</p>
                  <p className="text-xl font-bold">v2.1</p>
                  <p className="text-xs text-muted-foreground">Updated 15 days ago</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Acceptance Rate</p>
                  <p className="text-xl font-bold">98.5%</p>
                  <p className="text-xs text-muted-foreground">User compliance</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Pending Updates:</span>
                  <Badge variant="secondary">2</Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Last Review:</span>
                  <span className="font-medium">July 2025</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Content Management Summary */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="size-5" />
                  Content Management
                </CardTitle>
                <CardDescription>Homepage content, carousels, and featured events</CardDescription>
              </div>
              <Link href="/dashboard/content/home">
                <Button variant="outline" size="sm">
                  <Eye className="size-4 mr-2" />
                  Edit Content
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Featured Events</p>
                  <p className="text-xl font-bold">6</p>
                  <p className="text-xs text-muted-foreground">Active promotions</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Carousel Slides</p>
                  <p className="text-xl font-bold">4</p>
                  <p className="text-xs text-muted-foreground">Homepage banners</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Last Updated:</span>
                  <span className="font-medium">2 days ago</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Content Status:</span>
                  <Badge variant="default">Live</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Platform Activity</CardTitle>
            <CardDescription>Latest actions and events across the platform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="bg-green-100 p-2 rounded-full">
                  <CheckCircle className="size-4 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">EventCorp Indonesia documents verified</p>
                  <p className="text-xs text-muted-foreground">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="bg-blue-100 p-2 rounded-full">
                  <DollarSign className="size-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Commission payment processed: Rp 2.75M</p>
                  <p className="text-xs text-muted-foreground">5 hours ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="bg-yellow-100 p-2 rounded-full">
                  <Clock className="size-4 text-yellow-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">New verification request from Bali Creative Events</p>
                  <p className="text-xs text-muted-foreground">1 day ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="bg-purple-100 p-2 rounded-full">
                  <FileText className="size-4 text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Homepage carousel updated</p>
                  <p className="text-xs text-muted-foreground">2 days ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Regular Event Organizer Dashboard
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Welcome to your event organizer dashboard.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <CalendarDays className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1</div>
            <p className="text-xs text-muted-foreground">Free account limit: 1 event</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Attendees</CardTitle>
            <Users className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Free account limit: 10 attendees</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$0.00</div>
            <p className="text-xs text-muted-foreground">+0% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Account Status</CardTitle>
            <BarChart3 className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Free</div>
            <p className="text-xs text-muted-foreground">Upgrade for more features</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your recent activity on the platform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">No recent activity to display</div>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>Your account details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-1">
                <div className="text-sm font-medium">Account Type:</div>
                <div className="text-sm">Free</div>
              </div>
              <div className="grid grid-cols-2 gap-1">
                <div className="text-sm font-medium">Events Created:</div>
                <div className="text-sm">0/1</div>
              </div>
              <div className="grid grid-cols-2 gap-1">
                <div className="text-sm font-medium">Attendee Limit:</div>
                <div className="text-sm">10 per event</div>
              </div>
              <div className="grid grid-cols-2 gap-1">
                <div className="text-sm font-medium">Account Created:</div>
                <div className="text-sm">{new Date().toLocaleDateString()}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
