import type { CareTask, CareType, LightRequirement, Recurrence } from "../types"

export const formatDate = (iso: string): string =>
  new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })

// "2026-11-12T00:00:00.000Z" -> "2026-11-12" (value for <input type="date">)
export const toDateInputValue = (iso: string): string => iso.slice(0, 10)

export const todayInputValue = (): string => new Date().toISOString().slice(0, 10)

export const daysSince = (iso: string): number =>
  Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / (24 * 60 * 60 * 1000)))

export const formatDateTime = (iso: string): string =>
  new Date(iso).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  })

const pad = (n: number): string => String(n).padStart(2, "0")

// ISO string -> value for <input type="datetime-local"> in the user's local time
export const toDateTimeLocalValue = (iso: string): string => {
  const d = new Date(iso)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

// Default for a new task: tomorrow at 8:00 AM local time
export const defaultDueValue = (): string => {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  d.setHours(8, 0, 0, 0)
  return toDateTimeLocalValue(d.toISOString())
}

// "2026-11-16T08:00" (local) -> ISO string sent to the API
export const fromDateTimeLocalValue = (value: string): string => new Date(value).toISOString()

export const TYPE_LABELS: Record<CareType, string> = {
  watering: "Watering",
  fertilizing: "Fertilizing",
  pruning: "Pruning"
}

export const TYPE_BADGE: Record<CareType, string> = {
  watering: "bg-sky-100 text-sky-800",
  fertilizing: "bg-amber-100 text-amber-800",
  pruning: "bg-violet-100 text-violet-800"
}

export const recurrenceLabel = ({ unit, interval }: Recurrence): string => {
  if (unit === "none") return "Does not repeat"
  const word = { daily: "day", weekly: "week", monthly: "month" }[unit]
  return interval === 1 ? `Repeats every ${word}` : `Repeats every ${interval} ${word}s`
}

export type DueState = "completed" | "overdue" | "soon" | "upcoming"

// "soon" = due within the next 24 hours
export const getDueState = (task: CareTask): DueState => {
  if (task.status === "completed") return "completed"
  const due = new Date(task.dueDate).getTime()
  const now = Date.now()
  if (due < now) return "overdue"
  if (due - now <= 24 * 60 * 60 * 1000) return "soon"
  return "upcoming"
}

export const DUE_STATE_STYLES: Record<DueState, { label: string; className: string }> = {
  completed: { label: "Completed", className: "bg-leaf-100 text-leaf-800" },
  overdue: { label: "Overdue", className: "bg-red-100 text-red-700" },
  soon: { label: "Due soon", className: "bg-amber-100 text-amber-800" },
  upcoming: { label: "Upcoming", className: "bg-stone-100 text-stone-700" }
}

export const LIGHT_LABELS: Record<LightRequirement, string> = {
  low: "Low light",
  medium: "Medium light",
  high: "Bright light"
}

export const LIGHT_BADGE: Record<LightRequirement, string> = {
  low: "bg-stone-100 text-stone-700",
  medium: "bg-leaf-100 text-leaf-800",
  high: "bg-amber-100 text-amber-800"
}
