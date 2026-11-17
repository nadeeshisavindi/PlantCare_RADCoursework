import type { ApiResponse } from "../types"
import type { AppNotification, NotificationListData, NotificationListQuery } from "../types/notification"
import api from "./api"

export const listNotifications = async (query: NotificationListQuery): Promise<NotificationListData> => {
  const params: Record<string, string | number> = {}
  if (query.unread) params.unread = "true"
  if (query.page) params.page = query.page
  if (query.limit) params.limit = query.limit
  const res = await api.get<ApiResponse<NotificationListData>>("/notifications", { params })
  return res.data.data
}

export const getUnreadCount = async (): Promise<number> => {
  const res = await api.get<ApiResponse<{ unreadCount: number }>>("/notifications/unread-count")
  return res.data.data.unreadCount
}

export const markRead = async (id: string): Promise<AppNotification> => {
  const res = await api.patch<ApiResponse<{ notification: AppNotification }>>(`/notifications/${id}/read`)
  return res.data.data.notification
}

export const markAllRead = async (): Promise<void> => {
  await api.patch("/notifications/read-all")
}

export const deleteNotification = async (id: string): Promise<void> => {
  await api.delete(`/notifications/${id}`)
}
