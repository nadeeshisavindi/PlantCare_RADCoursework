import { useEffect, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import CareTaskForm from "../components/CareTaskForm"
import Spinner from "../components/Spinner"
import { useAppDispatch, useAppSelector } from "../redux/hooks"
import { fetchCareTask, updateCareTask } from "../redux/slices/careTaskSlice"
import { fetchPlantOptions } from "../redux/slices/plantSlice"
import { addToast } from "../redux/slices/uiSlice"
import type { CareTaskInput } from "../types"
import { btnSecondary } from "../utils/ui"

const EditCareTask = () => {
  const { id = "" } = useParams()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const { current, detailStatus, detailError } = useAppSelector((s) => s.careTasks)
  const saving = useAppSelector((s) => s.careTasks.saveStatus === "loading")
  const plantCount = useAppSelector((s) => s.plants.options.length)
  const [serverError, setServerError] = useState<string | null>(null)

  useEffect(() => {
    dispatch(fetchPlantOptions())
    dispatch(fetchCareTask(id))
  }, [dispatch, id])

  const handleSubmit = async (input: CareTaskInput) => {
    setServerError(null)
    const result = await dispatch(updateCareTask({ id, input }))

    if (updateCareTask.fulfilled.match(result)) {
      dispatch(addToast("success", "Care task updated."))
      navigate("/care-schedule", { replace: true })
    } else {
      setServerError(result.payload ?? "Could not update the task. Please try again.")
    }
  }

  if (detailStatus === "loading" || detailStatus === "idle" || (current && current._id !== id)) {
    return (
      <div className="py-20">
        <Spinner label="Loading task" />
      </div>
    )
  }

  if (detailStatus === "failed" || !current) {
    return (
      <div className="py-20 text-center">
        <h1 className="text-xl font-bold text-stone-900">Task not found</h1>
        <p className="mt-2 text-stone-600">{detailError ?? "This task does not exist or is not yours."}</p>
        <Link to="/care-schedule" className={`${btnSecondary} mt-6`}>
          Back to Care Schedule
        </Link>
      </div>
    )
  }

  // wait for the plant list so the dropdown can show the task's plant
  if (plantCount === 0) {
    return (
      <div className="py-20">
        <Spinner label="Loading plants" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Link to="/care-schedule" className="text-sm font-medium text-leaf-700 hover:underline">
        &larr; Back to Care Schedule
      </Link>
      <h1 className="mt-2 text-2xl font-bold text-stone-900">Edit care task</h1>
      <p className="mb-6 mt-1 text-stone-600">Update the details for this task.</p>

      <CareTaskForm
        key={current._id}
        initial={current}
        submitLabel="Save changes"
        saving={saving}
        serverError={serverError}
        cancelTo="/care-schedule"
        onSubmit={handleSubmit}
      />
    </div>
  )
}

export default EditCareTask
