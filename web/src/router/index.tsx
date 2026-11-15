import type { ReactNode } from "react"
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom"
import Spinner from "../components/Spinner"
import AppLayout from "../layouts/AppLayout"
import AddPlant from "../pages/AddPlant"
import Dashboard from "../pages/Dashboard"
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

        {}
        <Route
          element={
            <RequireAuth>
              <AppLayout />
            </RequireAuth>
          }
        >
          <Route path="/" element={<Dashboard />} />
          <Route path="/plants" element={<MyPlants />} />
          {}
          <Route path="/plants/new" element={<AddPlant />} />
          <Route path="/plants/:id" element={<PlantDetails />} />
          <Route path="/plants/:id/edit" element={<EditPlant />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export { RequireAuth }
export default AppRouter
