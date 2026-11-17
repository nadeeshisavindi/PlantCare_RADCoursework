import { useCallback, useEffect, useState } from "react"
import { Link } from "react-router-dom"
import ConfirmDialog from "../components/ConfirmDialog"
import EmptyState from "../components/EmptyState"
import { SelectField } from "../components/FormControls"
import Spinner from "../components/Spinner"
import TaskCard from "../components/TaskCard"
import { useAppDispatch, useAppSelector } from "../redux/hooks"
import { completeCareTask, deleteCareTask, fetchCareTasks } from "../redux/slices/careTaskSlice"
import { fetchPlantOptions } from "../redux/slices/plantSlice"
import { addToast } from "../redux/slices/uiSlice"
import type { CareTask, CareType, TaskView } from "../types"
import { formatDateTime, TYPE_LABELS } from "../utils/format"
import { btnPrimary, btnSecondary } from "../utils/ui"

const PAGE_SIZE = 12

const TABS: { view: TaskView; label: string }[] = [
  { view: "upcoming", label: "Upcoming" },
  { view: "overdue", label: "Overdue" },
  { view: "completed", label: "Completed" },
  { view: "all", label: "All" }
]

const EMPTY_TEXT: Record<TaskView, { title: string; message: string }> = {
  upcoming: { title: "Nothing coming up", message: "You have no upcoming care tasks. Add one to stay on schedule." },
  overdue: { title: "Nothing overdue", message: "Great job, all your plants are up to date." },
  completed: { title: "No completed tasks yet", message: "Tasks you mark as done will appear here." },
  pending: { title: "No pending tasks", message: "You have no pending care tasks." },
  all: { title: "No care tasks yet", message: "Schedule watering, fertilizing or pruning for your plants." }
}

const CareSchedule = () => {
  const dispatch = useAppDispatch()
  const { items, counts, pagination, listStatus, listError, completingId } = useAppSelector((s) => s.careTasks)
  const plants = useAppSelector((s) => s.plants.options)

  const [view, setView] = useState<TaskView>("upcoming")
  const [plant, setPlant] = useState("")
  const [type, setType] = useState<CareType | "">("")
  const [page, setPage] = useState(1)

  const [toDelete, setToDelete] = useState<CareTask | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    dispatch(fetchPlantOptions())
  }, [dispatch])

  const load = useCallback(() => {
    dispatch(fetchCareTasks({ view, plant, type, page, limit: PAGE_SIZE }))
  }, [dispatch, view, plant, type, page])

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
      load() // e.g. it was already completed on another device
    }
  }

  const handleDelete = async () => {
    if (!toDelete) return
    setDeleting(true)
    const result = await dispatch(deleteCareTask(toDelete._id))
    setDeleting(false)

    if (deleteCareTask.fulfilled.match(result)) {
      dispatch(addToast("success", "Task deleted."))
      setToDelete(null)
      if (items.length === 1 && page > 1) setPage(page - 1)
      else load()
    } else {
      dispatch(addToast("error", result.payload ?? "Could not delete the task."))
      setToDelete(null)
    }
  }

  const countFor = (v: TaskView): number | null => {
    if (!counts) return null
    return v === "all" ? counts.total : counts[v as "upcoming" | "overdue" | "completed"]
  }

  const filtersActive = Boolean(plant || type)
  const loadingFirst = (listStatus === "loading" || listStatus === "idle") && items.length === 0

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Care Schedule</h1>
          <p className="mt-1 text-stone-600">Watering, fertilizing and pruning for all your plants.</p>
        </div>
        <Link to="/care-schedule/new" className={btnPrimary}>
          + Add task
        </Link>
      </div>

      {/* Tabs */}
      <div role="group" aria-label="Task view" className="mt-6 flex flex-wrap gap-2">
        {TABS.map((tab) => {
          const active = view === tab.view
          const count = countFor(tab.view)
          return (
            <button
              key={tab.view}
              type="button"
              aria-pressed={active}
              onClick={() => {
                setView(tab.view)
                setPage(1)
              }}
              className={`rounded-full border px-4 py-1.5 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-leaf-500 ${
                active
                  ? "border-leaf-600 bg-leaf-600 text-white"
                  : "border-stone-300 bg-white text-stone-700 hover:bg-stone-100"
              } ${tab.view === "overdue" && !active && counts && counts.overdue > 0 ? "border-red-300 text-red-700" : ""}`}
            >
              {tab.label}
              {count !== null && <span className="ml-1.5 opacity-80">({count})</span>}
            </button>
          )
        })}
      </div>

      {/* Filters */}
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:max-w-xl">
        <SelectField
          label="Plant"
          value={plant}
          onChange={(e) => {
            setPlant(e.target.value)
            setPage(1)
          }}
        >
          <option value="">All plants</option>
          {plants.map((p) => (
            <option key={p._id} value={p._id}>
              {p.name}
            </option>
          ))}
        </SelectField>
        <SelectField
          label="Care type"
          value={type}
          onChange={(e) => {
            setType(e.target.value as CareType | "")
            setPage(1)
          }}
        >
          <option value="">All types</option>
          {(Object.keys(TYPE_LABELS) as CareType[]).map((t) => (
            <option key={t} value={t}>
              {TYPE_LABELS[t]}
            </option>
          ))}
        </SelectField>
      </div>

      <div className="mt-6">
        {loadingFirst && (
          <div className="py-16">
            <Spinner label="Loading tasks" />
          </div>
        )}

        {listStatus === "failed" && (
          <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
            <p className="text-red-800">{listError}</p>
            <button type="button" onClick={load} className={`${btnSecondary} mt-4`}>
              Try again
            </button>
          </div>
        )}

        {listStatus !== "failed" && !loadingFirst && items.length === 0 && (
          <EmptyState
            title={filtersActive ? "No tasks match these filters" : EMPTY_TEXT[view].title}
            message={filtersActive ? "Try a different plant or care type." : EMPTY_TEXT[view].message}
            action={
              filtersActive ? (
                <button
                  type="button"
                  className={btnSecondary}
                  onClick={() => {
                    setPlant("")
                    setType("")
                  }}
                >
                  Clear filters
                </button>
              ) : (
                <Link to="/care-schedule/new" className={btnPrimary}>
                  + Add task
                </Link>
              )
            }
          />
        )}

        {items.length > 0 && listStatus !== "failed" && (
          <div
            className={`grid gap-4 sm:grid-cols-2 xl:grid-cols-3 ${listStatus === "loading" ? "opacity-60" : ""}`}
            aria-busy={listStatus === "loading"}
          >
            {items.map((task) => (
              <TaskCard
                key={task._id}
                task={task}
                completing={completingId === task._id}
                onComplete={handleComplete}
                onDelete={setToDelete}
              />
            ))}
          </div>
        )}

        {pagination && pagination.pages > 1 && (
          <nav aria-label="Pagination" className="mt-8 flex items-center justify-center gap-4">
            <button type="button" className={btnSecondary} disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              Previous
            </button>
            <span className="text-sm text-stone-600">
              Page {pagination.page} of {pagination.pages}
            </span>
            <button
              type="button"
              className={btnSecondary}
              disabled={page >= pagination.pages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </button>
          </nav>
        )}
      </div>

      <ConfirmDialog
        open={toDelete !== null}
        title="Delete this task?"
        message="This permanently removes the task and its reminders."
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  )
}

export default CareSchedule
