import { NavLink } from "react-router-dom"
import { useAuth } from "../../auth/useAuth"
import { useEffect, useRef } from "react"

const Sidebar = ({ isOpen, onClose }) => {
  const { logout } = useAuth()
  const sidebarRef = useRef(null)

  const navItems = [
    { path: "/dashboard", label: "Dashboard" },
    { path: "/tournaments/create", label: "Create Tournament" },
  ]

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        onClose()
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [onClose])

  const handleLogout = async () => {
    try {
      await logout()
      onClose() // Close the sidebar after logout
    } catch (error) {
      console.error("Error logging out:", error)
    }
  }

  return (
    <aside
      ref={sidebarRef}
      className={`fixed top-0 left-0 h-full w-64 bg-gray-800 text-white transform transition-transform duration-300 ease-in-out z-50 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <nav className="p-4">
        <ul className="space-y-4">
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `block p-2 rounded ${isActive ? "bg-blue-600 text-white" : "text-gray-300 hover:bg-gray-700"}`
                }
              >
                {item.label}
              </NavLink>
            </li>
          ))}
          <li>
            <button
              onClick={handleLogout}
              className="w-full text-left p-2 rounded text-white bg-red-600 hover:bg-red-700 transition-colors"
            >
              Logout
            </button>
          </li>
        </ul>
      </nav>
    </aside>
  )
}

export default Sidebar
