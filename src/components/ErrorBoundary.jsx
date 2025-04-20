import React from "react"

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    // You can log the error to an error reporting service
    console.error("Error caught by ErrorBoundary:", error, errorInfo)
    this.setState({ errorInfo })
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return this.props.fallback ? (
        this.props.fallback(this.state.error)
      ) : (
        <div className="p-6 max-w-lg mx-auto my-8 bg-destructive/10 rounded-lg border border-destructive/20">
          <h2 className="text-xl font-bold text-destructive mb-4">Something went wrong</h2>
          <p className="mb-4">The application encountered an unexpected error.</p>
          {this.state.error && (
            <div className="p-3 bg-background rounded mb-4 overflow-auto">
              <p className="font-mono text-sm">{this.state.error.toString()}</p>
            </div>
          )}
          <button
            className="px-4 py-2 bg-primary text-primary-foreground rounded"
            onClick={() => window.location.reload()}
          >
            Reload Page
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary