"use client"
import { Link } from "react-router-dom"
import { useAuth } from "../../auth/useAuth"

const Header = () => {
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
        <Link to="/" className="text-xl font-bold">
          BP Debate Tournament
        </Link>

        <nav className="flex items-center">
          {user ? (
            <>
              <span className="mr-4">{user.email}</span>
              <button onClick={handleLogout} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded">
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
