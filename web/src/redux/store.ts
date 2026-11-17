import { configureStore } from "@reduxjs/toolkit"
import { setAuthFailureHandler } from "../services/api"
import adminReducer from "./slices/adminSlice"
import authReducer, { sessionExpired } from "./slices/authSlice"
import careTaskReducer from "./slices/careTaskSlice"
import plantReducer from "./slices/plantSlice"
import uiReducer from "./slices/uiSlice"

// Nothing is persisted (no redux-persist), so a refresh never leaves tokens on disk.
export const store = configureStore({
  reducer: {
    auth: authReducer,
    plants: plantReducer,
    careTasks: careTaskReducer,
    admin: adminReducer,
    ui: uiReducer
    // notifications and analytics slices are added in later steps
  }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

// If a token refresh fails, log the user out of the UI
setAuthFailureHandler(() => {
  store.dispatch(sessionExpired())
})
