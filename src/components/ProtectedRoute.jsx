"use client"
import { Navigate, useLocation } from "react-router-dom"
import { useAuth } from "../auth/useAuth"

/**
 * Protected route component that redirects unauthenticated users to login
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render if authenticated
 * @param {string} [props.requiredRole] - Optional role required to access the route
 * @returns {React.ReactNode} The protected children or redirect
 */
const ProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, loading, user } = useAuth()
  const location = useLocation()

  // Show loading state while authentication is being checked
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="w-16 h-16 border-t-4 border-b-4 border-primary rounded-full animate-spin"></div>
        <p className="mt-4 text-lg">Loading authentication...</p>
      </div>
    )
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Optional role-based authorization
  if (requiredRole && user?.role !== requiredRole) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-2xl font-bold text-destructive mb-2">Access Denied</h1>
        <p className="text-muted-foreground">
          You don't have the required permissions to access this page.
        </p>
        <button 
          className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded"
          onClick={() => window.history.back()}
        >
          Go Back
        </button>
      </div>
    )
  }

  return children
}

export default ProtectedRoute
