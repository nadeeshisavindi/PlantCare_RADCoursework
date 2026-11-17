// NOTE: tsconfig uses `erasableSyntaxOnly`, so we use string unions instead of enums here.

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

// Every successful API response: { success, message, data }
export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

export interface ApiFieldError {
  field: string
  message: string
}

// Failed API response: { success: false, message, errors? }
export interface ApiErrorBody {
  success: false
  message: string
  errors?: ApiFieldError[]
}

// Returned by POST /auth/login and POST /auth/refresh
export interface AuthData {
  user: User
  accessToken: string
}

// ---------- Plants ----------

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

// What the Add/Edit form sends to POST/PUT /plants
export interface PlantInput {
  name: string
  species: string
  plantingDate: string // YYYY-MM-DD
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

// Returned by GET /plants
export interface PlantListData {
  plants: Plant[]
  pagination: Pagination
}

// ---------- Care tasks ----------

export type CareType = "watering" | "fertilizing" | "pruning"
export type TaskStatus = "pending" | "completed"
export type RecurrenceUnit = "none" | "daily" | "weekly" | "monthly"
export type TaskView = "upcoming" | "overdue" | "pending" | "completed" | "all"

export interface Recurrence {
  unit: RecurrenceUnit
  interval: number
}

// The API returns the plant's name and image together with each task
export interface TaskPlant {
  _id: string
  name: string
  imageUrl?: string
}

export interface CareTask {
  _id: string
  owner: string
  plant: TaskPlant
  type: CareType
  title: string
  notes?: string
  dueDate: string // ISO date and time
  status: TaskStatus
  completedAt?: string
  recurrence: Recurrence
  createdAt: string
  updatedAt: string
}

// What the Add/Edit task form sends to POST/PUT /care-tasks
export interface CareTaskInput {
  plant: string // plant id
  type: CareType
  title: string
  notes: string
  dueDate: string // ISO string
  recurrence: Recurrence
}

export interface CareTaskCounts {
  upcoming: number
  overdue: number
  completed: number
  total: number
}

export interface CareTaskListQuery {
  view?: TaskView
  plant?: string
  type?: CareType | ""
  page?: number
  limit?: number
}

// Returned by GET /care-tasks
export interface CareTaskListData {
  tasks: CareTask[]
  counts: CareTaskCounts
  pagination: Pagination
}

// Returned by PATCH /care-tasks/:id/complete (nextTask is set for repeating tasks)
export interface CompleteTaskData {
  task: CareTask
  nextTask: CareTask | null
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
