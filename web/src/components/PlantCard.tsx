import { Link } from "react-router-dom"
import type { Plant } from "../types"
import { formatDate, LIGHT_BADGE, LIGHT_LABELS } from "../utils/format"
import { btnDangerOutline, btnSecondary } from "../utils/ui"
import PlantImage from "./PlantImage"

type PlantCardProps = {
  plant: Plant
  onDelete: (plant: Plant) => void
}

const PlantCard = ({ plant, onDelete }: PlantCardProps) => (
  <article className="flex flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition hover:shadow-md">
    <Link
      to={`/plants/${plant._id}`}
      className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-leaf-500"
    >
      <PlantImage src={plant.imageUrl} alt={plant.name} className="h-44 w-full" />
      <div className="p-4">
        <h3 className="truncate text-lg font-semibold text-stone-900">{plant.name}</h3>
        <p className="truncate text-sm italic text-stone-500">{plant.species}</p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${LIGHT_BADGE[plant.careInfo.light]}`}
          >
            {LIGHT_LABELS[plant.careInfo.light]}
          </span>
          {plant.location && (
            <span className="rounded-full bg-stone-100 px-2.5 py-0.5 text-xs text-stone-600">
              {plant.location}
            </span>
          )}
        </div>
        <p className="mt-3 text-xs text-stone-500">Planted {formatDate(plant.plantingDate)}</p>
      </div>
    </Link>

    <div className="mt-auto flex gap-2 border-t border-stone-100 p-3">
      <Link to={`/plants/${plant._id}/edit`} className={`${btnSecondary} flex-1`}>
        Edit
      </Link>
      <button
        type="button"
        onClick={() => onDelete(plant)}
        className={`${btnDangerOutline} flex-1`}
        aria-label={`Delete ${plant.name}`}
      >
        Delete
      </button>
    </div>
  </article>
)

export default PlantCard
