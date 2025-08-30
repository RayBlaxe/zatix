'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Users, 
  Crown, 
  UserCheck, 
  DollarSign, 
  ShoppingCart, 
  Settings,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Info,
  Play
} from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/hooks/use-auth'
import { eventApi, staffApi } from '@/lib/api'

export default function EventPICTestingPage() {
  const { user, hasRole } = useAuth()
  const [events, setEvents] = useState<any[]>([])
  const [staff, setStaff] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTestingData()
  }, [])

  const loadTestingData = async () => {
    try {
      // Load events and staff for testing
      const [eventsResponse, staffResponse] = await Promise.all([
        eventApi.getMyEvents(1, {}),
        staffApi.getStaff(1)
      ])
      
      setEvents(eventsResponse.data?.data || [])
      setStaff(Array.isArray(staffResponse) ? staffResponse : staffResponse.data?.data || [])
    } catch (error) {
      console.error('Error loading testing data:', error)
    } finally {
      setLoading(false)
    }
  }

  const roleHierarchy = [
    {
      role: 'super-admin',
      title: 'Super Admin',
      description: 'Has access to all features across the platform',
      icon: Crown,
      color: 'text-purple-600 bg-purple-100',
      permissions: ['Manage all events', 'Assign Event PICs', 'Access all financial data', 'Platform administration']
    },
    {
      role: 'eo-owner',
      title: 'EO Owner',
      description: 'Event Organizer who owns and creates events',
      icon: Users,
      color: 'text-blue-600 bg-blue-100',
      permissions: ['Create events', 'Assign Event PICs', 'Manage event staff', 'View event finances']
    },
    {
      role: 'event-pic',
      title: 'Event PIC',
      description: 'Person In Charge of specific events',
      icon: UserCheck,
      color: 'text-green-600 bg-green-100',
      permissions: ['Manage assigned events', 'Assign crew/cashier/finance', 'View event details', 'Monitor event performance']
    },
    {
      role: 'finance',
      title: 'Finance Staff',
      description: 'Handles financial operations',
      icon: DollarSign,
      color: 'text-yellow-600 bg-yellow-100',
      permissions: ['View financial reports', 'Process payments', 'Manage settlements']
    },
    {
      role: 'cashier',
      title: 'Cashier',
      description: 'Handles ticket sales and customer service',
      icon: ShoppingCart,
      color: 'text-orange-600 bg-orange-100',
      permissions: ['Process ticket sales', 'Handle customer inquiries', 'Manage on-site payments']
    },
    {
      role: 'crew',
      title: 'Crew Member',
      description: 'Event execution and support staff',
      icon: Settings,
      color: 'text-gray-600 bg-gray-100',
      permissions: ['Support event operations', 'Assist with logistics', 'Help with setup/teardown']
    }
  ]

  const testingSteps = [
    {
      step: 1,
      title: 'Log in as EO Owner',
      description: 'Start by logging in with an EO Owner account to create events and assign PICs',
      action: 'Go to /login and use EO credentials',
      canPerform: hasRole('eo-owner') || hasRole('super-admin')
    },
    {
      step: 2,
      title: 'Create or Select an Event',
      description: 'Navigate to your events dashboard and either create a new event or select an existing one',
      action: 'Go to /dashboard/events',
      canPerform: hasRole('eo-owner') || hasRole('super-admin')
    },
    {
      step: 3,
      title: 'Access Event Details',
      description: 'Click on an event to view its details and access the staff management tab',
      action: 'Click on event → Staff tab',
      canPerform: hasRole('eo-owner') || hasRole('event-pic') || hasRole('super-admin')
    },
    {
      step: 4,
      title: 'Assign Event PIC',
      description: 'In the Staff tab, add a new staff member with the "Event PIC" role',
      action: 'Add Staff → Select "Event PIC" role',
      canPerform: hasRole('eo-owner') || hasRole('super-admin')
    },
    {
      step: 5,
      title: 'Event PIC Creates Sub-Staff',
      description: 'Log in as the Event PIC to assign crew, cashier, and finance roles',
      action: 'Login as Event PIC → Assign sub-roles',
      canPerform: hasRole('event-pic')
    },
    {
      step: 6,
      title: 'Test Role Permissions',
      description: 'Verify that each role has appropriate access to features and data',
      action: 'Switch between roles and test access',
      canPerform: true
    }
  ]

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Event PIC System Testing</h1>
        <p className="text-gray-600">
          Comprehensive testing guide for the Event Person In Charge (PIC) role hierarchy system
        </p>
      </div>

      {/* Current User Status */}
      <Alert className="mb-8">
        <Info className="h-4 w-4" />
        <AlertDescription>
          Currently logged in as: <strong>{user?.name}</strong> with role: <strong>{user?.currentRole}</strong>
          {user?.roles && user.roles.length > 1 && (
            <span className="ml-2">
              (Available roles: {user.roles.join(', ')})
            </span>
          )}
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="hierarchy" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="hierarchy">Role Hierarchy</TabsTrigger>
          <TabsTrigger value="testing-steps">Testing Steps</TabsTrigger>
          <TabsTrigger value="quick-test">Quick Test</TabsTrigger>
          <TabsTrigger value="api-endpoints">API Endpoints</TabsTrigger>
        </TabsList>

        {/* Role Hierarchy Tab */}
        <TabsContent value="hierarchy">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {roleHierarchy.map((role) => {
              const IconComponent = role.icon
              const hasThisRole = user?.roles?.includes(role.role)
              
              return (
                <Card key={role.role} className={`${hasThisRole ? 'ring-2 ring-blue-500' : ''}`}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <div className={`p-2 rounded-lg ${role.color}`}>
                        <IconComponent className="h-5 w-5" />
                      </div>
                      {role.title}
                      {hasThisRole && <Badge variant="secondary">Your Role</Badge>}
                    </CardTitle>
                    <CardDescription>{role.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Permissions:</h4>
                      <ul className="space-y-1">
                        {role.permissions.map((permission, index) => (
                          <li key={index} className="text-sm text-gray-600 flex items-center gap-2">
                            <CheckCircle className="h-3 w-3 text-green-500" />
                            {permission}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        {/* Testing Steps Tab */}
        <TabsContent value="testing-steps">
          <div className="space-y-4">
            {testingSteps.map((step, index) => (
              <Card key={step.step} className={step.canPerform ? 'border-green-200' : 'border-gray-200'}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                      step.canPerform ? 'bg-green-500' : 'bg-gray-400'
                    }`}>
                      {step.step}
                    </div>
                    {step.title}
                    {step.canPerform ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-gray-400" />
                    )}
                  </CardTitle>
                  <CardDescription>{step.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <code className="bg-gray-100 px-2 py-1 rounded text-sm">{step.action}</code>
                    {step.canPerform && index < testingSteps.length - 1 && (
                      <ArrowRight className="h-4 w-4 text-gray-400" />
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Quick Test Tab */}
        <TabsContent value="quick-test">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Available Events */}
            <Card>
              <CardHeader>
                <CardTitle>Available Events</CardTitle>
                <CardDescription>Events you can test with</CardDescription>
              </CardHeader>
              <CardContent>
                {events.length > 0 ? (
                  <div className="space-y-3">
                    {events.slice(0, 3).map((event) => (
                      <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <h4 className="font-medium">{event.name}</h4>
                          <p className="text-sm text-gray-600">{event.location}</p>
                        </div>
                        <div className="flex gap-2">
                          <Link href={`/dashboard/events/${event.id}`}>
                            <Button size="sm" variant="outline">View</Button>
                          </Link>
                          {(hasRole('eo-owner') || hasRole('super-admin')) && (
                            <Link href={`/dashboard/events/${event.id}?tab=staff`}>
                              <Button size="sm">Manage Staff</Button>
                            </Link>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No events available for testing</p>
                    {hasRole('eo-owner') && (
                      <Link href="/dashboard/events/create">
                        <Button className="mt-4">Create Test Event</Button>
                      </Link>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Staff Members */}
            <Card>
              <CardHeader>
                <CardTitle>Organization Staff</CardTitle>
                <CardDescription>Staff members in your organization</CardDescription>
              </CardHeader>
              <CardContent>
                {staff.length > 0 ? (
                  <div className="space-y-3">
                    {staff.slice(0, 5).map((member) => (
                      <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <h4 className="font-medium">{member.name}</h4>
                          <p className="text-sm text-gray-600">{member.email}</p>
                        </div>
                        <div className="flex gap-1">
                          {member.roles?.map((role: any) => (
                            <Badge key={role.id} variant="outline" className="text-xs">
                              {role.name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <UserCheck className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No staff members found</p>
                    {hasRole('eo-owner') && (
                      <Link href="/dashboard/roles">
                        <Button className="mt-4">Add Staff</Button>
                      </Link>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Play className="h-5 w-5" />
                Quick Test Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link href="/dashboard/events">
                  <Button className="w-full" variant="outline">
                    View All Events
                  </Button>
                </Link>
                <Link href="/dashboard/roles">
                  <Button className="w-full" variant="outline">
                    Manage Staff & Roles
                  </Button>
                </Link>
                <Link href="/dashboard">
                  <Button className="w-full" variant="outline">
                    Dashboard Overview
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* API Endpoints Tab */}
        <TabsContent value="api-endpoints">
          <div className="space-y-6">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                These are the key API endpoints used in the Event PIC system for reference and testing.
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Event Staff Management</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <code className="block bg-gray-100 p-2 rounded text-sm">
                    GET /api/events/{'{eventId}'}/staffs
                  </code>
                  <code className="block bg-gray-100 p-2 rounded text-sm">
                    POST /api/events/{'{eventId}'}/staffs
                  </code>
                  <code className="block bg-gray-100 p-2 rounded text-sm">
                    PUT /api/events/{'{eventId}'}/staffs/{'{staffId}'}
                  </code>
                  <code className="block bg-gray-100 p-2 rounded text-sm">
                    DELETE /api/events/{'{eventId}'}/staffs/{'{staffId}'}
                  </code>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Organization Staff</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <code className="block bg-gray-100 p-2 rounded text-sm">
                    GET /api/eo/staffs
                  </code>
                  <code className="block bg-gray-100 p-2 rounded text-sm">
                    POST /api/eo/staffs
                  </code>
                  <code className="block bg-gray-100 p-2 rounded text-sm">
                    PUT /api/eo/staffs/{'{staffId}'}
                  </code>
                  <code className="block bg-gray-100 p-2 rounded text-sm">
                    DELETE /api/eo/staffs/{'{staffId}'}
                  </code>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
