"use client"

import { useState } from "react"
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
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"

interface RoleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  role?: {
    id: string
    name: string
    permissions: string[]
  }
  permissions: string[]
  onSubmit: (data: { name: string; permissions: string[] }) => void
}

export function RoleDialog({ open, onOpenChange, role, permissions, onSubmit }: RoleDialogProps) {
  const [name, setName] = useState(role?.name || "")
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>(role?.permissions || [])
  
  // Defensive check for permissions
  const safePermissions = permissions || []

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({ name, permissions: selectedPermissions })
  }

  const togglePermission = (permission: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(permission)
        ? prev.filter((p) => p !== permission)
        : [...prev, permission]
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{role ? "Edit Role" : "Create Role"}</DialogTitle>
            <DialogDescription>
              {role
                ? "Make changes to the role and its permissions."
                : "Create a new role and assign permissions."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Role Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter role name"
              />
            </div>
            <div className="grid gap-2">
              <Label>Permissions</Label>
              <ScrollArea className="h-[200px] rounded-md border p-4">
                <div className="grid gap-2">
                  {safePermissions.map((permission) => (
                    <div key={permission} className="flex items-center space-x-2">
                      <Checkbox
                        id={permission}
                        checked={selectedPermissions.includes(permission)}
                        onCheckedChange={() => togglePermission(permission)}
                      />
                      <label
                        htmlFor={permission}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {permission}
                      </label>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">{role ? "Save Changes" : "Create Role"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 