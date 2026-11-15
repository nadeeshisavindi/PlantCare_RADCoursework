import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import { loginUser, logoutUser, registerUser } from "../../services/authService"
import { refreshSession } from "../../services/refresh"
import type { LoginInput, RegisterInput, User } from "../../types"
import { getErrorMessage } from "../../utils/getErrorMessage"

type RequestStatus = "idle" | "loading" | "succeeded" | "failed"


interface AuthState {
  user: User | null
  initialized: boolean 
  status: RequestStatus
  error: string | null
}

const initialState: AuthState = {
  user: null,
  initialized: false,
  status: "idle",
  error: null
}

// On page load: try to restore the session from the httpOnly refresh-token cookie
export const bootstrapAuth = createAsyncThunk<User | null>("auth/bootstrap", async () => {
  try {
    const { user } = await refreshSession()
    return user
  } catch {
    return null 
  }
})

export const login = createAsyncThunk<User, LoginInput, { rejectValue: string }>(
  "auth/login",
  async (input, { rejectWithValue }) => {
    try {
      return await loginUser(input)
    } catch (error) {
      return rejectWithValue(getErrorMessage(error))
    }
  }
)

export const register = createAsyncThunk<User, RegisterInput, { rejectValue: string }>(
  "auth/register",
  async (input, { rejectWithValue }) => {
    try {
      return await registerUser(input)
    } catch (error) {
      return rejectWithValue(getErrorMessage(error))
    }
  }
)

export const logout = createAsyncThunk<void>("auth/logout", async () => {
  try {
    await logoutUser()
  } catch {
    // Even if the server call fails we still log out locally
  }
})

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearAuthError(state) {
      state.error = null
    },
    // Dispatched by the axios interceptor when the refresh token is no longer valid
    sessionExpired(state) {
      state.user = null
    }
  },
  extraReducers: (builder) => {
    builder
      // bootstrap
      .addCase(bootstrapAuth.fulfilled, (state, action) => {
        state.user = action.payload
        state.initialized = true
      })
      // login
      .addCase(login.pending, (state) => {
        state.status = "loading"
        state.error = null
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = "succeeded"
        state.user = action.payload
      })
      .addCase(login.rejected, (state, action) => {
        state.status = "failed"
        state.error = action.payload ?? "Login failed"
      })
      // register (does not log in; the user is sent to the login page)
      .addCase(register.pending, (state) => {
        state.status = "loading"
        state.error = null
      })
      .addCase(register.fulfilled, (state) => {
        state.status = "succeeded"
      })
      .addCase(register.rejected, (state, action) => {
        state.status = "failed"
        state.error = action.payload ?? "Registration failed"
      })
      // logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null
        state.status = "idle"
        state.error = null
      })
  }
})

export const { clearAuthError, sessionExpired } = authSlice.actions
export default authSlice.reducer
