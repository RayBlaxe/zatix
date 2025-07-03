"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Mail, User, Shield } from "lucide-react"
import { Staff, StaffCreateRequest, StaffUpdateRequest } from "./types"

interface StaffDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  staff?: Staff
  onSubmit: (data: StaffCreateRequest | StaffUpdateRequest) => void
}

export function StaffDialog({ open, onOpenChange, staff, onSubmit }: StaffDialogProps) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [selectedRole, setSelectedRole] = useState("")

  // Available roles for selection
  const availableRoles = [
    { value: "cashier", label: "Cashier" },
    { value: "finance", label: "Finance" },
    { value: "crew", label: "Crew" }
  ]

  // Reset form when dialog opens or staff changes
  useEffect(() => {
    if (open) {
      setName(staff?.name || "")
      setEmail(staff?.email || "")
      setSelectedRole(staff?.roles?.[0]?.name || "")
    }
  }, [open, staff])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name.trim() || !email.trim() || (!staff && !selectedRole)) {
      return
    }

    let formData: StaffCreateRequest | StaffUpdateRequest

    if (staff) {
      // Editing existing staff - use update format
      formData = {
        name: name.trim(),
        email: email.trim(),
      }
    } else {
      // Creating new staff - use create format with role
      formData = {
        name: name.trim(),
        email: email.trim(),
        role: selectedRole,
      }
    }

    onSubmit(formData)
    
    // Reset form
    setName("")
    setEmail("")
    setSelectedRole("")
  }

  const handleClose = () => {
    setName("")
    setEmail("")
    setSelectedRole("")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              {staff ? "Edit Staff Member" : "Add Staff Member"}
            </DialogTitle>
            <DialogDescription>
              {staff
                ? "Make changes to the staff member information."
                : "Add a new staff member to your organization."}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-6 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Full Name
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter staff member's full name"
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email address"
                required
              />
            </div>

            {!staff && (
              <div className="grid gap-2">
                <Label className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Role
                </Label>
                <Select value={selectedRole} onValueChange={setSelectedRole} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableRoles.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {staff && staff.roles && staff.roles.length > 0 && (
              <div className="grid gap-2">
                <Label className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Current Roles
                </Label>
                <div className="flex flex-wrap gap-2 p-3 bg-muted/50 rounded-md">
                  {staff.roles.map((role) => (
                    <Badge key={role.id} variant="secondary" className="capitalize">
                      {role.name}
                    </Badge>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  Role management will be available in a future update.
                </p>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!name.trim() || !email.trim() || (!staff && !selectedRole)}>
              {staff ? "Save Changes" : "Add Staff Member"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}