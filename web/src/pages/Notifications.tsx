import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import EmptyState from "../components/EmptyState"
import Spinner from "../components/Spinner"
import { useAppDispatch, useAppSelector } from "../redux/hooks"
import {
  fetchNotifications,
  readAllNotifications,
  readNotification,
  removeNotification
} from "../redux/slices/notificationSlice"
import { addToast } from "../redux/slices/uiSlice"
import { formatDateTime } from "../utils/format"
import { btnSecondary, btnSecondarySm } from "../utils/ui"

const Notifications = () => {
  const dispatch = useAppDispatch()
  const { items, pagination, unreadCount, status, error } = useAppSelector((s) => s.notifications)
  const [onlyUnread, setOnlyUnread] = useState(false)
  const [page, setPage] = useState(1)

  useEffect(() => {
    dispatch(fetchNotifications({ unread: onlyUnread, page, limit: 10 }))
  }, [dispatch, onlyUnread, page])

  const handleRead = (id: string) => dispatch(readNotification(id))

  const handleReadAll = async () => {
    const result = await dispatch(readAllNotifications())
    if (readAllNotifications.fulfilled.match(result)) dispatch(addToast("success", "All marked as read."))
  }

  const handleRemove = async (id: string) => {
    const result = await dispatch(removeNotification(id))
    if (removeNotification.rejected.match(result)) dispatch(addToast("error", result.payload ?? "Could not delete."))
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Notifications</h1>
          <p className="mt-1 text-stone-600">{unreadCount} unread</p>
        </div>
        <button type="button" className={btnSecondary} disabled={unreadCount === 0} onClick={handleReadAll}>
          Mark all as read
        </button>
      </div>

      <div className="mt-4 flex gap-2" role="tablist" aria-label="Filter notifications">
        {[
          { label: "All", value: false },
          { label: "Unread", value: true }
        ].map((tab) => (
          <button
            key={tab.label}
            type="button"
            role="tab"
            aria-selected={onlyUnread === tab.value}
            onClick={() => {
              setOnlyUnread(tab.value)
              setPage(1)
            }}
            className={`rounded-full px-4 py-1.5 text-sm font-medium ${
              onlyUnread === tab.value ? "bg-leaf-600 text-white" : "bg-white text-stone-700 border border-stone-300"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mt-4">
        {status === "loading" && items.length === 0 ? (
          <div className="py-12">
            <Spinner label="Loading notifications" />
          </div>
        ) : status === "failed" ? (
          <p className="text-sm text-red-600">{error}</p>
        ) : items.length === 0 ? (
          <EmptyState
            title={onlyUnread ? "No unread notifications" : "No notifications yet"}
            message="When a care task is due soon or overdue, a reminder shows up here automatically."
            action={
              <Link to="/care-schedule/new" className={btnSecondary}>
                Add a care task
              </Link>
            }
          />
        ) : (
          <ul className="space-y-3">
            {items.map((n) => (
              <li
                key={n._id}
                className={`rounded-xl border p-4 ${
                  n.isRead ? "border-stone-200 bg-white" : "border-leaf-300 bg-leaf-50"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="flex items-center gap-2 font-semibold text-stone-900">
                      {!n.isRead && <span className="h-2 w-2 rounded-full bg-leaf-600" aria-label="Unread" />}
                      {n.title}
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          n.type === "overdue" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {n.type === "overdue" ? "Overdue" : "Due soon"}
                      </span>
                    </p>
                    <p className="mt-1 text-sm text-stone-700">{n.message}</p>
                    <p className="mt-1 text-xs text-stone-500">{formatDateTime(n.createdAt)}</p>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Link to={`/plants/${n.plant}`} className={btnSecondarySm} onClick={() => handleRead(n._id)}>
                    View plant
                  </Link>
                  {!n.isRead && (
                    <button type="button" className={btnSecondarySm} onClick={() => handleRead(n._id)}>
                      Mark as read
                    </button>
                  )}
                  <button type="button" className={btnSecondarySm} onClick={() => handleRemove(n._id)}>
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {pagination && pagination.pages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <button type="button" className={btnSecondarySm} disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            Previous
          </button>
          <span className="text-sm text-stone-600">
            Page {pagination.page} of {pagination.pages}
          </span>
          <button
            type="button"
            className={btnSecondarySm}
            disabled={page >= pagination.pages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}

export default Notifications
