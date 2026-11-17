import { useState, type FormEvent } from "react"
import { Link } from "react-router-dom"
import { useAppSelector } from "../redux/hooks"
import type { CareTask, CareTaskInput, CareType, RecurrenceUnit } from "../types"
import {
  defaultDueValue,
  fromDateTimeLocalValue,
  toDateTimeLocalValue,
  TYPE_LABELS
} from "../utils/format"
import { btnPrimary, btnSecondary } from "../utils/ui"
import FormField from "./FormField"
import { SelectField, TextAreaField } from "./FormControls"

type Values = {
  plant: string
  type: CareType
  title: string
  dueDate: string // datetime-local value
  repeat: RecurrenceUnit
  interval: string
  notes: string
}

type Errors = Partial<Record<keyof Values, string>>

const fromTask = (task: CareTask): Values => ({
  plant: task.plant._id,
  type: task.type,
  title: task.title,
  dueDate: toDateTimeLocalValue(task.dueDate),
  repeat: task.recurrence.unit,
  interval: String(task.recurrence.interval),
  notes: task.notes ?? ""
})

// Mirrors the rules in api/src/validators/careTask.validators.ts
const validate = (v: Values): Errors => {
  const errors: Errors = {}

  if (!v.plant) errors.plant = "Please choose a plant"
  if (!v.dueDate || Number.isNaN(new Date(v.dueDate).getTime())) errors.dueDate = "Due date and time are required"
  if (v.title.trim().length > 100) errors.title = "Title cannot exceed 100 characters"
  if (v.notes.trim().length > 500) errors.notes = "Notes cannot exceed 500 characters"

  if (v.repeat !== "none") {
    const n = Number(v.interval)
    if (!Number.isInteger(n) || n < 1 || n > 365) errors.interval = "Enter a whole number from 1 to 365"
  }

  return errors
}

const toInput = (v: Values): CareTaskInput => ({
  plant: v.plant,
  type: v.type,
  title: v.title.trim(),
  notes: v.notes.trim(),
  dueDate: fromDateTimeLocalValue(v.dueDate),
  recurrence: { unit: v.repeat, interval: v.repeat === "none" ? 1 : Number(v.interval) }
})

type CareTaskFormProps = {
  initial?: CareTask
  defaultPlantId?: string
  submitLabel: string
  saving: boolean
  serverError: string | null
  cancelTo: string
  onSubmit: (input: CareTaskInput) => void
}

// One form used by both "Add task" and "Edit task"
const CareTaskForm = ({
  initial,
  defaultPlantId = "",
  submitLabel,
  saving,
  serverError,
  cancelTo,
  onSubmit
}: CareTaskFormProps) => {
  const plants = useAppSelector((s) => s.plants.options)

  const [values, setValues] = useState<Values>(
    initial
      ? fromTask(initial)
      : {
          plant: defaultPlantId,
          type: "watering",
          title: "",
          dueDate: defaultDueValue(),
          repeat: "none",
          interval: "1",
          notes: ""
        }
  )
  const [errors, setErrors] = useState<Errors>({})

  const set =
    (field: keyof Values) =>
    (e: { target: { value: string } }): void => {
      setValues((prev) => ({ ...prev, [field]: e.target.value }))
    }

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const found = validate(values)
    setErrors(found)
    if (Object.keys(found).length > 0) return
    onSubmit(toInput(values))
  }

  if (plants.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-leaf-200 bg-white p-8 text-center">
        <p className="text-stone-700">You need at least one plant before you can schedule care.</p>
        <Link to="/plants/new" className={`${btnPrimary} mt-4`}>
          + Add a plant
        </Link>
      </div>
    )
  }

  const repeating = values.repeat !== "none"
  const unitWord = { daily: "day(s)", weekly: "week(s)", monthly: "month(s)", none: "" }[values.repeat]

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      {serverError && (
        <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {serverError}
        </div>
      )}

      <section className="space-y-5 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="grid gap-5 sm:grid-cols-2">
          <SelectField label="Plant" name="plant" value={values.plant} onChange={set("plant")} error={errors.plant}>
            <option value="">Choose a plant...</option>
            {plants.map((plant) => (
              <option key={plant._id} value={plant._id}>
                {plant.name}
              </option>
            ))}
          </SelectField>

          <SelectField label="Care type" name="type" value={values.type} onChange={set("type")}>
            {(Object.keys(TYPE_LABELS) as CareType[]).map((type) => (
              <option key={type} value={type}>
                {TYPE_LABELS[type]}
              </option>
            ))}
          </SelectField>
        </div>

        <FormField
          label="Title (optional)"
          name="title"
          placeholder="Leave empty to use e.g. 'Water Kitchen Monstera'"
          value={values.title}
          onChange={set("title")}
          error={errors.title}
        />

        <FormField
          label="Due date and time"
          type="datetime-local"
          name="dueDate"
          value={values.dueDate}
          onChange={set("dueDate")}
          error={errors.dueDate}
        />

        <div className="grid gap-5 sm:grid-cols-2">
          <SelectField label="Repeat" name="repeat" value={values.repeat} onChange={set("repeat")}>
            <option value="none">Does not repeat</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </SelectField>

          {repeating && (
            <FormField
              label={`Repeat every (${unitWord})`}
              type="number"
              name="interval"
              min={1}
              max={365}
              value={values.interval}
              onChange={set("interval")}
              error={errors.interval}
              hint="When you mark the task as done, the next one is created automatically."
            />
          )}
        </div>

        <TextAreaField
          label="Notes (optional)"
          name="notes"
          placeholder="e.g. Use room-temperature water"
          value={values.notes}
          onChange={set("notes")}
          error={errors.notes}
        />
      </section>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Link to={cancelTo} className={btnSecondary}>
          Cancel
        </Link>
        <button type="submit" disabled={saving} className={btnPrimary}>
          {saving ? "Saving..." : submitLabel}
        </button>
      </div>
    </form>
  )
}

export default CareTaskForm
