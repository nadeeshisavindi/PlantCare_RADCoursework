import { useEffect, useState, type ReactNode } from "react"
import { NavLink, Outlet } from "react-router-dom"
import ToastContainer from "../components/ToastContainer"
import { useAppDispatch, useAppSelector } from "../redux/hooks"
import { logout } from "../redux/slices/authSlice"
import { fetchUnreadCount } from "../redux/slices/notificationSlice"

type NavItem = { to: string; label: string; end?: boolean; icon: ReactNode; adminOnly?: boolean; userOnly?: boolean }

const iconClass = "h-5 w-5 shrink-0"

const NAV_ITEMS: NavItem[] = [
  {
    to: "/",
    label: "Dashboard",
    userOnly: true,
    end: true,
    icon: (
      <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-9.5Z" />
      </svg>
    )
  },
  {
    to: "/plants",
    label: "My Plants",
    userOnly: true,
    icon: (
      <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8m0 0c0-4 2.5-7 8-7 0 4.500-2.500 7-8 7Zm0 2c0-3-2-5.500-6-5.500 0 3.500 2 5.500 6 5.500Z" />
      </svg>
    )
  },
  {
    to: "/care-schedule",
    label: "Care Schedule",
    userOnly: true,
    icon: (
      <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 3v3m8-3v3M4 9h16M5 5h14a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Zm4 9 2 2 4-4" />
      </svg>
    )
  },
  {
    to: "/notifications",
    label: "Notifications",
    userOnly: true,
    icon: (
      <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 9a6 6 0 1 1 12 0c0 5 2 6 2 6H4s2-1 2-6Zm4 9a2 2 0 0 0 4 0" />
      </svg>
    )
  },
  {
    to: "/admin",
    label: "Admin",
    adminOnly: true,
    icon: (
      <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3 4 6v6c0 4.500 3.400 8 8 9 4.600-1 8-4.500 8-9V6l-8-3Zm-3 9 2 2 4-4" />
      </svg>
    )
  }
]

const linkClass = ({ isActive }: { isActive: boolean }): string =>
  `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-leaf-500 ${
    isActive ? "bg-leaf-100 text-leaf-900" : "text-stone-600 hover:bg-stone-100 hover:text-stone-900"
  }`

const AppLayout = () => {
  const dispatch = useAppDispatch()
  const user = useAppSelector((s) => s.auth.user)
  const unreadCount = useAppSelector((s) => s.notifications.unreadCount)
  const [menuOpen, setMenuOpen] = useState(false)

  // Badge on the Notifications link: check now, then once a minute (users only)
  useEffect(() => {
    if (user?.role !== "user") return
    dispatch(fetchUnreadCount())
    const timer = setInterval(() => dispatch(fetchUnreadCount()), 60_000)
    return () => clearInterval(timer)
  }, [dispatch, user?.role])

  const nav = (
    <nav aria-label="Main" className="flex flex-col gap-1">
      {NAV_ITEMS.filter((item) => (item.adminOnly ? user?.role === "admin" : !(item.userOnly && user?.role === "admin"))).map((item) => (
        <NavLink key={item.to} to={item.to} end={item.end} className={linkClass} onClick={() => setMenuOpen(false)}>
          {item.icon}
          <span className="flex-1">{item.label}</span>
          {item.to === "/notifications" && unreadCount > 0 && (
            <span
              className="rounded-full bg-red-600 px-2 py-0.5 text-xs font-semibold text-white"
              aria-label={`${unreadCount} unread`}
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </NavLink>
      ))}
    </nav>
  )

  const account = (
    <div className="border-t border-stone-200 pt-4">
      <p className="truncate text-sm font-medium text-stone-900">{user?.name}</p>
      <p className="truncate text-xs text-stone-500">{user?.email}</p>
      <button
        type="button"
        onClick={() => dispatch(logout())}
        className="mt-3 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm font-medium text-stone-700 transition hover:bg-stone-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-leaf-500"
      >
        Log out
      </button>
    </div>
  )

  const brand = (
    <div className="flex items-center gap-2">
      <img src="/favicon.svg" alt="" className="h-8 w-8" />
      <span className="text-lg font-semibold text-leaf-800">PlantCare</span>
    </div>
  )

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col gap-6 border-r border-stone-200 bg-white p-5 lg:flex">
        {brand}
        <div className="flex-1">{nav}</div>
        {account}
      </aside>

      {/* Mobile / tablet top bar */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-stone-200 bg-white px-4 py-3 lg:hidden">
        {brand}
        <button
          type="button"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          onClick={() => setMenuOpen((open) => !open)}
          className="rounded-lg p-2 text-stone-700 hover:bg-stone-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-leaf-500"
        >
          <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            {menuOpen ? (
              <path strokeLinecap="round" d="M6 6l12 12M18 6 6 18" />
            ) : (
              <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
            )}
          </svg>
        </button>
      </header>

      {menuOpen && (
        <div id="mobile-menu" className="fixed inset-x-0 top-[57px] z-20 border-b border-stone-200 bg-white p-4 shadow-lg lg:hidden">
          <div className="flex flex-col gap-4">
            {nav}
            {account}
          </div>
        </div>
      )}

      <main className="lg:pl-64">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <Outlet />
        </div>
      </main>

      <ToastContainer />
    </div>
  )
}

export default AppLayout
