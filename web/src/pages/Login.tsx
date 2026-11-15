import { useEffect, useState, type FormEvent } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import FormField from "../components/FormField"
import AuthLayout from "../layouts/AuthLayout"
import { useAppDispatch, useAppSelector } from "../redux/hooks"
import { clearAuthError, login } from "../redux/slices/authSlice"
import { validateEmail } from "../utils/validators"

type LocationState = { from?: string; registered?: boolean } | null

const Login = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const state = location.state as LocationState

  const { status, error } = useAppSelector((s) => s.auth)
  const loading = status === "loading"

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})


  useEffect(() => {
    dispatch(clearAuthError())
  }, [dispatch])

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const nextErrors = {
      email: validateEmail(email),
      password: password ? undefined : "Password is required"
    }
    setErrors(nextErrors)
    if (nextErrors.email || nextErrors.password) return

    const result = await dispatch(login({ email: email.trim(), password }))
    if (login.fulfilled.match(result)) {
      navigate(state?.from ?? "/", { replace: true })
    }
  }

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Log in to see how your plants are doing."
      footer={
        <>
          New to PlantCare?{" "}
          <Link to="/register" className="font-medium text-leaf-700 hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      {state?.registered && (
        <div role="status" className="mb-4 rounded-lg border border-leaf-200 bg-leaf-50 px-4 py-3 text-sm text-leaf-800">
          Account created. Please log in.
        </div>
      )}

      {error && (
        <div role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <FormField
          label="Email"
          type="email"
          name="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
        />
        <FormField
          label="Password"
          type="password"
          name="password"
          autoComplete="current-password"
          placeholder="Your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-leaf-600 px-4 py-2.5 font-semibold text-white shadow-sm transition hover:bg-leaf-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-leaf-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Logging in..." : "Log in"}
        </button>
      </form>
    </AuthLayout>
  )
}

export default Login
