import { useEffect } from "react"
import { useAppDispatch } from "./redux/hooks"
import { bootstrapAuth } from "./redux/slices/authSlice"
import AppRouter from "./router"

const App = () => {
  const dispatch = useAppDispatch()

  
  useEffect(() => {
    dispatch(bootstrapAuth())
  }, [dispatch])

  return <AppRouter />
}

export default App
