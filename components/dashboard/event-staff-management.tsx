"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Plus, UserPlus, UserMinus, Search, Filter, Users, Crown, DollarSign, ShoppingCart } from "lucide-react"
import { eventStaffApi } from "@/lib/api"
import { EventStaff, StaffRole } from "@/app/dashboard/roles/types"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

interface EventStaffManagementProps {
  eventId: number
  eventTitle: string
  isEventPIC?: boolean
  isEOOwner?: boolean
}

export function EventStaffManagement({ 
  eventId, 
  eventTitle, 
  isEventPIC = false, 
  isEOOwner = false 
}: EventStaffManagementProps) {
  const [eventStaff, setEventStaff] = useState<EventStaff[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("all")
  const [showAssignDialog, setShowAssignDialog] = useState(false)
  const [newStaffForm, setNewStaffForm] = useState({
    name: "",
    email: "",
    role: "crew" as "crew" | "event-pic" | "finance" | "cashier"
  })
  const { toast } = useToast()

  const canManageStaff = isEventPIC || isEOOwner

  useEffect(() => {
    loadEventStaff()
  }, [eventId])

  const loadEventStaff = async () => {
    try {
      setLoading(true)
      const response = await eventStaffApi.getEventStaff(eventId)
      // Handle paginated response structure
      const staffData = response.data?.data || response.data || []
      setEventStaff(Array.isArray(staffData) ? staffData : [])
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load event staff",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAssignStaff = async () => {
    try {
      await eventStaffApi.createEventStaff({
        ...newStaffForm,
        event_id: eventId
      })
      
      toast({
        title: "Success",
        description: "Staff member assigned to event successfully",
      })
      
      setShowAssignDialog(false)
      setNewStaffForm({ name: "", email: "", role: "crew" as "crew" | "event-pic" | "finance" | "cashier" })
      loadEventStaff()
    } catch (error) {
      toast({
        title: "Error", 
        description: "Failed to assign staff member",
        variant: "destructive",
      })
    }
  }

  const handleRemoveStaff = async (staffId: number) => {
    try {
      await eventStaffApi.deleteEventStaff(eventId, staffId)
      
      toast({
        title: "Success",
        description: "Staff member removed from event",
      })
      
      loadEventStaff()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove staff member",
        variant: "destructive",
      })
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "event-pic":
        return <Crown className="h-4 w-4" />
      case "finance":
        return <DollarSign className="h-4 w-4" />
      case "cashier":
        return <ShoppingCart className="h-4 w-4" />
      default:
        return <Users className="h-4 w-4" />
    }
  }

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "event-pic":
        return "default"
      case "finance":
        return "secondary"
      case "cashier":
        return "outline"
      default:
        return "secondary"
    }
  }

  const getEventPIC = () => {
    return Array.isArray(eventStaff) ? eventStaff.find(staff => 
      staff.roles.some(role => role.name === "event-pic")
    ) : null
  }

  const filteredStaff = Array.isArray(eventStaff) ? eventStaff.filter(staff => {
    const matchesSearch = staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         staff.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    if (roleFilter === "all") return matchesSearch
    
    return matchesSearch && staff.roles.some(role => role.name === roleFilter)
  }) : []

  const eventPIC = getEventPIC()

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Event Staff
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-muted-foreground">Loading staff...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Event PIC Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-amber-500" />
            Event Person in Charge (PIC)
          </CardTitle>
          <CardDescription>
            The person responsible for managing this event
          </CardDescription>
        </CardHeader>
        <CardContent>
          {eventPIC ? (
            <div className="flex items-center gap-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={`https://ui-avatars.com/api/?name=${eventPIC.name}&background=random`} />
                <AvatarFallback>{eventPIC.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="font-semibold">{eventPIC.name}</h3>
                <p className="text-sm text-muted-foreground">{eventPIC.email}</p>
                <Badge variant="default" className="mt-1">
                  <Crown className="h-3 w-3 mr-1" />
                  Event PIC
                </Badge>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Crown className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No Event PIC assigned</p>
              {canManageStaff && (
                <p className="text-sm mt-2">Assign someone as Event PIC to manage this event</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Staff Management Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Event Staff ({filteredStaff.length})
              </CardTitle>
              <CardDescription>
                Manage staff assigned to {eventTitle}
              </CardDescription>
            </div>
            {canManageStaff && (
              <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Assign Staff
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Assign New Staff</DialogTitle>
                    <DialogDescription>
                      Add a new staff member to this event
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        value={newStaffForm.name}
                        onChange={(e) => setNewStaffForm(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Enter staff name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={newStaffForm.email}
                        onChange={(e) => setNewStaffForm(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="Enter email address"
                      />
                    </div>
                    <div>
                      <Label htmlFor="role">Role</Label>
                      <Select 
                        value={newStaffForm.role} 
                        onValueChange={(value) => setNewStaffForm(prev => ({ ...prev, role: value as "crew" | "event-pic" | "finance" | "cashier" }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="event-pic">Event PIC</SelectItem>
                          <SelectItem value="crew">Crew</SelectItem>
                          <SelectItem value="finance">Finance</SelectItem>
                          <SelectItem value="cashier">Cashier</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowAssignDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAssignStaff}>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Assign Staff
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {/* Search and Filter */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search staff..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-40">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="event-pic">Event PIC</SelectItem>
                <SelectItem value="crew">Crew</SelectItem>
                <SelectItem value="finance">Finance</SelectItem>
                <SelectItem value="cashier">Cashier</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Staff List */}
          {filteredStaff.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">
                {searchTerm || roleFilter !== "all" ? "No staff found matching your criteria" : "No staff assigned to this event"}
              </p>
              {canManageStaff && !searchTerm && roleFilter === "all" && (
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => setShowAssignDialog(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Assign First Staff Member
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredStaff.map((staff) => (
                <div key={staff.id} className={cn(
                  "flex items-center gap-4 p-4 rounded-lg border",
                  staff.roles.some(role => role.name === "event-pic") && "bg-amber-50 border-amber-200"
                )}>
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={`https://ui-avatars.com/api/?name=${staff.name}&background=random`} />
                    <AvatarFallback>{staff.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <h4 className="font-medium">{staff.name}</h4>
                    <p className="text-sm text-muted-foreground">{staff.email}</p>
                    <div className="flex gap-2 mt-2">
                      {staff.roles.map((role) => (
                        <Badge 
                          key={role.id} 
                          variant={getRoleBadgeVariant(role.name)}
                          className="text-xs"
                        >
                          {getRoleIcon(role.name)}
                          <span className="ml-1 capitalize">{role.name.replace("-", " ")}</span>
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {canManageStaff && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <UserMinus className="h-4 w-4 mr-2" />
                          Remove
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Remove Staff Member</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to remove {staff.name} from this event? 
                            This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => handleRemoveStaff(staff.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Remove Staff
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
