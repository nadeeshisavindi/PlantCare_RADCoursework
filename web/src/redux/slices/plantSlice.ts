import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import * as plantService from "../../services/plantService"
import type { Pagination, Plant, PlantInput, PlantListQuery } from "../../types"
import { getErrorMessage } from "../../utils/getErrorMessage"
import { logout, sessionExpired } from "./authSlice"

type RequestStatus = "idle" | "loading" | "succeeded" | "failed"

interface PlantState {
  items: Plant[]
  options: Plant[] // all of the user's plants (up to 50), used by the task form and filters
  pagination: Pagination | null
  listStatus: RequestStatus
  listError: string | null
  lastListRequestId: string | null // ignore out-of-order responses while the user types
  current: Plant | null
  detailStatus: RequestStatus
  detailError: string | null
  saveStatus: RequestStatus
}

const initialState: PlantState = {
  items: [],
  options: [],
  pagination: null,
  listStatus: "idle",
  listError: null,
  lastListRequestId: null,
  current: null,
  detailStatus: "idle",
  detailError: null,
  saveStatus: "idle"
}

export const fetchPlants = createAsyncThunk<
  { plants: Plant[]; pagination: Pagination },
  PlantListQuery,
  { rejectValue: string }
>("plants/fetchAll", async (query, { rejectWithValue }) => {
  try {
    return await plantService.listPlants(query)
  } catch (error) {
    return rejectWithValue(getErrorMessage(error))
  }
})

export const fetchPlantOptions = createAsyncThunk<Plant[], void, { rejectValue: string }>(
  "plants/fetchOptions",
  async (_, { rejectWithValue }) => {
    try {
      const data = await plantService.listPlants({ limit: 50, sort: "name" })
      return data.plants
    } catch (error) {
      return rejectWithValue(getErrorMessage(error))
    }
  }
)

export const fetchPlant = createAsyncThunk<Plant, string, { rejectValue: string }>(
  "plants/fetchOne",
  async (id, { rejectWithValue }) => {
    try {
      return await plantService.getPlant(id)
    } catch (error) {
      return rejectWithValue(getErrorMessage(error))
    }
  }
)

export const createPlant = createAsyncThunk<Plant, PlantInput, { rejectValue: string }>(
  "plants/create",
  async (input, { rejectWithValue }) => {
    try {
      return await plantService.createPlant(input)
    } catch (error) {
      return rejectWithValue(getErrorMessage(error))
    }
  }
)

export const updatePlant = createAsyncThunk<
  Plant,
  { id: string; input: PlantInput },
  { rejectValue: string }
>("plants/update", async ({ id, input }, { rejectWithValue }) => {
  try {
    return await plantService.updatePlant(id, input)
  } catch (error) {
    return rejectWithValue(getErrorMessage(error))
  }
})

export const deletePlant = createAsyncThunk<string, string, { rejectValue: string }>(
  "plants/delete",
  async (id, { rejectWithValue }) => {
    try {
      await plantService.deletePlant(id)
      return id
    } catch (error) {
      return rejectWithValue(getErrorMessage(error))
    }
  }
)

const plantSlice = createSlice({
  name: "plants",
  initialState,
  reducers: {
    // Called on logout so the next user never sees the previous user's plants
    resetPlants: () => initialState
  },
  extraReducers: (builder) => {
    builder
      // never keep one user's plants in memory after logout / session expiry
      .addCase(logout.fulfilled, () => initialState)
      .addCase(sessionExpired, () => initialState)
      // list
      .addCase(fetchPlants.pending, (state, action) => {
        state.listStatus = "loading"
        state.listError = null
        state.lastListRequestId = action.meta.requestId
      })
      .addCase(fetchPlants.fulfilled, (state, action) => {
        if (state.lastListRequestId !== action.meta.requestId) return
        state.listStatus = "succeeded"
        state.items = action.payload.plants
        state.pagination = action.payload.pagination
      })
      .addCase(fetchPlants.rejected, (state, action) => {
        if (state.lastListRequestId !== action.meta.requestId) return
        state.listStatus = "failed"
        state.listError = action.payload ?? "Could not load plants"
      })
      // plant options (for dropdowns)
      .addCase(fetchPlantOptions.fulfilled, (state, action) => {
        state.options = action.payload
      })
      // single plant
      .addCase(fetchPlant.pending, (state) => {
        state.detailStatus = "loading"
        state.detailError = null
        state.current = null
      })
      .addCase(fetchPlant.fulfilled, (state, action) => {
        state.detailStatus = "succeeded"
        state.current = action.payload
      })
      .addCase(fetchPlant.rejected, (state, action) => {
        state.detailStatus = "failed"
        state.detailError = action.payload ?? "Could not load this plant"
      })
      // create
      .addCase(createPlant.pending, (state) => {
        state.saveStatus = "loading"
      })
      .addCase(createPlant.fulfilled, (state) => {
        state.saveStatus = "succeeded"
      })
      .addCase(createPlant.rejected, (state) => {
        state.saveStatus = "failed"
      })
      // update
      .addCase(updatePlant.pending, (state) => {
        state.saveStatus = "loading"
      })
      .addCase(updatePlant.fulfilled, (state, action) => {
        state.saveStatus = "succeeded"
        state.current = action.payload
      })
      .addCase(updatePlant.rejected, (state) => {
        state.saveStatus = "failed"
      })
      // delete
      .addCase(deletePlant.fulfilled, (state, action) => {
        state.items = state.items.filter((p) => p._id !== action.payload)
        state.options = state.options.filter((p) => p._id !== action.payload)
        if (state.pagination) state.pagination.total = Math.max(0, state.pagination.total - 1)
        if (state.current?._id === action.payload) state.current = null
      })
  }
})

export const { resetPlants } = plantSlice.actions
export default plantSlice.reducer
