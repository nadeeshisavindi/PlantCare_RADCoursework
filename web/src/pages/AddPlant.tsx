import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import PlantForm from "../components/PlantForm"
import { useAppDispatch, useAppSelector } from "../redux/hooks"
import { createPlant } from "../redux/slices/plantSlice"
import { addToast } from "../redux/slices/uiSlice"
import type { PlantInput } from "../types"

const AddPlant = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const saving = useAppSelector((s) => s.plants.saveStatus === "loading")
  const [serverError, setServerError] = useState<string | null>(null)

  const handleSubmit = async (input: PlantInput) => {
    setServerError(null)
    const result = await dispatch(createPlant(input))

    if (createPlant.fulfilled.match(result)) {
      dispatch(addToast("success", `${result.payload.name} was added.`))
      navigate(`/plants/${result.payload._id}`, { replace: true })
    } else {
      setServerError(result.payload ?? "Could not add the plant. Please try again.")
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Link to="/plants" className="text-sm font-medium text-leaf-700 hover:underline">
        &larr; Back to My Plants
      </Link>
      <h1 className="mt-2 text-2xl font-bold text-stone-900">Add a plant</h1>
      <p className="mb-6 mt-1 text-stone-600">Tell us about your new plant.</p>

      <PlantForm
        submitLabel="Add plant"
        saving={saving}
        serverError={serverError}
        cancelTo="/plants"
        onSubmit={handleSubmit}
      />
    </div>
  )
}

export default AddPlant
