"use client"
import { Link } from "react-router-dom"
import { useAuth } from "../../auth/useAuth"

const Header = ({ onMenuClick }) => {
  const { user, logout } = useAuth()

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error("Error logging out:", error)
    }
  }

  return (
    <header className="bg-gray-800 text-white">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center">
          {user && (
            <button
              onClick={onMenuClick}
              className="mr-4 p-2 rounded hover:bg-gray-700 focus:outline-none"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          )}
          <Link to="/" className="text-xl font-bold">
            BP Debate Tournament
          </Link>
        </div>

        <nav className="flex items-center">
          {user ? (
            <>
              <span className="mr-4">{user.email}</span>
              <button 
                onClick={handleLogout} 
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            <Link to="/login" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
              Login
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}

export default Header
