import React from "react"

/**
 * Reusable loading component with customizable message
 * @param {Object} props - Component props
 * @param {string} [props.message="Loading..."] - Loading message to display
 * @param {string} [props.size="medium"] - Size of the spinner (small, medium, large)
 * @returns {React.ReactNode} Loading component
 */
const LoadingSpinner = ({ message = "Loading...", size = "medium" }) => {
  const sizeClasses = {
    small: "w-8 h-8 border-2",
    medium: "w-12 h-12 border-3",
    large: "w-16 h-16 border-4"
  }

  const spinnerClass = `${sizeClasses[size]} border-t-primary border-b-primary border-primary/30 rounded-full animate-spin`

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className={spinnerClass}></div>
      {message && <p className="mt-4 text-center text-muted-foreground">{message}</p>}
    </div>
  )
}

/**
 * Fullscreen loading component
 * @param {Object} props - Component props
 * @param {string} [props.message="Loading..."] - Loading message to display
 * @returns {React.ReactNode} Fullscreen loading component
 */
export const FullscreenLoading = ({ message = "Loading..." }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50">
      <LoadingSpinner message={message} size="large" />
    </div>
  )
}

export default LoadingSpinner