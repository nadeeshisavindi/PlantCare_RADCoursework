import type { Pagination, UserRole } from "./index"

export interface AdminStats {
  users: number
  admins: number
  plants: number
  tasks: number
  completed: number
  overdue: number
  tasksByType: { watering: number; fertilizing: number; pruning: number }
}

export interface AdminUser {
  _id: string
  name: string
  email: string
  role: UserRole
  createdAt: string
  plantCount: number
  taskCount: number
}

export interface AdminUserListQuery {
  q?: string
  page?: number
  limit?: number
}

export interface AdminUserListData {
  users: AdminUser[]
  pagination: Pagination
}
