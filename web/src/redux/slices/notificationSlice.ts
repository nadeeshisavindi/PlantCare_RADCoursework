import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import * as notificationService from "../../services/notificationService"
import type { Pagination } from "../../types"
import type { AppNotification, NotificationListData, NotificationListQuery } from "../../types/notification"
import { getErrorMessage } from "../../utils/getErrorMessage"
import { logout, sessionExpired } from "./authSlice"

type RequestStatus = "idle" | "loading" | "succeeded" | "failed"

interface NotificationState {
  items: AppNotification[]
  pagination: Pagination | null
  unreadCount: number
  status: RequestStatus
  error: string | null
}

const initialState: NotificationState = {
  items: [],
  pagination: null,
  unreadCount: 0,
  status: "idle",
  error: null
}

export const fetchNotifications = createAsyncThunk<NotificationListData, NotificationListQuery, { rejectValue: string }>(
  "notifications/fetch",
  async (query, { rejectWithValue }) => {
    try {
      return await notificationService.listNotifications(query)
    } catch (error) {
      return rejectWithValue(getErrorMessage(error))
    }
  }
)

// Used for the sidebar badge (polled every minute)
export const fetchUnreadCount = createAsyncThunk<number, void, { rejectValue: string }>(
  "notifications/unreadCount",
  async (_, { rejectWithValue }) => {
    try {
      return await notificationService.getUnreadCount()
    } catch (error) {
      return rejectWithValue(getErrorMessage(error))
    }
  }
)

export const readNotification = createAsyncThunk<string, string, { rejectValue: string }>(
  "notifications/read",
  async (id, { rejectWithValue }) => {
    try {
      await notificationService.markRead(id)
      return id
    } catch (error) {
      return rejectWithValue(getErrorMessage(error))
    }
  }
)

export const readAllNotifications = createAsyncThunk<void, void, { rejectValue: string }>(
  "notifications/readAll",
  async (_, { rejectWithValue }) => {
    try {
      await notificationService.markAllRead()
    } catch (error) {
      return rejectWithValue(getErrorMessage(error))
    }
  }
)

export const removeNotification = createAsyncThunk<string, string, { rejectValue: string }>(
  "notifications/remove",
  async (id, { rejectWithValue }) => {
    try {
      await notificationService.deleteNotification(id)
      return id
    } catch (error) {
      return rejectWithValue(getErrorMessage(error))
    }
  }
)

const notificationSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(logout.fulfilled, () => initialState)
      .addCase(sessionExpired, () => initialState)
      .addCase(fetchNotifications.pending, (state) => {
        state.status = "loading"
        state.error = null
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.status = "succeeded"
        state.items = action.payload.notifications
        state.pagination = action.payload.pagination
        state.unreadCount = action.payload.unreadCount
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.status = "failed"
        state.error = action.payload ?? "Could not load notifications."
      })
      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload
      })
      .addCase(readNotification.fulfilled, (state, action) => {
        const item = state.items.find((n) => n._id === action.payload)
        if (item && !item.isRead) {
          item.isRead = true
          state.unreadCount = Math.max(0, state.unreadCount - 1)
        }
      })
      .addCase(readAllNotifications.fulfilled, (state) => {
        state.items.forEach((n) => {
          n.isRead = true
        })
        state.unreadCount = 0
      })
      .addCase(removeNotification.fulfilled, (state, action) => {
        const item = state.items.find((n) => n._id === action.payload)
        if (item && !item.isRead) state.unreadCount = Math.max(0, state.unreadCount - 1)
        state.items = state.items.filter((n) => n._id !== action.payload)
      })
  }
})

export default notificationSlice.reducer
