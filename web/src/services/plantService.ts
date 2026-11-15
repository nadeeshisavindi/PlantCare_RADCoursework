import type { ApiResponse, Plant, PlantInput, PlantListData, PlantListQuery } from "../types"
import api from "./api"

export const listPlants = async (query: PlantListQuery): Promise<PlantListData> => {
 
  const params = Object.fromEntries(
    Object.entries(query).filter(([, value]) => value !== "" && value !== undefined)
  )
  const res = await api.get<ApiResponse<PlantListData>>("/plants", { params })
  return res.data.data
}

export const getPlant = async (id: string): Promise<Plant> => {
  const res = await api.get<ApiResponse<{ plant: Plant }>>(`/plants/${id}`)
  return res.data.data.plant
}

export const createPlant = async (input: PlantInput): Promise<Plant> => {
  const res = await api.post<ApiResponse<{ plant: Plant }>>("/plants", input)
  return res.data.data.plant
}

export const updatePlant = async (id: string, input: PlantInput): Promise<Plant> => {
  const res = await api.put<ApiResponse<{ plant: Plant }>>(`/plants/${id}`, input)
  return res.data.data.plant
}

export const deletePlant = async (id: string): Promise<void> => {
  await api.delete(`/plants/${id}`)
}
