import { isAxiosError } from "axios"
import type { ApiErrorBody } from "../types"


export const getErrorMessage = (error: unknown): string => {
  if (isAxiosError<ApiErrorBody>(error)) {
    const data = error.response?.data
    if (data?.errors?.length) {
      return data.errors.map((e) => e.message).join(". ")
    }
    if (data?.message) {
      return data.message
    }
    if (error.code === "ERR_NETWORK") {
      return "Cannot reach the server. Please check your connection and try again."
    }
  }
  return error instanceof Error ? error.message : "Something went wrong. Please try again."
}
