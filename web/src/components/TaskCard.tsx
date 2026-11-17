import { Link } from "react-router-dom"
import type { CareTask } from "../types"
import {
  DUE_STATE_STYLES,
  formatDateTime,
  getDueState,
  recurrenceLabel,
  TYPE_BADGE,
  TYPE_LABELS
} from "../utils/format"
import { btnDangerSm, btnPrimarySm, btnSecondarySm } from "../utils/ui"

type TaskCardProps = {
  task: CareTask
  completing?: boolean
  showPlant?: boolean // hide the plant name on the plant's own page
  onComplete: (task: CareTask) => void
  onDelete: (task: CareTask) => void
}

const TaskCard = ({ task, completing = false, showPlant = true, onComplete, onDelete }: TaskCardProps) => {
  const state = getDueState(task)
  const done = task.status === "completed"
  const stateStyle = DUE_STATE_STYLES[state]

  return (
    <article
      className={`rounded-2xl border bg-white p-4 shadow-sm ${
        state === "overdue" ? "border-red-200" : "border-stone-200"
      }`}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${TYPE_BADGE[task.type]}`}>
          {TYPE_LABELS[task.type]}
        </span>
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${stateStyle.className}`}>
          {stateStyle.label}
        </span>
        {task.recurrence.unit !== "none" && (
          <span className="rounded-full bg-stone-100 px-2.5 py-0.5 text-xs text-stone-600">
            {recurrenceLabel(task.recurrence)}
          </span>
        )}
      </div>

      <h3 className={`mt-3 font-semibold ${done ? "text-stone-500 line-through" : "text-stone-900"}`}>
        {task.title}
      </h3>

      {showPlant && (
        <p className="mt-0.5 text-sm text-stone-600">
          Plant:{" "}
          <Link to={`/plants/${task.plant._id}`} className="font-medium text-leaf-700 hover:underline">
            {task.plant.name}
          </Link>
        </p>
      )}

      <p className="mt-2 text-sm text-stone-600">
        {done && task.completedAt
          ? `Completed ${formatDateTime(task.completedAt)}`
          : `Due ${formatDateTime(task.dueDate)}`}
      </p>

      {task.notes && <p className="mt-2 whitespace-pre-line text-sm text-stone-500">{task.notes}</p>}

      <div className="mt-4 flex flex-wrap gap-2">
        {!done && (
          <button type="button" className={btnPrimarySm} disabled={completing} onClick={() => onComplete(task)}>
            {completing ? "Saving..." : "Mark as done"}
          </button>
        )}
        {!done && (
          <Link to={`/care-schedule/${task._id}/edit`} className={btnSecondarySm}>
            Edit
          </Link>
        )}
        <button
          type="button"
          className={btnDangerSm}
          onClick={() => onDelete(task)}
          aria-label={`Delete task ${task.title}`}
        >
          Delete
        </button>
      </div>
    </article>
  )
}

export default TaskCard
