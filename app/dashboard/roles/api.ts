import { Role, UserRole } from "./types"
import { api } from "@/lib/api"

export const rolesApi = {
  // Get all roles
  getRoles: async (): Promise<Role[]> => {
    const response = await api.get("/roles")
    return response.data
  },

  // Create a new role
  createRole: async (data: { name: string; permissions: string[] }): Promise<Role> => {
    const response = await api.post("/roles", data)
    return response.data
  },

  // Update a role
  updateRole: async (id: string, data: { name: string; permissions: string[] }): Promise<Role> => {
    const response = await api.put(`/roles/${id}`, data)
    return response.data
  },

  // Delete a role
  deleteRole: async (id: string): Promise<void> => {
    await api.delete(`/roles/${id}`)
  },

  // Get all users with their roles
  getUsers: async (): Promise<UserRole[]> => {
    const response = await api.get("/users/roles")
    return response.data
  },

  // Assign roles to a user
  assignRoles: async (userId: string, roleIds: string[]): Promise<UserRole> => {
    const response = await api.post(`/users/${userId}/roles`, { roleIds })
    return response.data
  },

  // Get all available permissions
  getPermissions: async (): Promise<string[]> => {
    const response = await api.get("/permissions")
    return response.data
  },
} 