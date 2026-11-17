import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import * as careTaskService from "../../services/careTaskService"
import type {
  CareTask,
  CareTaskCounts,
  CareTaskInput,
  CareTaskListData,
  CareTaskListQuery,
  CompleteTaskData,
  Pagination
} from "../../types"
import { getErrorMessage } from "../../utils/getErrorMessage"
import { logout, sessionExpired } from "./authSlice"

type RequestStatus = "idle" | "loading" | "succeeded" | "failed"

interface CareTaskState {
  items: CareTask[]
  counts: CareTaskCounts | null
  pagination: Pagination | null
  listStatus: RequestStatus
  listError: string | null
  lastListRequestId: string | null // ignore out-of-order responses when filters change quickly
  current: CareTask | null
  detailStatus: RequestStatus
  detailError: string | null
  saveStatus: RequestStatus
  completingId: string | null // task currently being marked done (disables its button)
}

const initialState: CareTaskState = {
  items: [],
  counts: null,
  pagination: null,
  listStatus: "idle",
  listError: null,
  lastListRequestId: null,
  current: null,
  detailStatus: "idle",
  detailError: null,
  saveStatus: "idle",
  completingId: null
}

export const fetchCareTasks = createAsyncThunk<CareTaskListData, CareTaskListQuery, { rejectValue: string }>(
  "careTasks/fetchAll",
  async (query, { rejectWithValue }) => {
    try {
      return await careTaskService.listCareTasks(query)
    } catch (error) {
      return rejectWithValue(getErrorMessage(error))
    }
  }
)

export const fetchCareTask = createAsyncThunk<CareTask, string, { rejectValue: string }>(
  "careTasks/fetchOne",
  async (id, { rejectWithValue }) => {
    try {
      return await careTaskService.getCareTask(id)
    } catch (error) {
      return rejectWithValue(getErrorMessage(error))
    }
  }
)

export const createCareTask = createAsyncThunk<CareTask, CareTaskInput, { rejectValue: string }>(
  "careTasks/create",
  async (input, { rejectWithValue }) => {
    try {
      return await careTaskService.createCareTask(input)
    } catch (error) {
      return rejectWithValue(getErrorMessage(error))
    }
  }
)

export const updateCareTask = createAsyncThunk<
  CareTask,
  { id: string; input: CareTaskInput },
  { rejectValue: string }
>("careTasks/update", async ({ id, input }, { rejectWithValue }) => {
  try {
    return await careTaskService.updateCareTask(id, input)
  } catch (error) {
    return rejectWithValue(getErrorMessage(error))
  }
})

export const deleteCareTask = createAsyncThunk<string, string, { rejectValue: string }>(
  "careTasks/delete",
  async (id, { rejectWithValue }) => {
    try {
      await careTaskService.deleteCareTask(id)
      return id
    } catch (error) {
      return rejectWithValue(getErrorMessage(error))
    }
  }
)

export const completeCareTask = createAsyncThunk<CompleteTaskData, string, { rejectValue: string }>(
  "careTasks/complete",
  async (id, { rejectWithValue }) => {
    try {
      return await careTaskService.completeCareTask(id)
    } catch (error) {
      return rejectWithValue(getErrorMessage(error))
    }
  }
)

const careTaskSlice = createSlice({
  name: "careTasks",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // never keep one user's tasks in memory after logout / session expiry
      .addCase(logout.fulfilled, () => initialState)
      .addCase(sessionExpired, () => initialState)
      // list
      .addCase(fetchCareTasks.pending, (state, action) => {
        state.listStatus = "loading"
        state.listError = null
        state.lastListRequestId = action.meta.requestId
      })
      .addCase(fetchCareTasks.fulfilled, (state, action) => {
        if (state.lastListRequestId !== action.meta.requestId) return
        state.listStatus = "succeeded"
        state.items = action.payload.tasks
        state.counts = action.payload.counts
        state.pagination = action.payload.pagination
      })
      .addCase(fetchCareTasks.rejected, (state, action) => {
        if (state.lastListRequestId !== action.meta.requestId) return
        state.listStatus = "failed"
        state.listError = action.payload ?? "Could not load care tasks"
      })
      // single task
      .addCase(fetchCareTask.pending, (state) => {
        state.detailStatus = "loading"
        state.detailError = null
        state.current = null
      })
      .addCase(fetchCareTask.fulfilled, (state, action) => {
        state.detailStatus = "succeeded"
        state.current = action.payload
      })
      .addCase(fetchCareTask.rejected, (state, action) => {
        state.detailStatus = "failed"
        state.detailError = action.payload ?? "Could not load this task"
      })
      // create
      .addCase(createCareTask.pending, (state) => {
        state.saveStatus = "loading"
      })
      .addCase(createCareTask.fulfilled, (state) => {
        state.saveStatus = "succeeded"
      })
      .addCase(createCareTask.rejected, (state) => {
        state.saveStatus = "failed"
      })
      // update
      .addCase(updateCareTask.pending, (state) => {
        state.saveStatus = "loading"
      })
      .addCase(updateCareTask.fulfilled, (state, action) => {
        state.saveStatus = "succeeded"
        state.current = action.payload
      })
      .addCase(updateCareTask.rejected, (state) => {
        state.saveStatus = "failed"
      })
      // delete
      .addCase(deleteCareTask.fulfilled, (state, action) => {
        state.items = state.items.filter((t) => t._id !== action.payload)
      })
      // complete (the page reloads the list afterwards so counts and tabs stay correct)
      .addCase(completeCareTask.pending, (state, action) => {
        state.completingId = action.meta.arg
      })
      .addCase(completeCareTask.fulfilled, (state) => {
        state.completingId = null
      })
      .addCase(completeCareTask.rejected, (state) => {
        state.completingId = null
      })
  }
})

export default careTaskSlice.reducer
