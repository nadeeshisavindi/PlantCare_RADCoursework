type SpinnerProps = {
  label?: string
  fullScreen?: boolean
}

const Spinner = ({ label = "Loading", fullScreen = false }: SpinnerProps) => {
  const spinner = (
    <div role="status" className="flex flex-col items-center gap-3">
      <div
        className="h-12 w-12 animate-spin rounded-full border-4 border-leaf-200 border-t-leaf-600"
        aria-hidden="true"
      />
      <span className="text-sm text-stone-500">{label}...</span>
    </div>
  )

  if (!fullScreen) return spinner

  return <div className="flex min-h-screen items-center justify-center bg-stone-50">{spinner}</div>
}

export default Spinner
