import { configureStore } from "@reduxjs/toolkit"
import { setAuthFailureHandler } from "../services/api"
import authReducer, { sessionExpired } from "./slices/authSlice"
import plantReducer from "./slices/plantSlice"
import uiReducer from "./slices/uiSlice"


export const store = configureStore({
  reducer: {
    auth: authReducer,
    plants: plantReducer,
    ui: uiReducer

  }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch


setAuthFailureHandler(() => {
  store.dispatch(sessionExpired())
})
