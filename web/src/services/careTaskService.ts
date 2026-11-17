import type {
  ApiResponse,
  CareTask,
  CareTaskInput,
  CareTaskListData,
  CareTaskListQuery,
  CompleteTaskData
} from "../types"
import api from "./api"

export const listCareTasks = async (query: CareTaskListQuery): Promise<CareTaskListData> => {
  // Leave out empty filters so the URL stays clean
  const params = Object.fromEntries(
    Object.entries(query).filter(([, value]) => value !== "" && value !== undefined)
  )
  const res = await api.get<ApiResponse<CareTaskListData>>("/care-tasks", { params })
  return res.data.data
}

export const getCareTask = async (id: string): Promise<CareTask> => {
  const res = await api.get<ApiResponse<{ task: CareTask }>>(`/care-tasks/${id}`)
  return res.data.data.task
}

export const createCareTask = async (input: CareTaskInput): Promise<CareTask> => {
  const res = await api.post<ApiResponse<{ task: CareTask }>>("/care-tasks", input)
  return res.data.data.task
}

export const updateCareTask = async (id: string, input: CareTaskInput): Promise<CareTask> => {
  const res = await api.put<ApiResponse<{ task: CareTask }>>(`/care-tasks/${id}`, input)
  return res.data.data.task
}

export const deleteCareTask = async (id: string): Promise<void> => {
  await api.delete(`/care-tasks/${id}`)
}

export const completeCareTask = async (id: string): Promise<CompleteTaskData> => {
  const res = await api.patch<ApiResponse<CompleteTaskData>>(`/care-tasks/${id}/complete`)
  return res.data.data
}
