import { useCallback, useEffect, useState } from "react"
import { Link } from "react-router-dom"
import ConfirmDialog from "../components/ConfirmDialog"
import EmptyState from "../components/EmptyState"
import { SelectField } from "../components/FormControls"
import PlantCard from "../components/PlantCard"
import Spinner from "../components/Spinner"
import { useAppDispatch, useAppSelector } from "../redux/hooks"
import { deletePlant, fetchPlants } from "../redux/slices/plantSlice"
import { addToast } from "../redux/slices/uiSlice"
import type { LightRequirement, Plant, PlantSort } from "../types"
import { btnPrimary, btnSecondary, inputClasses, inputOk } from "../utils/ui"

const PAGE_SIZE = 9

const MyPlants = () => {
  const dispatch = useAppDispatch()
  const { items, pagination, listStatus, listError } = useAppSelector((s) => s.plants)

  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [light, setLight] = useState<LightRequirement | "">("")
  const [sort, setSort] = useState<PlantSort>("newest")
  const [page, setPage] = useState(1)

  const [toDelete, setToDelete] = useState<Plant | null>(null)
  const [deleting, setDeleting] = useState(false)

  // user type karana eka nawaththanakan idala API call eka karanwa
  // cheack  methana hri dn nawaththuwa
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim())
      setPage(1)
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  const load = useCallback(() => {
    dispatch(fetchPlants({ q: debouncedSearch, light, sort, page, limit: PAGE_SIZE }))
  }, [dispatch, debouncedSearch, light, sort, page])

  useEffect(() => {
    load()
  }, [load])

  const handleDelete = async () => {
    if (!toDelete) return
    setDeleting(true)
    const result = await dispatch(deletePlant(toDelete._id))
    setDeleting(false)

    if (deletePlant.fulfilled.match(result)) {
      dispatch(addToast("success", `${toDelete.name} was deleted.`))
      setToDelete(null)
      
      if (items.length === 1 && page > 1) setPage(page - 1)
      else load()
    } else {
      dispatch(addToast("error", result.payload ?? "Could not delete the plant."))
      setToDelete(null)
    }
  }

  const filtersActive = Boolean(debouncedSearch || light)
  const loadingFirst = (listStatus === "loading" || listStatus === "idle") && items.length === 0

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">My Plants</h1>
          <p className="mt-1 text-stone-600">
            {pagination ? `${pagination.total} ${pagination.total === 1 ? "plant" : "plants"}` : "Your plant collection"}
          </p>
        </div>
        <Link to="/plants/new" className={btnPrimary}>
          + Add plant
        </Link>
      </div>

      {}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <label htmlFor="plant-search" className="mb-1 block text-sm font-medium text-stone-700">
            Search
          </label>
          <input
            id="plant-search"
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, species or location"
            className={`${inputClasses} ${inputOk}`}
          />
        </div>
        <SelectField
          label="Light"
          value={light}
          onChange={(e) => {
            setLight(e.target.value as LightRequirement | "")
            setPage(1)
          }}
        >
          <option value="">All</option>
          <option value="low">Low light</option>
          <option value="medium">Medium light</option>
          <option value="high">Bright light</option>
        </SelectField>
        <SelectField
          label="Sort by"
          value={sort}
          onChange={(e) => {
            setSort(e.target.value as PlantSort)
            setPage(1)
          }}
        >
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="name">Name (A-Z)</option>
          <option value="planted">Recently planted</option>
        </SelectField>
      </div>

      <div className="mt-6">
        {loadingFirst && (
          <div className="py-16">
            <Spinner label="Loading your plants" />
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
            title={filtersActive ? "No plants match your search" : "No plants yet"}
            message={
              filtersActive
                ? "Try a different search or clear the filters."
                : "Add your first plant to start tracking its care."
            }
            action={
              filtersActive ? (
                <button
                  type="button"
                  className={btnSecondary}
                  onClick={() => {
                    setSearch("")
                    setLight("")
                  }}
                >
                  Clear filters
                </button>
              ) : (
                <Link to="/plants/new" className={btnPrimary}>
                  + Add plant
                </Link>
              )
            }
          />
        )}

        {items.length > 0 && listStatus !== "failed" && (
          <div
            className={`grid gap-5 sm:grid-cols-2 xl:grid-cols-3 ${listStatus === "loading" ? "opacity-60" : ""}`}
            aria-busy={listStatus === "loading"}
          >
            {items.map((plant) => (
              <PlantCard key={plant._id} plant={plant} onDelete={setToDelete} />
            ))}
          </div>
        )}

        {pagination && pagination.pages > 1 && (
          <nav aria-label="Pagination" className="mt-8 flex items-center justify-center gap-4">
            <button
              type="button"
              className={btnSecondary}
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
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
        title={toDelete ? `Delete ${toDelete.name}?` : "Delete plant?"}
        message="This permanently removes the plant and its care tasks and reminders. This cannot be undone."
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  )
}

export default MyPlants
