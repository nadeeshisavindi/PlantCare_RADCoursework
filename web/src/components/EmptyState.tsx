import type { ReactNode } from "react"

type EmptyStateProps = {
  title: string
  message: string
  action?: ReactNode
}

const EmptyState = ({ title, message, action }: EmptyStateProps) => (
  <div className="flex flex-col items-center rounded-2xl border border-dashed border-leaf-200 bg-white px-6 py-16 text-center">
    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-leaf-50 text-2xl" aria-hidden="true">
      🌱
    </div>
    <h2 className="text-lg font-semibold text-stone-900">{title}</h2>
    <p className="mt-1 max-w-sm text-sm text-stone-600">{message}</p>
    {action && <div className="mt-6">{action}</div>}
  </div>
)

export default EmptyState
