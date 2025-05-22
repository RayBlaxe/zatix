export interface Role {
  id: string
  name: string
  permissions: string[]
  usersCount: number
  createdAt: string
}

export interface UserRole {
  id: string
  name: string
  email: string
  roles: string[]
  assignedAt: string
} 