import type { AdminStats, AdminUser, AdminUserListData, AdminUserListQuery } from "../types/admin"
import type { ApiResponse, UserRole } from "../types"
import api from "./api"

export const getStats = async (): Promise<AdminStats> => {
  const res = await api.get<ApiResponse<{ stats: AdminStats }>>("/admin/stats")
  return res.data.data.stats
}

export const listUsers = async (query: AdminUserListQuery): Promise<AdminUserListData> => {
  const params = Object.fromEntries(
    Object.entries(query).filter(([, value]) => value !== "" && value !== undefined)
  )
  const res = await api.get<ApiResponse<AdminUserListData>>("/admin/users", { params })
  return res.data.data
}

export const updateUserRole = async (id: string, role: UserRole): Promise<Pick<AdminUser, "_id" | "role">> => {
  const res = await api.patch<ApiResponse<{ user: AdminUser }>>(`/admin/users/${id}/role`, { role })
  return res.data.data.user
}

export const deleteUser = async (id: string): Promise<void> => {
  await api.delete(`/admin/users/${id}`)
}
