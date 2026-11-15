import type { ReactNode } from "react"

type AuthLayoutProps = {
  title: string
  subtitle: string
  children: ReactNode
  footer: ReactNode
}


const AuthLayout = ({ title, subtitle, children, footer }: AuthLayoutProps) => {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <aside className="relative hidden overflow-hidden bg-gradient-to-br from-leaf-700 via-leaf-800 to-leaf-900 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="flex items-center gap-3">
          <img src="/favicon.svg" alt="" className="h-10 w-10" />
          <span className="text-2xl font-semibold tracking-tight">PlantCare</span>
        </div>

        <div className="max-w-md">
          <h2 className="text-4xl font-bold leading-tight">Keep every plant happy, on schedule.</h2>
          <p className="mt-4 text-leaf-100">
            Track your plants, plan watering, fertilizing and pruning, and get reminders before a task is due.
          </p>
        </div>

        <p className="text-sm text-leaf-200">Grow something good today.</p>

        <div
          className="pointer-events-none absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-leaf-500/20"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -top-20 right-10 h-48 w-48 rounded-full bg-leaf-300/10"
          aria-hidden="true"
        />
      </aside>

      <main className="flex items-center justify-center px-4 py-10 sm:px-8">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            <img src="/favicon.svg" alt="" className="h-9 w-9" />
            <span className="text-xl font-semibold text-leaf-800">PlantCare</span>
          </div>

          <h1 className="text-3xl font-bold text-stone-900">{title}</h1>
          <p className="mt-2 text-stone-600">{subtitle}</p>

          <div className="mt-8">{children}</div>

          <div className="mt-6 text-center text-sm text-stone-600">{footer}</div>
        </div>
      </main>
    </div>
  )
}

export default AuthLayout
