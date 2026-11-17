import { useCallback, useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { useAppDispatch, useAppSelector } from "../redux/hooks"
import { completeCareTask, deleteCareTask, fetchCareTasks } from "../redux/slices/careTaskSlice"
import { addToast } from "../redux/slices/uiSlice"
import type { CareTask } from "../types"
import { formatDateTime } from "../utils/format"
import { btnSecondary } from "../utils/ui"
import ConfirmDialog from "./ConfirmDialog"
import Spinner from "./Spinner"
import TaskCard from "./TaskCard"

// "Care tasks" section on the plant details page: this plant's pending tasks
const PlantTasks = ({ plantId }: { plantId: string }) => {
  const dispatch = useAppDispatch()
  const { items: allItems, listStatus, listError, completingId } = useAppSelector((s) => s.careTasks)
  // the list in Redux is shared with the Care Schedule page, so only show this plant's tasks
  const items = allItems.filter((task) => task.plant._id === plantId)
  const [toDelete, setToDelete] = useState<CareTask | null>(null)
  const [deleting, setDeleting] = useState(false)

  const load = useCallback(() => {
    dispatch(fetchCareTasks({ plant: plantId, view: "pending", limit: 20 }))
  }, [dispatch, plantId])

  useEffect(() => {
    load()
  }, [load])

  const handleComplete = async (task: CareTask) => {
    const result = await dispatch(completeCareTask(task._id))
    if (completeCareTask.fulfilled.match(result)) {
      const next = result.payload.nextTask
      dispatch(
        addToast("success", next ? `Done! Next one is due ${formatDateTime(next.dueDate)}.` : "Task marked as done.")
      )
      load()
    } else {
      dispatch(addToast("error", result.payload ?? "Could not complete the task."))
    }
  }

  const handleDelete = async () => {
    if (!toDelete) return
    setDeleting(true)
    const result = await dispatch(deleteCareTask(toDelete._id))
    setDeleting(false)

    if (deleteCareTask.fulfilled.match(result)) {
      dispatch(addToast("success", "Task deleted."))
    } else {
      dispatch(addToast("error", result.payload ?? "Could not delete the task."))
    }
    setToDelete(null)
  }

  return (
    <section className="mt-8">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-stone-900">Care tasks</h2>
        <Link to={`/care-schedule/new?plant=${plantId}`} className={btnSecondary}>
          + Add task
        </Link>
      </div>

      {listStatus === "loading" && items.length === 0 && (
        <div className="py-8">
          <Spinner label="Loading tasks" />
        </div>
      )}

      {listStatus === "failed" && (
        <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {listError}
        </p>
      )}

      {listStatus === "succeeded" && items.length === 0 && (
        <p className="rounded-xl border border-dashed border-stone-300 bg-white p-4 text-sm text-stone-600">
          No pending care tasks for this plant yet.
        </p>
      )}

      {items.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2">
          {items.map((task) => (
            <TaskCard
              key={task._id}
              task={task}
              showPlant={false}
              completing={completingId === task._id}
              onComplete={handleComplete}
              onDelete={setToDelete}
            />
          ))}
        </div>
      )}

      <ConfirmDialog
        open={toDelete !== null}
        title="Delete this task?"
        message="This permanently removes the task and its reminders."
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setToDelete(null)}
      />
    </section>
  )
}

export default PlantTasks
