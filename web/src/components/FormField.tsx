import { useId, type InputHTMLAttributes } from "react"

type FormFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "id"> & {
  label: string
  error?: string
  hint?: string
}


const FormField = ({ label, error, hint, className = "", ...inputProps }: FormFieldProps) => {
  const id = useId()
  const errorId = `${id}-error`
  const hintId = `${id}-hint`

  const describedBy = [error ? errorId : null, hint ? hintId : null].filter(Boolean).join(" ")

  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-medium text-stone-700">
        {label}
      </label>
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy || undefined}
        className={`block w-full rounded-lg border bg-white px-3 py-2.5 text-stone-900 shadow-sm outline-none transition placeholder:text-stone-400 focus:ring-2 ${
          error
            ? "border-red-400 focus:border-red-500 focus:ring-red-200"
            : "border-stone-300 focus:border-leaf-600 focus:ring-leaf-200"
        } ${className}`}
        {...inputProps}
      />
      {hint && !error && (
        <p id={hintId} className="mt-1 text-xs text-stone-500">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="mt-1 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  )
}

export default FormField
