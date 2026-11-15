
export type UserRole = "user" | "admin"

export interface NotificationSettings {
  emailEnabled: boolean
  inAppEnabled: boolean
  reminderLeadHours: number
}

export interface User {
  _id: string
  name: string
  email: string
  role: UserRole
  notificationSettings: NotificationSettings
  createdAt: string
  updatedAt: string
}


export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

export interface ApiFieldError {
  field: string
  message: string
}


export interface ApiErrorBody {
  success: false
  message: string
  errors?: ApiFieldError[]
}


export interface AuthData {
  user: User
  accessToken: string
}

// plants 

export type LightRequirement = "low" | "medium" | "high"
export type PlantSort = "newest" | "oldest" | "name" | "planted"

export interface CareInfo {
  light: LightRequirement
  wateringTips?: string
  fertilizerTips?: string
  pruningTips?: string
  notes?: string
}

export interface Plant {
  _id: string
  owner: string
  name: string
  species: string
  imageUrl?: string
  description?: string
  plantingDate: string // ISO date
  location?: string
  careInfo: CareInfo
  createdAt: string
  updatedAt: string
}


export interface PlantInput {
  name: string
  species: string
  plantingDate: string 
  imageUrl: string
  description: string
  location: string
  careInfo: CareInfo
}

export interface Pagination {
  page: number
  limit: number
  total: number
  pages: number
}

export interface PlantListQuery {
  q?: string
  light?: LightRequirement | ""
  sort?: PlantSort
  page?: number
  limit?: number
}


export interface PlantListData {
  plants: Plant[]
  pagination: Pagination
}

export interface LoginInput {
  email: string
  password: string
}

export interface RegisterInput {
  name: string
  email: string
  password: string
}
