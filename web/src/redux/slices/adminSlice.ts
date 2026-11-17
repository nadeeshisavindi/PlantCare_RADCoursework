import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import * as adminService from "../../services/adminService"
import type { Pagination, UserRole } from "../../types"
import type { AdminStats, AdminUser, AdminUserListData, AdminUserListQuery } from "../../types/admin"
import { getErrorMessage } from "../../utils/getErrorMessage"
import { logout, sessionExpired } from "./authSlice"

type RequestStatus = "idle" | "loading" | "succeeded" | "failed"

interface AdminState {
  stats: AdminStats | null
  statsStatus: RequestStatus
  users: AdminUser[]
  pagination: Pagination | null
  usersStatus: RequestStatus
  usersError: string | null
  lastRequestId: string | null // ignore out-of-order responses while typing in search
}

const initialState: AdminState = {
  stats: null,
  statsStatus: "idle",
  users: [],
  pagination: null,
  usersStatus: "idle",
  usersError: null,
  lastRequestId: null
}

export const fetchStats = createAsyncThunk<AdminStats, void, { rejectValue: string }>(
  "admin/fetchStats",
  async (_, { rejectWithValue }) => {
    try {
      return await adminService.getStats()
    } catch (error) {
      return rejectWithValue(getErrorMessage(error))
    }
  }
)

export const fetchUsers = createAsyncThunk<AdminUserListData, AdminUserListQuery, { rejectValue: string }>(
  "admin/fetchUsers",
  async (query, { rejectWithValue }) => {
    try {
      return await adminService.listUsers(query)
    } catch (error) {
      return rejectWithValue(getErrorMessage(error))
    }
  }
)

export const changeUserRole = createAsyncThunk<
  { _id: string; role: UserRole },
  { id: string; role: UserRole },
  { rejectValue: string }
>("admin/changeRole", async ({ id, role }, { rejectWithValue }) => {
  try {
    return await adminService.updateUserRole(id, role)
  } catch (error) {
    return rejectWithValue(getErrorMessage(error))
  }
})

export const removeUser = createAsyncThunk<string, string, { rejectValue: string }>(
  "admin/removeUser",
  async (id, { rejectWithValue }) => {
    try {
      await adminService.deleteUser(id)
      return id
    } catch (error) {
      return rejectWithValue(getErrorMessage(error))
    }
  }
)

const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(logout.fulfilled, () => initialState)
      .addCase(sessionExpired, () => initialState)
      .addCase(fetchStats.pending, (state) => {
        state.statsStatus = "loading"
      })
      .addCase(fetchStats.fulfilled, (state, action) => {
        state.statsStatus = "succeeded"
        state.stats = action.payload
      })
      .addCase(fetchStats.rejected, (state) => {
        state.statsStatus = "failed"
      })
      .addCase(fetchUsers.pending, (state, action) => {
        state.usersStatus = "loading"
        state.usersError = null
        state.lastRequestId = action.meta.requestId
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        if (state.lastRequestId !== action.meta.requestId) return
        state.usersStatus = "succeeded"
        state.users = action.payload.users
        state.pagination = action.payload.pagination
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        if (state.lastRequestId !== action.meta.requestId) return
        state.usersStatus = "failed"
        state.usersError = action.payload ?? "Could not load users."
      })
      .addCase(changeUserRole.fulfilled, (state, action) => {
        const user = state.users.find((u) => u._id === action.payload._id)
        if (user) user.role = action.payload.role
      })
      .addCase(removeUser.fulfilled, (state, action) => {
        state.users = state.users.filter((u) => u._id !== action.payload)
      })
  }
})

export default adminSlice.reducer
