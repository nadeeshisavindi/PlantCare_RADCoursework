import { useEffect, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import PlantForm from "../components/PlantForm"
import Spinner from "../components/Spinner"
import { useAppDispatch, useAppSelector } from "../redux/hooks"
import { fetchPlant, updatePlant } from "../redux/slices/plantSlice"
import { addToast } from "../redux/slices/uiSlice"
import type { PlantInput } from "../types"
import { btnSecondary } from "../utils/ui"

const EditPlant = () => {
  const { id = "" } = useParams()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const { current, detailStatus, detailError } = useAppSelector((s) => s.plants)
  const saving = useAppSelector((s) => s.plants.saveStatus === "loading")
  const [serverError, setServerError] = useState<string | null>(null)

  useEffect(() => {
    dispatch(fetchPlant(id))
  }, [dispatch, id])

  const handleSubmit = async (input: PlantInput) => {
    setServerError(null)
    const result = await dispatch(updatePlant({ id, input }))

    if (updatePlant.fulfilled.match(result)) {
      dispatch(addToast("success", "Plant updated."))
      navigate(`/plants/${id}`, { replace: true })
    } else {
      setServerError(result.payload ?? "Could not update the plant. Please try again.")
    }
  }

  if (detailStatus === "loading" || detailStatus === "idle" || (current && current._id !== id)) {
    return (
      <div className="py-20">
        <Spinner label="Loading plant" />
      </div>
    )
  }

  if (detailStatus === "failed" || !current) {
    return (
      <div className="py-20 text-center">
        <h1 className="text-xl font-bold text-stone-900">Plant not found</h1>
        <p className="mt-2 text-stone-600">{detailError ?? "This plant does not exist or is not yours."}</p>
        <Link to="/plants" className={`${btnSecondary} mt-6`}>
          Back to My Plants
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Link to={`/plants/${id}`} className="text-sm font-medium text-leaf-700 hover:underline">
        &larr; Back to {current.name}
      </Link>
      <h1 className="mt-2 text-2xl font-bold text-stone-900">Edit plant</h1>
      <p className="mb-6 mt-1 text-stone-600">Update the details for {current.name}.</p>

      <PlantForm
       
        key={current._id}
        initial={current}
        submitLabel="Save changes"
        saving={saving}
        serverError={serverError}
        cancelTo={`/plants/${id}`}
        onSubmit={handleSubmit}
      />
    </div>
  )
}

export default EditPlant
