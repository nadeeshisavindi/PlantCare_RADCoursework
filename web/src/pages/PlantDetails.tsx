import { useEffect, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import ConfirmDialog from "../components/ConfirmDialog"
import PlantImage from "../components/PlantImage"
import PlantTasks from "../components/PlantTasks"
import Spinner from "../components/Spinner"
import { useAppDispatch, useAppSelector } from "../redux/hooks"
import { deletePlant, fetchPlant } from "../redux/slices/plantSlice"
import { addToast } from "../redux/slices/uiSlice"
import { daysSince, formatDate, LIGHT_BADGE, LIGHT_LABELS } from "../utils/format"
import { btnDangerOutline, btnPrimary, btnSecondary } from "../utils/ui"

const TipCard = ({ title, text }: { title: string; text?: string }) => {
  if (!text) return null
  return (
    <div className="rounded-xl border border-stone-200 bg-white p-4">
      <h3 className="text-sm font-semibold text-leaf-800">{title}</h3>
      <p className="mt-1 whitespace-pre-line text-sm text-stone-700">{text}</p>
    </div>
  )
}

const PlantDetails = () => {
  const { id = "" } = useParams()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const { current: plant, detailStatus, detailError } = useAppSelector((s) => s.plants)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    dispatch(fetchPlant(id))
  }, [dispatch, id])

  const handleDelete = async () => {
    setDeleting(true)
    const result = await dispatch(deletePlant(id))
    setDeleting(false)

    if (deletePlant.fulfilled.match(result)) {
      dispatch(addToast("success", "Plant deleted."))
      navigate("/plants", { replace: true })
    } else {
      setConfirmOpen(false)
      dispatch(addToast("error", result.payload ?? "Could not delete the plant."))
    }
  }

  if (detailStatus === "loading" || detailStatus === "idle" || (plant && plant._id !== id)) {
    return (
      <div className="py-20">
        <Spinner label="Loading plant" />
      </div>
    )
  }

  if (detailStatus === "failed" || !plant) {
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

  const { careInfo } = plant
  const hasTips = careInfo.wateringTips || careInfo.fertilizerTips || careInfo.pruningTips || careInfo.notes

  return (
    <div className="mx-auto max-w-4xl">
      <Link to="/plants" className="text-sm font-medium text-leaf-700 hover:underline">
        &larr; Back to My Plants
      </Link>

      <div className="mt-3 overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
        <div className="grid md:grid-cols-5">
          <PlantImage src={plant.imageUrl} alt={plant.name} className="h-64 w-full md:col-span-2 md:h-full" />

          <div className="p-5 sm:p-6 md:col-span-3">
            <h1 className="text-2xl font-bold text-stone-900">{plant.name}</h1>
            <p className="italic text-stone-500">{plant.species}</p>

            <div className="mt-4 flex flex-wrap gap-2">
              <span className={`rounded-full px-3 py-1 text-xs font-medium ${LIGHT_BADGE[careInfo.light]}`}>
                {LIGHT_LABELS[careInfo.light]}
              </span>
              {plant.location && (
                <span className="rounded-full bg-stone-100 px-3 py-1 text-xs text-stone-600">{plant.location}</span>
              )}
            </div>

            <dl className="mt-5 grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-stone-500">Planted</dt>
                <dd className="font-medium text-stone-900">{formatDate(plant.plantingDate)}</dd>
              </div>
              <div>
                <dt className="text-stone-500">Age</dt>
                <dd className="font-medium text-stone-900">{daysSince(plant.plantingDate)} days</dd>
              </div>
            </dl>

            {plant.description && <p className="mt-5 whitespace-pre-line text-stone-700">{plant.description}</p>}

            <div className="mt-6 flex flex-wrap gap-3">
              <Link to={`/plants/${plant._id}/edit`} className={btnPrimary}>
                Edit plant
              </Link>
              <button type="button" className={btnDangerOutline} onClick={() => setConfirmOpen(true)}>
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>

      <h2 className="mb-3 mt-8 text-lg font-semibold text-stone-900">Care information</h2>
      {hasTips ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <TipCard title="Watering" text={careInfo.wateringTips} />
          <TipCard title="Fertilizer" text={careInfo.fertilizerTips} />
          <TipCard title="Pruning" text={careInfo.pruningTips} />
          <TipCard title="Notes" text={careInfo.notes} />
        </div>
      ) : (
        <p className="rounded-xl border border-dashed border-stone-300 bg-white p-4 text-sm text-stone-600">
          No care tips added yet.{" "}
          <Link to={`/plants/${plant._id}/edit`} className="font-medium text-leaf-700 hover:underline">
            Add some
          </Link>
        </p>
      )}

      <PlantTasks plantId={plant._id} />

      <ConfirmDialog
        open={confirmOpen}
        title={`Delete ${plant.name}?`}
        message="This permanently removes the plant and its care tasks and reminders. This cannot be undone."
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  )
}

export default PlantDetails
