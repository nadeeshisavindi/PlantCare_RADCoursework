import { useEffect, useState } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import CareTaskForm from "../components/CareTaskForm"
import { useAppDispatch, useAppSelector } from "../redux/hooks"
import { createCareTask } from "../redux/slices/careTaskSlice"
import { fetchPlantOptions } from "../redux/slices/plantSlice"
import { addToast } from "../redux/slices/uiSlice"
import type { CareTaskInput } from "../types"

const AddCareTask = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const presetPlant = searchParams.get("plant") ?? "" // set by "+ Add task" on a plant's page

  const saving = useAppSelector((s) => s.careTasks.saveStatus === "loading")
  const [serverError, setServerError] = useState<string | null>(null)

  useEffect(() => {
    dispatch(fetchPlantOptions())
  }, [dispatch])

  const backTo = presetPlant ? `/plants/${presetPlant}` : "/care-schedule"

  const handleSubmit = async (input: CareTaskInput) => {
    setServerError(null)
    const result = await dispatch(createCareTask(input))

    if (createCareTask.fulfilled.match(result)) {
      dispatch(addToast("success", "Care task added."))
      navigate(backTo, { replace: true })
    } else {
      setServerError(result.payload ?? "Could not add the task. Please try again.")
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Link to={backTo} className="text-sm font-medium text-leaf-700 hover:underline">
        &larr; Back
      </Link>
      <h1 className="mt-2 text-2xl font-bold text-stone-900">Add a care task</h1>
      <p className="mb-6 mt-1 text-stone-600">Schedule watering, fertilizing or pruning.</p>

      <CareTaskForm
        defaultPlantId={presetPlant}
        submitLabel="Add task"
        saving={saving}
        serverError={serverError}
        cancelTo={backTo}
        onSubmit={handleSubmit}
      />
    </div>
  )
}

export default AddCareTask
