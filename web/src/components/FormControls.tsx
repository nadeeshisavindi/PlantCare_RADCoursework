import { useId, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react"
import { inputBad, inputClasses, inputOk } from "../utils/ui"

type CommonProps = {
  label: string
  error?: string
  hint?: string
}

const Wrapper = ({
  id,
  label,
  error,
  hint,
  children
}: CommonProps & { id: string; children: ReactNode }) => (
  <div>
    <label htmlFor={id} className="mb-1 block text-sm font-medium text-stone-700">
      {label}
    </label>
    {children}
    {hint && !error && (
      <p id={`${id}-hint`} className="mt-1 text-xs text-stone-500">
        {hint}
      </p>
    )}
    {error && (
      <p id={`${id}-error`} className="mt-1 text-sm text-red-600">
        {error}
      </p>
    )}
  </div>
)

const describedBy = (id: string, error?: string, hint?: string): string | undefined => {
  const ids = [error ? `${id}-error` : null, hint ? `${id}-hint` : null].filter(Boolean)
  return ids.length ? ids.join(" ") : undefined
}

export const TextAreaField = ({
  label,
  error,
  hint,
  rows = 3,
  ...props
}: CommonProps & Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "id">) => {
  const id = useId()
  return (
    <Wrapper id={id} label={label} error={error} hint={hint}>
      <textarea
        id={id}
        rows={rows}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, error, hint)}
        className={`${inputClasses} ${error ? inputBad : inputOk}`}
        {...props}
      />
    </Wrapper>
  )
}

export const SelectField = ({
  label,
  error,
  hint,
  children,
  ...props
}: CommonProps & Omit<SelectHTMLAttributes<HTMLSelectElement>, "id">) => {
  const id = useId()
  return (
    <Wrapper id={id} label={label} error={error} hint={hint}>
      <select
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, error, hint)}
        className={`${inputClasses} ${error ? inputBad : inputOk}`}
        {...props}
      >
        {children}
      </select>
    </Wrapper>
  )
}
