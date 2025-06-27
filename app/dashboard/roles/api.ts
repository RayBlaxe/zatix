import { Role, UserRole } from "./types"
import { rolesApi as libRolesApi } from "@/lib/api"

export const rolesApi = {
  // Get all roles
  getRoles: async (): Promise<Role[]> => {
    return await libRolesApi.getRoles()
  },

  // Create a new role
  createRole: async (data: { name: string; permissions: string[] }): Promise<Role> => {
    return await libRolesApi.createRole(data)
  },

  // Update a role
  updateRole: async (id: string, data: { name: string; permissions: string[] }): Promise<Role> => {
    return await libRolesApi.updateRole(id, data)
  },

  // Delete a role
  deleteRole: async (id: string): Promise<void> => {
    return await libRolesApi.deleteRole(id)
  },

  // Get all users with their roles
  getUsers: async (): Promise<UserRole[]> => {
    return await libRolesApi.getUsers()
  },

  // Assign roles to a user
  assignRoles: async (userId: string, roleIds: string[]): Promise<UserRole> => {
    return await libRolesApi.assignRoles(userId, roleIds)
  },

  // Get all available permissions
  getPermissions: async (): Promise<string[]> => {
    return await libRolesApi.getPermissions()
  },
} 