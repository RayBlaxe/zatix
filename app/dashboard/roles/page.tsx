"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Users, Shield } from "lucide-react"
import { DataTable } from "@/components/ui/data-table"
import { columns as roleColumns } from "./columns"
import { columns as userColumns } from "./user-columns"
import { RoleDialog } from "./role-dialog"
import { UserRoleDialog } from "./user-role-dialog"
import { useToast } from "@/components/ui/use-toast"
import { Role, UserRole } from "./types"
import { rolesApi } from "./api"

export default function RolesPage() {
  const [activeTab, setActiveTab] = useState("roles")
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false)
  const [isUserRoleDialogOpen, setIsUserRoleDialogOpen] = useState(false)
  const [selectedRole, setSelectedRole] = useState<Role | undefined>()
  const [selectedUser, setSelectedUser] = useState<UserRole | undefined>()
  const [roles, setRoles] = useState<Role[]>([])
  const [users, setUsers] = useState<UserRole[]>([])
  const [permissions, setPermissions] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setIsLoading(true)
      const [rolesData, usersData, permissionsData] = await Promise.all([
        rolesApi.getRoles(),
        rolesApi.getUsers(),
        rolesApi.getPermissions(),
      ])
      setRoles(rolesData)
      setUsers(usersData)
      setPermissions(permissionsData)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateRole = async (data: { name: string; permissions: string[] }) => {
    try {
      const newRole = await rolesApi.createRole(data)
      setRoles((prev) => [...prev, newRole])
      toast({
        title: "Role created",
        description: "The role has been created successfully.",
      })
      setIsRoleDialogOpen(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create role. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleEditRole = async (data: { name: string; permissions: string[] }) => {
    if (!selectedRole) return

    try {
      const updatedRole = await rolesApi.updateRole(selectedRole.id, data)
      setRoles((prev) =>
        prev.map((role) => (role.id === selectedRole.id ? updatedRole : role))
      )
      toast({
        title: "Role updated",
        description: "The role has been updated successfully.",
      })
      setIsRoleDialogOpen(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update role. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteRole = async (roleId: string) => {
    try {
      await rolesApi.deleteRole(roleId)
      setRoles((prev) => prev.filter((role) => role.id !== roleId))
      toast({
        title: "Role deleted",
        description: "The role has been deleted successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete role. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleAssignRoles = async (data: { userId: string; roleIds: string[] }) => {
    try {
      const updatedUser = await rolesApi.assignRoles(data.userId, data.roleIds)
      setUsers((prev) =>
        prev.map((user) => (user.id === data.userId ? updatedUser : user))
      )
      toast({
        title: "Roles assigned",
        description: "The roles have been assigned successfully.",
      })
      setIsUserRoleDialogOpen(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to assign roles. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Roles & Permissions</h1>
        <p className="text-muted-foreground">Manage user roles and permissions for your organization.</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="roles" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Roles
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            User Assignments
          </TabsTrigger>
        </TabsList>

        <TabsContent value="roles" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Roles</CardTitle>
              <Button onClick={() => {
                setSelectedRole(undefined)
                setIsRoleDialogOpen(true)
              }}>
                <Plus className="mr-2 h-4 w-4" />
                Create Role
              </Button>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={roleColumns}
                data={roles}
                onEdit={(role) => {
                  setSelectedRole(role)
                  setIsRoleDialogOpen(true)
                }}
                onDelete={handleDeleteRole}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Role Assignments</CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={userColumns}
                data={users}
                onManageRoles={(user) => {
                  setSelectedUser(user)
                  setIsUserRoleDialogOpen(true)
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <RoleDialog
        open={isRoleDialogOpen}
        onOpenChange={setIsRoleDialogOpen}
        role={selectedRole}
        permissions={permissions}
        onSubmit={selectedRole ? handleEditRole : handleCreateRole}
      />

      {selectedUser && (
        <UserRoleDialog
          open={isUserRoleDialogOpen}
          onOpenChange={setIsUserRoleDialogOpen}
          user={selectedUser}
          roles={roles}
          assignedRoles={selectedUser.roles}
          onSubmit={handleAssignRoles}
        />
      )}
    </div>
  )
}
