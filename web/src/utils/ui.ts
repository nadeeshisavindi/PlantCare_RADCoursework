// Shared Tailwind class strings so buttons look the same everywhere
const base =
  "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"

export const btnPrimary = `${base} bg-leaf-600 text-white shadow-sm hover:bg-leaf-700 focus-visible:ring-leaf-500`
export const btnSecondary = `${base} border border-stone-300 bg-white text-stone-700 hover:bg-stone-100 focus-visible:ring-leaf-500`
export const btnDanger = `${base} bg-red-600 text-white shadow-sm hover:bg-red-700 focus-visible:ring-red-500`
export const btnDangerOutline = `${base} border border-red-200 bg-white text-red-600 hover:bg-red-50 focus-visible:ring-red-500`

// Smaller buttons (used inside task cards)
const baseSm =
  "inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"

export const btnPrimarySm = `${baseSm} bg-leaf-600 text-white hover:bg-leaf-700 focus-visible:ring-leaf-500`
export const btnSecondarySm = `${baseSm} border border-stone-300 bg-white text-stone-700 hover:bg-stone-100 focus-visible:ring-leaf-500`
export const btnDangerSm = `${baseSm} border border-red-200 bg-white text-red-600 hover:bg-red-50 focus-visible:ring-red-500`

export const inputClasses =
  "block w-full rounded-lg border bg-white px-3 py-2.5 text-stone-900 shadow-sm outline-none transition placeholder:text-stone-400 focus:ring-2"
export const inputOk = "border-stone-300 focus:border-leaf-600 focus:ring-leaf-200"
export const inputBad = "border-red-400 focus:border-red-500 focus:ring-red-200"
