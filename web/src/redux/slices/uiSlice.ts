import { createSlice, nanoid, type PayloadAction } from "@reduxjs/toolkit"

export type ToastType = "success" | "error" | "info"

export interface Toast {
  id: string
  type: ToastType
  message: string
}

interface UiState {
  toasts: Toast[]
}

const initialState: UiState = { toasts: [] }

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    addToast: {
      reducer(state, action: PayloadAction<Toast>) {
        state.toasts.push(action.payload)
      },
      prepare(type: ToastType, message: string) {
        return { payload: { id: nanoid(), type, message } }
      }
    },
    removeToast(state, action: PayloadAction<string>) {
      state.toasts = state.toasts.filter((t) => t.id !== action.payload)
    }
  }
})

export const { addToast, removeToast } = uiSlice.actions
export default uiSlice.reducer
