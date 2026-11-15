import { Link } from "react-router-dom"
import { useAppSelector } from "../redux/hooks"
import { btnPrimary } from "../utils/ui"


const Dashboard = () => {
  const user = useAppSelector((s) => s.auth.user)

  return (
    <div>
      <h1 className="text-2xl font-bold text-stone-900">Hello, {user?.name} 🌱</h1>
      <p className="mt-1 text-stone-600">Welcome to PlantCare. Your dashboard will show your plant care activity here.</p>

      <div className="mt-6 rounded-2xl border border-leaf-100 bg-white p-6 shadow-sm">
        <h2 className="font-semibold text-stone-900">Get started</h2>
        <p className="mt-1 text-sm text-stone-600">Add the plants you look after so you can schedule watering and care.</p>
        <Link to="/plants/new" className={`${btnPrimary} mt-4`}>
          Add your first plant
        </Link>
      </div>
    </div>
  )
}

export default Dashboard
