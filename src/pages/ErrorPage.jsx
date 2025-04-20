import { useEffect } from "react"
import { Link, useNavigate, useRouteError, useLocation } from "react-router-dom"
import { useAuth } from "../auth/useAuth"

/**
 * Enhanced error page that handles various error scenarios
 */
const ErrorPage = ({ statusCode, errorMessage }) => {
  const error = useRouteError()
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated } = useAuth()
  
  // Get error details from props, route error, or location state
  const status = statusCode || error?.status || location.state?.statusCode || 404
  const message = errorMessage || error?.message || location.state?.errorMessage || "The page you are looking for doesn't exist or has been moved."
  
  // Log the error to console for debugging
  useEffect(() => {
    console.error("Application error:", { status, message, error, location })
  }, [status, message, error, location])
  
  // Determine page title based on status code
  const getErrorTitle = () => {
    switch (status) {
      case 403:
        return "Access Denied"
      case 500:
        return "Server Error"
      case 503:
        return "Service Unavailable"
      default:
        return "Page Not Found"
    }
  }
  
  // Handle going back
  const handleGoBack = () => {
    navigate(-1)
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <h1 className="text-4xl font-bold text-red-600 mb-4">{status}</h1>
        <h2 className="text-2xl font-semibold mb-4">{getErrorTitle()}</h2>
        <p className="text-gray-600 mb-6">{message}</p>
        
        <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-3 justify-center">
          <button 
            onClick={handleGoBack}
            className="px-6 py-3 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Go Back
          </button>
          
          <Link 
            to={isAuthenticated ? "/dashboard" : "/login"} 
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {isAuthenticated ? "Go to Dashboard" : "Go to Login"}
          </Link>
        </div>
        
        {/* Only show this for server errors */}
        {(status === 500 || status === 503) && (
          <div className="mt-6 p-4 bg-gray-100 rounded text-left">
            <h3 className="font-semibold mb-2">Troubleshooting:</h3>
            <ul className="list-disc pl-5 text-sm text-gray-700">
              <li>Try refreshing the page</li>
              <li>Check your internet connection</li>
              <li>Clear your browser cache</li>
              <li>Try again later</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}

export default ErrorPage
