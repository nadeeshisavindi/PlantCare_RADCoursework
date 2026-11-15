import { useEffect } from "react"
import { useAppDispatch, useAppSelector } from "../redux/hooks"
import { removeToast, type Toast } from "../redux/slices/uiSlice"

const STYLES: Record<Toast["type"], string> = {
  success: "border-leaf-200 bg-leaf-50 text-leaf-900",
  error: "border-red-200 bg-red-50 text-red-800",
  info: "border-stone-200 bg-white text-stone-800"
}

const ToastItem = ({ toast }: { toast: Toast }) => {
  const dispatch = useAppDispatch()

  
  useEffect(() => {
    const timer = setTimeout(() => dispatch(removeToast(toast.id)), 4000)
    return () => clearTimeout(timer)
  }, [dispatch, toast.id])

  return (
    <div
      role={toast.type === "error" ? "alert" : "status"}
      className={`flex items-start gap-3 rounded-lg border px-4 py-3 text-sm shadow-lg ${STYLES[toast.type]}`}
    >
      <span className="flex-1">{toast.message}</span>
      <button
        type="button"
        aria-label="Dismiss notification"
        onClick={() => dispatch(removeToast(toast.id))}
        className="rounded p-0.5 text-current opacity-60 hover:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-leaf-500"
      >
        ✕
      </button>
    </div>
  )
}

const ToastContainer = () => {
  const toasts = useAppSelector((s) => s.ui.toasts)

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[60] flex flex-col items-center gap-2 px-4 sm:items-end sm:px-6">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto w-full max-w-sm">
          <ToastItem toast={toast} />
        </div>
      ))}
    </div>
  )
}

export default ToastContainer
