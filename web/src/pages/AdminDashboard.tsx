import { useEffect, useState } from "react"
import ConfirmDialog from "../components/ConfirmDialog"
import Spinner from "../components/Spinner"
import { useAppDispatch, useAppSelector } from "../redux/hooks"
import { changeUserRole, fetchStats, fetchUsers, removeUser } from "../redux/slices/adminSlice"
import { addToast } from "../redux/slices/uiSlice"
import type { UserRole } from "../types"
import type { AdminUser } from "../types/admin"
import { formatDate, TYPE_LABELS } from "../utils/format"
import { btnSecondarySm, inputClasses, inputOk } from "../utils/ui"

const StatCard = ({ label, value, tone = "text-stone-900" }: { label: string; value: number; tone?: string }) => (
  <div className="rounded-xl border border-stone-200 bg-white p-4">
    <p className="text-sm text-stone-500">{label}</p>
    <p className={`mt-1 text-2xl font-bold ${tone}`}>{value}</p>
  </div>
)

const AdminDashboard = () => {
  const dispatch = useAppDispatch()
  const me = useAppSelector((s) => s.auth.user)
  const { stats, statsStatus, users, pagination, usersStatus, usersError } = useAppSelector((s) => s.admin)

  const [search, setSearch] = useState("")
  const [q, setQ] = useState("")
  const [page, setPage] = useState(1)
  const [toDelete, setToDelete] = useState<AdminUser | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    dispatch(fetchStats())
  }, [dispatch])

  // debounce the search box so we do not call the API on every keystroke
  useEffect(() => {
    const t = setTimeout(() => {
      setQ(search.trim())
      setPage(1)
    }, 350)
    return () => clearTimeout(t)
  }, [search])

  useEffect(() => {
    dispatch(fetchUsers({ q, page, limit: 10 }))
  }, [dispatch, q, page])

  const handleRole = async (user: AdminUser, role: UserRole) => {
    if (role === user.role) return
    const result = await dispatch(changeUserRole({ id: user._id, role }))
    if (changeUserRole.fulfilled.match(result)) {
      dispatch(addToast("success", `${user.name} is now ${role}.`))
      dispatch(fetchStats())
    } else {
      dispatch(addToast("error", result.payload ?? "Could not change role."))
    }
  }

  const handleDelete = async () => {
    if (!toDelete) return
    setDeleting(true)
    const result = await dispatch(removeUser(toDelete._id))
    setDeleting(false)
    if (removeUser.fulfilled.match(result)) {
      dispatch(addToast("success", `${toDelete.name} deleted.`))
      setToDelete(null)
      dispatch(fetchStats())
      dispatch(fetchUsers({ q, page, limit: 10 }))
    } else {
      setToDelete(null)
      dispatch(addToast("error", result.payload ?? "Could not delete user."))
    }
  }

  const typeTotal = stats ? Math.max(1, stats.tasks) : 1

  return (
    <div>
      <h1 className="text-2xl font-bold text-stone-900">Admin dashboard</h1>
      <p className="mt-1 text-stone-600">System overview and user management.</p>

      {statsStatus === "loading" && !stats ? (
        <div className="py-10">
          <Spinner label="Loading stats" />
        </div>
      ) : stats ? (
        <>
          <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
            <StatCard label="Users" value={stats.users} />
            <StatCard label="Admins" value={stats.admins} />
            <StatCard label="Plants" value={stats.plants} />
            <StatCard label="Care tasks" value={stats.tasks} />
            <StatCard label="Completed" value={stats.completed} tone="text-leaf-700" />
            <StatCard label="Overdue" value={stats.overdue} tone={stats.overdue > 0 ? "text-red-600" : "text-stone-900"} />
          </div>

          <div className="mt-6 rounded-xl border border-stone-200 bg-white p-5">
            <h2 className="text-sm font-semibold text-stone-900">Tasks by care type</h2>
            <ul className="mt-3 space-y-3">
              {(Object.keys(stats.tasksByType) as Array<keyof typeof stats.tasksByType>).map((type) => {
                const count = stats.tasksByType[type]
                return (
                  <li key={type}>
                    <div className="flex justify-between text-sm text-stone-700">
                      <span>{TYPE_LABELS[type]}</span>
                      <span className="font-medium">{count}</span>
                    </div>
                    <div className="mt-1 h-2 overflow-hidden rounded-full bg-stone-100">
                      <div className="h-full rounded-full bg-leaf-600" style={{ width: `${(count / typeTotal) * 100}%` }} />
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>
        </>
      ) : null}

      <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-stone-900">Users</h2>
        <input
          type="search"
          aria-label="Search users"
          placeholder="Search name or email"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={`${inputClasses} ${inputOk} sm:max-w-xs`}
        />
      </div>

      <div className="mt-3 overflow-x-auto rounded-xl border border-stone-200 bg-white">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-stone-200 bg-stone-50 text-xs uppercase text-stone-500">
            <tr>
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Plants</th>
              <th className="px-4 py-3">Tasks</th>
              <th className="px-4 py-3">Joined</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {users.map((u) => {
              const isMe = u._id === me?._id
              return (
                <tr key={u._id}>
                  <td className="px-4 py-3">
                    <p className="font-medium text-stone-900">
                      {u.name} {isMe && <span className="text-xs text-stone-500">(you)</span>}
                    </p>
                    <p className="text-xs text-stone-500">{u.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      aria-label={`Role for ${u.name}`}
                      value={u.role}
                      disabled={isMe}
                      onChange={(e) => handleRole(u, e.target.value as UserRole)}
                      className="rounded-lg border border-stone-300 bg-white px-2 py-1.5 text-sm disabled:opacity-60"
                    >
                      <option value="user">user</option>
                      <option value="admin">admin</option>
                    </select>
                  </td>
                  <td className="px-4 py-3">{u.plantCount}</td>
                  <td className="px-4 py-3">{u.taskCount}</td>
                  <td className="px-4 py-3">{formatDate(u.createdAt)}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      disabled={isMe}
                      onClick={() => setToDelete(u)}
                      className="inline-flex items-center rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {usersStatus === "loading" && users.length === 0 && (
          <div className="py-8">
            <Spinner label="Loading users" />
          </div>
        )}
        {usersStatus === "failed" && <p className="p-4 text-sm text-red-600">{usersError}</p>}
        {usersStatus === "succeeded" && users.length === 0 && (
          <p className="p-6 text-center text-sm text-stone-500">No users found.</p>
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

      <ConfirmDialog
        open={toDelete !== null}
        title={`Delete ${toDelete?.name ?? "user"}?`}
        message="This permanently removes the user and all of their plants, care tasks and reminders."
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  )
}

export default AdminDashboard
