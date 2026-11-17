import type { ReactNode } from "react"
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom"
import Spinner from "../components/Spinner"
import AppLayout from "../layouts/AppLayout"
import AdminDashboard from "../pages/AdminDashboard"
import AddCareTask from "../pages/AddCareTask"
import AddPlant from "../pages/AddPlant"
import CareSchedule from "../pages/CareSchedule"
import Dashboard from "../pages/Dashboard"
import EditCareTask from "../pages/EditCareTask"
import EditPlant from "../pages/EditPlant"
import Login from "../pages/Login"
import MyPlants from "../pages/MyPlants"
import PlantDetails from "../pages/PlantDetails"
import Register from "../pages/Register"
import { useAppSelector } from "../redux/hooks"
import type { UserRole } from "../types"

type RequireAuthProps = {
  children: ReactNode
  roles?: UserRole[]
}

// Protected route: must be logged in (and have one of `roles` if given)
const RequireAuth = ({ children, roles }: RequireAuthProps) => {
  const { user, initialized } = useAppSelector((s) => s.auth)
  const location = useLocation()

  if (!initialized) return <Spinner fullScreen label="Loading PlantCare" />

  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />

  if (roles && !roles.includes(user.role)) {
    return (
      <div className="px-4 py-20 text-center">
        <h2 className="mb-2 text-xl font-bold">Access denied</h2>
        <p className="text-stone-600">You do not have permission to view this page.</p>
      </div>
    )
  }

  return <>{children}</>
}

// Admins manage the system only; they have no personal plants, so send them to /admin
const UserOnly = ({ children }: { children: ReactNode }) => {
  const user = useAppSelector((s) => s.auth.user)
  if (user?.role === "admin") return <Navigate to="/admin" replace />
  return <>{children}</>
}

// Login/Register are only for logged-out users
const GuestOnly = ({ children }: { children: ReactNode }) => {
  const { user, initialized } = useAppSelector((s) => s.auth)

  if (!initialized) return <Spinner fullScreen label="Loading PlantCare" />
  if (user) return <Navigate to="/" replace />

  return <>{children}</>
}

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            <GuestOnly>
              <Login />
            </GuestOnly>
          }
        />
        <Route
          path="/register"
          element={
            <GuestOnly>
              <Register />
            </GuestOnly>
          }
        />

        {/* Everything below needs a logged-in user and uses the sidebar layout */}
        <Route
          element={
            <RequireAuth>
              <AppLayout />
            </RequireAuth>
          }
        >
          <Route path="/" element={<UserOnly><Dashboard /></UserOnly>} />
          <Route path="/plants" element={<UserOnly><MyPlants /></UserOnly>} />
          {/* "new" is listed before ":id" so it is not mistaken for a plant id */}
          <Route path="/plants/new" element={<UserOnly><AddPlant /></UserOnly>} />
          <Route path="/plants/:id" element={<UserOnly><PlantDetails /></UserOnly>} />
          <Route path="/plants/:id/edit" element={<UserOnly><EditPlant /></UserOnly>} />

          <Route path="/care-schedule" element={<UserOnly><CareSchedule /></UserOnly>} />
          <Route path="/care-schedule/new" element={<UserOnly><AddCareTask /></UserOnly>} />
          <Route path="/care-schedule/:id/edit" element={<UserOnly><EditCareTask /></UserOnly>} />

          {/* Admin only: normal users see "Access denied" */}
          <Route
            path="/admin"
            element={
              <RequireAuth roles={["admin"]}>
                <AdminDashboard />
              </RequireAuth>
            }
          />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export { RequireAuth }
export default AppRouter
