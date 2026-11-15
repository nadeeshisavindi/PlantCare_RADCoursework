import { useEffect, useState, type FormEvent } from "react"
import { Link, useNavigate } from "react-router-dom"
import FormField from "../components/FormField"
import AuthLayout from "../layouts/AuthLayout"
import { useAppDispatch, useAppSelector } from "../redux/hooks"
import { clearAuthError, register } from "../redux/slices/authSlice"
import { validateEmail, validateName, validatePassword } from "../utils/validators"

type FormErrors = { name?: string; email?: string; password?: string; confirm?: string }

const Register = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const { status, error } = useAppSelector((s) => s.auth)
  const loading = status === "loading"

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [errors, setErrors] = useState<FormErrors>({})

  useEffect(() => {
    dispatch(clearAuthError())
  }, [dispatch])

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const nextErrors: FormErrors = {
      name: validateName(name),
      email: validateEmail(email),
      password: validatePassword(password),
      confirm: confirm === password ? undefined : "Passwords do not match"
    }
    setErrors(nextErrors)
    if (Object.values(nextErrors).some(Boolean)) return

    const result = await dispatch(register({ name: name.trim(), email: email.trim(), password }))
    if (register.fulfilled.match(result)) {
      navigate("/login", { replace: true, state: { registered: true } })
    }
  }

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start tracking your plants in a minute."
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-leaf-700 hover:underline">
            Log in
          </Link>
        </>
      }
    >
      {error && (
        <div role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <FormField
          label="Full name"
          name="name"
          autoComplete="name"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={errors.name}
        />
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
          autoComplete="new-password"
          placeholder="At least 8 characters"
          hint="Use 8+ characters with at least one letter and one number."
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
        />
        <FormField
          label="Confirm password"
          type="password"
          name="confirm"
          autoComplete="new-password"
          placeholder="Repeat your password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          error={errors.confirm}
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-leaf-600 px-4 py-2.5 font-semibold text-white shadow-sm transition hover:bg-leaf-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-leaf-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Creating account..." : "Create account"}
        </button>
      </form>
    </AuthLayout>
  )
}

export default Register
