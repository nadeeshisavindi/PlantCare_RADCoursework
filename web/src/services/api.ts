import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios"
import { API_URL } from "./config"
import { refreshSession } from "./refresh"
import { getAccessToken, setAccessToken } from "./tokenStore"

interface RetriableRequest extends InternalAxiosRequestConfig {
  _retry?: boolean
}

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true 
})


const AUTH_ENDPOINTS = ["/auth/login", "/auth/register", "/auth/refresh", "/auth/logout"]


let onAuthFailure: (() => void) | null = null
export const setAuthFailureHandler = (handler: () => void): void => {
  onAuthFailure = handler
}

api.interceptors.request.use((config) => {
  const token = getAccessToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as RetriableRequest | undefined
    const isAuthEndpoint = AUTH_ENDPOINTS.some((url) => original?.url?.includes(url))

    if (error.response?.status === 401 && original && !original._retry && !isAuthEndpoint) {
      original._retry = true
      try {
        const { accessToken } = await refreshSession()
        original.headers.Authorization = `Bearer ${accessToken}`
        return api(original)
      } catch {
        setAccessToken(null)
        onAuthFailure?.() 
      }
    }

    return Promise.reject(error)
  }
)

export default api
