import { BrowserRouter as Router } from "react-router-dom"
import { AuthProvider } from "./auth/AuthProvider"
import AppRoutes from "./routes/AppRoutes"
import ErrorBoundary from "./components/ErrorBoundary"
import "./index.css"

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  )
}

export default App
