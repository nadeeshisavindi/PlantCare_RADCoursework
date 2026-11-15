import type { LightRequirement } from "../types"

export const formatDate = (iso: string): string =>
  new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })


export const toDateInputValue = (iso: string): string => iso.slice(0, 10)

export const todayInputValue = (): string => new Date().toISOString().slice(0, 10)

export const daysSince = (iso: string): number =>
  Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / (24 * 60 * 60 * 1000)))

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
