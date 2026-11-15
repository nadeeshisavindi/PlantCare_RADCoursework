import axios from "axios"
import type { ApiResponse, AuthData } from "../types"
import { API_URL } from "./config"
import { setAccessToken } from "./tokenStore"


let inFlight: Promise<AuthData> | null = null

export const refreshSession = (): Promise<AuthData> => {
  if (!inFlight) {
    inFlight = axios
      .post<ApiResponse<AuthData>>(`${API_URL}/auth/refresh`, null, {
        withCredentials: true
      })
      .then((res) => {
        setAccessToken(res.data.data.accessToken)
        return res.data.data
      })
      .finally(() => {
        inFlight = null
      })
  }
  return inFlight
}
