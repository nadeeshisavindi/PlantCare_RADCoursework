import type { Pagination } from "./index"

export type NotificationType = "upcoming" | "overdue"

export interface AppNotification {
  _id: string
  task: string
  plant: string
  type: NotificationType
  title: string
  message: string
  dueDate: string
  isRead: boolean
  createdAt: string
}

export interface NotificationListData {
  notifications: AppNotification[]
  unreadCount: number
  pagination: Pagination
}

export interface NotificationListQuery {
  unread?: boolean
  page?: number
  limit?: number
}
