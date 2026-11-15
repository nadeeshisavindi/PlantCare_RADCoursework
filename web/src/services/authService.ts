import type { ApiResponse, AuthData, LoginInput, RegisterInput, User } from "../types"
import api from "./api"
import { setAccessToken } from "./tokenStore"

export const registerUser = async (input: RegisterInput): Promise<User> => {
  const res = await api.post<ApiResponse<{ user: User }>>("/auth/register", input)
  return res.data.data.user
}

export const loginUser = async (input: LoginInput): Promise<User> => {
  const res = await api.post<ApiResponse<AuthData>>("/auth/login", input)
  setAccessToken(res.data.data.accessToken)
  return res.data.data.user
}

export const logoutUser = async (): Promise<void> => {
  try {
    await api.post("/auth/logout")
  } finally {
    setAccessToken(null)
  }
}

export const getMyDetails = async (): Promise<User> => {
  const res = await api.get<ApiResponse<{ user: User }>>("/auth/me")
  return res.data.data.user
}
