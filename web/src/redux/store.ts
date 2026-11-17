import { configureStore } from "@reduxjs/toolkit"
import { setAuthFailureHandler } from "../services/api"
import adminReducer from "./slices/adminSlice"
import authReducer, { sessionExpired } from "./slices/authSlice"
import careTaskReducer from "./slices/careTaskSlice"
import notificationReducer from "./slices/notificationSlice"
import plantReducer from "./slices/plantSlice"
import uiReducer from "./slices/uiSlice"

// Nothing is persisted (no redux-persist), so a refresh never leaves tokens on disk.
export const store = configureStore({
  reducer: {
    auth: authReducer,
    plants: plantReducer,
    careTasks: careTaskReducer,
    notifications: notificationReducer,
    admin: adminReducer,
    ui: uiReducer
  }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

// If a token refresh fails, log the user out of the UI
setAuthFailureHandler(() => {
  store.dispatch(sessionExpired())
})
