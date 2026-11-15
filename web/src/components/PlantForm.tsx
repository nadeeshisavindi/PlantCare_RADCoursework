import { useState, type FormEvent } from "react"
import { Link } from "react-router-dom"
import type { LightRequirement, Plant, PlantInput } from "../types"
import { toDateInputValue, todayInputValue } from "../utils/format"
import { btnPrimary, btnSecondary } from "../utils/ui"
import FormField from "./FormField"
import { SelectField, TextAreaField } from "./FormControls"

type Values = {
  name: string
  species: string
  plantingDate: string
  imageUrl: string
  location: string
  description: string
  light: LightRequirement
  wateringTips: string
  fertilizerTips: string
  pruningTips: string
  notes: string
}

type Errors = Partial<Record<keyof Values, string>>

const emptyValues: Values = {
  name: "",
  species: "",
  plantingDate: todayInputValue(),
  imageUrl: "",
  location: "",
  description: "",
  light: "medium",
  wateringTips: "",
  fertilizerTips: "",
  pruningTips: "",
  notes: ""
}

const fromPlant = (plant: Plant): Values => ({
  name: plant.name,
  species: plant.species,
  plantingDate: toDateInputValue(plant.plantingDate),
  imageUrl: plant.imageUrl ?? "",
  location: plant.location ?? "",
  description: plant.description ?? "",
  light: plant.careInfo.light,
  wateringTips: plant.careInfo.wateringTips ?? "",
  fertilizerTips: plant.careInfo.fertilizerTips ?? "",
  pruningTips: plant.careInfo.pruningTips ?? "",
  notes: plant.careInfo.notes ?? ""
})

const isHttpUrl = (value: string): boolean => {
  try {
    const url = new URL(value)
    return url.protocol === "http:" || url.protocol === "https:"
  } catch {
    return false
  }
}


const validate = (v: Values): Errors => {
  const errors: Errors = {}
  const name = v.name.trim()

  if (!name) errors.name = "Plant name is required"
  else if (name.length < 2 || name.length > 80) errors.name = "Plant name must be 2-80 characters"

  if (!v.species.trim()) errors.species = "Species is required"
  else if (v.species.trim().length > 100) errors.species = "Species cannot exceed 100 characters"

  if (!v.plantingDate) errors.plantingDate = "Planting date is required"
  else if (v.plantingDate > todayInputValue()) errors.plantingDate = "Planting date cannot be in the future"

  if (v.imageUrl.trim() && !isHttpUrl(v.imageUrl.trim())) {
    errors.imageUrl = "Enter a full image link starting with http:// or https://"
  }
  if (v.location.trim().length > 100) errors.location = "Location cannot exceed 100 characters"
  if (v.description.trim().length > 1000) errors.description = "Description cannot exceed 1000 characters"
  if (v.wateringTips.trim().length > 500) errors.wateringTips = "Watering tips cannot exceed 500 characters"
  if (v.fertilizerTips.trim().length > 500) errors.fertilizerTips = "Fertilizer tips cannot exceed 500 characters"
  if (v.pruningTips.trim().length > 500) errors.pruningTips = "Pruning tips cannot exceed 500 characters"
  if (v.notes.trim().length > 1000) errors.notes = "Notes cannot exceed 1000 characters"

  return errors
}

const toInput = (v: Values): PlantInput => ({
  name: v.name.trim(),
  species: v.species.trim(),
  plantingDate: v.plantingDate,
  imageUrl: v.imageUrl.trim(),
  location: v.location.trim(),
  description: v.description.trim(),
  careInfo: {
    light: v.light,
    wateringTips: v.wateringTips.trim(),
    fertilizerTips: v.fertilizerTips.trim(),
    pruningTips: v.pruningTips.trim(),
    notes: v.notes.trim()
  }
})

type PlantFormProps = {
  initial?: Plant
  submitLabel: string
  saving: boolean
  serverError: string | null
  cancelTo: string
  onSubmit: (input: PlantInput) => void
}


const PlantForm = ({ initial, submitLabel, saving, serverError, cancelTo, onSubmit }: PlantFormProps) => {
  const [values, setValues] = useState<Values>(initial ? fromPlant(initial) : emptyValues)
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

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-8">
      {serverError && (
        <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {serverError}
        </div>
      )}

      <section className="space-y-5 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-lg font-semibold text-stone-900">Plant details</h2>

        <div className="grid gap-5 sm:grid-cols-2">
          <FormField
            label="Plant name"
            name="name"
            placeholder="e.g. Kitchen Monstera"
            value={values.name}
            onChange={set("name")}
            error={errors.name}
          />
          <FormField
            label="Species"
            name="species"
            placeholder="e.g. Monstera deliciosa"
            value={values.species}
            onChange={set("species")}
            error={errors.species}
          />
          <FormField
            label="Planting date"
            type="date"
            name="plantingDate"
            max={todayInputValue()}
            value={values.plantingDate}
            onChange={set("plantingDate")}
            error={errors.plantingDate}
          />
          <FormField
            label="Location (optional)"
            name="location"
            placeholder="e.g. Living room window"
            value={values.location}
            onChange={set("location")}
            error={errors.location}
          />
        </div>

        <FormField
          label="Image link (optional)"
          type="url"
          name="imageUrl"
          placeholder="https://example.com/my-plant.jpg"
          hint="Paste a link to a photo of your plant."
          value={values.imageUrl}
          onChange={set("imageUrl")}
          error={errors.imageUrl}
        />

        <TextAreaField
          label="Description (optional)"
          name="description"
          placeholder="Anything worth remembering about this plant"
          value={values.description}
          onChange={set("description")}
          error={errors.description}
        />
      </section>

      <section className="space-y-5 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-lg font-semibold text-stone-900">Care information</h2>

        <div className="sm:max-w-xs">
          <SelectField label="Light requirement" name="light" value={values.light} onChange={set("light")}>
            <option value="low">Low light</option>
            <option value="medium">Medium light</option>
            <option value="high">Bright light</option>
          </SelectField>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <TextAreaField
            label="Watering tips"
            name="wateringTips"
            placeholder="e.g. Water when the top 2 cm of soil is dry"
            value={values.wateringTips}
            onChange={set("wateringTips")}
            error={errors.wateringTips}
          />
          <TextAreaField
            label="Fertilizer tips"
            name="fertilizerTips"
            placeholder="e.g. Half-strength liquid feed once a month"
            value={values.fertilizerTips}
            onChange={set("fertilizerTips")}
            error={errors.fertilizerTips}
          />
          <TextAreaField
            label="Pruning tips"
            name="pruningTips"
            placeholder="e.g. Trim yellow leaves in spring"
            value={values.pruningTips}
            onChange={set("pruningTips")}
            error={errors.pruningTips}
          />
          <TextAreaField
            label="Other notes"
            name="notes"
            placeholder="Pests, repotting dates, anything else"
            value={values.notes}
            onChange={set("notes")}
            error={errors.notes}
          />
        </div>
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

export default PlantForm
