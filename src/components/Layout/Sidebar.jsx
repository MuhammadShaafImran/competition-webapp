import { NavLink } from "react-router-dom"

const Sidebar = () => {
  const navItems = [
    { path: "/dashboard", label: "Dashboard" },
    { path: "/tournaments/create", label: "Create Tournament" },
    { path: "/teams", label: "Manage Teams" },
    { path: "/rounds", label: "Manage Rounds" },
    { path: "/adjudicators", label: "Adjudicators" },
    { path: "/results", label: "Results & Statistics" },
  ]

  return (
    <aside className="bg-gray-100 w-64 min-h-screen p-4">
      <nav>
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `block p-2 rounded ${isActive ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-gray-200"}`
                }
              >
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  )
}

export default Sidebar
